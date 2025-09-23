import pandas as pd
from typing import List, Dict, Any, Tuple
import re
import unicodedata
from datetime import datetime
from ..models.excel import ExcelData, ExcelSummary, AlarmEvent, ProcessedReport, ChartData

class ExcelParser:
    def __init__(self):
        self.alarm_colors = {
            'cinturon': '#d32f2f',
            'distraido': '#f57c00',
            'cruce': '#7b1fa2',
            'distancia': '#1976d2',
            'fatiga': '#ebe983',
            'frenada': '#26b170',
            'stop': '#665757',
            'telefono': '#00695c',
            'boton': '#5eb8a1',
            'video': '#c290e0'
        }
    
    def parse_excel_file(self, file_content: bytes, filename: str) -> ExcelData:
        """Parse Excel file and return structured data"""
        try:
            # Read Excel file
            df_summary = pd.read_excel(file_content, sheet_name='Hoja1' or 'Hoja2', header=None)
            df_videos = pd.read_excel(file_content, sheet_name='Vídeos', header=None)
            
            # Parse summary data
            summary_data = self._parse_summary(df_summary)
            
            # Parse videos data
            videos_data, videos_solicitados = self._parse_videos(df_videos)
            
            return ExcelData(
                summary=summary_data,
                videos=videos_data,
                videos_solicitados=videos_solicitados,
                file_name=filename
            )
        except Exception as e:
            raise ValueError(f"Error parsing Excel file: {str(e)}")
    
    def _parse_summary(self, df: pd.DataFrame) -> List[ExcelSummary]:
        """Parse summary sheet data"""
        summary = []
        
        # Find the header row first
        header_row = None
        for i in range(len(df)):
            row = df.iloc[i]
            row_str = ' '.join([str(cell) for cell in row if pd.notna(cell)])
            if any(keyword in row_str.lower() for keyword in ['tipo', 'alarma', 'eventos']):
                header_row = i
                break
        
        if header_row is None:
            # If no header found, start from row 2
            header_row = 2
        
        # Start parsing from the row after header
        start_row = header_row + 1
        
        for i in range(start_row, len(df)):
            row = df.iloc[i]
            
            # Skip empty rows
            if pd.isna(row[0]) and pd.isna(row[1]):
                continue
                
            tipo = str(row[0]).strip() if pd.notna(row[0]) else ''
            
            # Try to convert quantity to int, if fails skip this row
            try:
                cantidad = int(row[1]) if pd.notna(row[1]) and str(row[1]).strip() else 0
            except (ValueError, TypeError):
                # Skip rows where quantity is not a valid number
                continue
                
            # Skip empty rows and totals
            if (tipo and 
                not tipo.lower().startswith('total') and 
                tipo != '(en blanco)' and
                tipo.lower() != 'cuenta de tipo' and
                not tipo.lower().startswith('subtotal')):
                summary.append(ExcelSummary(tipo=tipo, cantidad=cantidad))
        
        return summary
    
    def _parse_videos(self, df: pd.DataFrame) -> Tuple[List[AlarmEvent], List[AlarmEvent]]:
        """Parse videos sheet data"""
        videos = []
        videos_solicitados = []
        
        # Get headers to understand column structure
        headers = df.iloc[0]
        
        for i in range(1, len(df)):
            row = df.iloc[i]
            
            if pd.notna(row[0]) and str(row[0]).strip():
                event = AlarmEvent(
                    tipo=str(row[0]).strip() if pd.notna(row[0]) else '',
                    hora=str(row[1]).strip() if pd.notna(row[1]) else '',
                    vehiculo=str(row[3]).strip() if pd.notna(row[3]) else '',
                    conductor=str(row[4]).strip() if pd.notna(row[4]) else '',
                    comentario=str(row[6]).strip() if pd.notna(row[6]) else '',
                    severidad=str(row[7]).strip() if pd.notna(row[7]) else ''
                )
                
                # Separate videos solicitados from other events
                if ('video solicitado' in event.tipo.lower() or 
                    'vídeo solicitado' in event.tipo.lower()):
                    videos_solicitados.append(event)
                else:
                    videos.append(event)
        
        return videos, videos_solicitados
    
    def generate_report(self, excel_data: ExcelData, user_id: str = "demo_user") -> ProcessedReport:
        """Generate processed report from Excel data"""
        
        # Extract vehicle plate(s)
        all_vehicles = list(set([
            event.vehiculo for event in excel_data.videos + excel_data.videos_solicitados
            if event.vehiculo
        ]))
        vehicle_plate = all_vehicles[0] if all_vehicles else "Desconocido"
        
        # Extract date range from filename
        date_range = self._extract_date_range(excel_data.file_name)
        
        # Generate summary metrics
        total_alarms = len(excel_data.videos)
        videos_requested = len(excel_data.videos_solicitados)
        
        # Count alarm types
        alarm_types = {}
        for event in excel_data.videos:
            if event.tipo:
                alarm_types[event.tipo] = alarm_types.get(event.tipo, 0) + 1
        
        # Generate chart data
        charts = self._generate_chart_data(excel_data)
        
        # Convert events to dict format
        events = [
            {
                "timestamp": event.hora,
                "alarmType": event.tipo,
                "vehiclePlate": event.vehiculo,
                "driver": event.conductor,
                "comments": event.comentario,
                "severity": event.severidad
            }
            for event in excel_data.videos
        ]
        
        summary = {
            "totalAlarms": total_alarms,
            "alarmTypes": alarm_types,
            "videosRequested": videos_requested
        }
        
        return ProcessedReport(
            user_id=user_id,
            file_name=excel_data.file_name,
            vehicle_plate=vehicle_plate,
            date_range=date_range,
            summary=summary,
            events=events,
            charts=charts,
            status="completed"
        )
    
    def _extract_date_range(self, filename: str) -> Dict[str, str]:
        """Extract date range from filename"""
        date_range = {"start": "", "end": ""}
        
        try:
            # Look for patterns like "04 al 16 de septiembre"
            rango_match = re.search(r'(\d{2})\s*al\s*(\d{2})\s*de\s*([a-zA-Záéíóúñ]+)', filename, re.IGNORECASE)
            if rango_match:
                date_range["start"] = f"{rango_match.group(1)} de {rango_match.group(3)}"
                date_range["end"] = f"{rango_match.group(2)} de {rango_match.group(3)}"
            else:
                # Look for single date pattern like "16 de septiembre"
                fecha_match = re.search(r'(\d{2})\s*de\s*([a-zA-Záéíóúñ]+)', filename, re.IGNORECASE)
                if fecha_match:
                    date_range["start"] = f"{fecha_match.group(1)} de {fecha_match.group(2)}"
                    date_range["end"] = date_range["start"]
        except Exception:
            pass
        
        return date_range
    
    def _generate_chart_data(self, excel_data: ExcelData) -> Dict[str, Any]:
        """Generate chart data from Excel data"""
        
        # Alarm type distribution
        alarm_counts = {}
        for event in excel_data.videos:
            if event.tipo and 'video solicitado' not in event.tipo.lower():
                alarm_counts[event.tipo] = alarm_counts.get(event.tipo, 0) + 1
        
        alarm_labels = list(alarm_counts.keys())
        alarm_data = list(alarm_counts.values())
        alarm_colors = [self._get_alarm_color(label) for label in alarm_labels]
        
        # Daily evolution
        daily_counts = {}
        for event in excel_data.videos:
            if event.hora:
                try:
                    day = event.hora.split(',')[0].strip()
                    daily_counts[day] = daily_counts.get(day, 0) + 1
                except:
                    pass
        
        daily_labels = sorted(daily_counts.keys())
        daily_data = [daily_counts[day] for day in daily_labels]
        
        # Hourly distribution
        hourly_counts = {}
        for i in range(24):
            hourly_counts[f"{i:02d}:00"] = 0
        
        for event in excel_data.videos:
            if event.hora:
                try:
                    time_part = event.hora.split(',')[1].strip()
                    hour = time_part.split(':')[0]
                    hour_key = f"{int(hour):02d}:00"
                    if hour_key in hourly_counts:
                        hourly_counts[hour_key] += 1
                except:
                    pass
        
        hourly_labels = list(hourly_counts.keys())
        hourly_data = list(hourly_counts.values())
        
        return {
            "alarmTypeDistribution": {
                "labels": alarm_labels,
                "data": alarm_data,
                "backgroundColor": alarm_colors
            },
            "dailyEvolution": {
                "labels": daily_labels,
                "data": daily_data
            },
            "hourlyDistribution": {
                "labels": hourly_labels,
                "data": hourly_data
            }
        }
    
    def _get_alarm_color(self, alarm_type: str) -> str:
        """Get color for alarm type"""
        # Normalize string: remove accents and convert to lowercase
        normalized = unicodedata.normalize('NFD', alarm_type.lower())
        normalized = re.sub(r'[\u0300-\u036f]', '', normalized)
        
        for key, color in self.alarm_colors.items():
            if key in normalized:
                return color
        
        return '#64b5f6'  # Default color
