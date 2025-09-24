from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from ..models.excel import ProcessedReport
from ..utils.excel_parser import ExcelParser
from ..core.firebase import firebase_manager

class ExcelService:
    def __init__(self):
        self.parser = ExcelParser()
        self.db = firebase_manager.get_db()
        self.storage = firebase_manager.get_storage()
    
    async def process_excel_file(self, file_content: bytes, filename: str, user_id: str = "demo_user") -> ProcessedReport:
        """Process Excel file and save to Firestore"""
        try:
            # Parse Excel file
            excel_data = self.parser.parse_excel_file(file_content, filename)
            
            # Generate report
            report = self.parser.generate_report(excel_data, user_id)
            
            # Save to Firestore
            report_id = await self._save_report_to_firestore(report)
            
            # Update report with ID
            report.id = report_id
            
            return report
        except Exception as e:
            raise ValueError(f"Error processing Excel file: {str(e)}")
    
    async def _save_report_to_firestore(self, report: ProcessedReport) -> str:
        """Save report to Firestore"""
        try:
            # Convert datetime to timestamp for Firestore
            report_dict = report.dict()
            report_dict['created_at'] = datetime.utcnow()
            report_dict['updated_at'] = datetime.utcnow()
            
            # Generate document ID
            doc_id = str(uuid.uuid4())
            
            # Save to Firestore
            doc_ref = self.db.collection('reports').document(doc_id)
            doc_ref.set(report_dict)
            
            return doc_id
        except Exception as e:
            raise ValueError(f"Error saving report to Firestore: {str(e)}")
    
    async def get_report(self, report_id: str) -> Optional[ProcessedReport]:
        """Get report by ID from Firestore"""
        try:
            doc_ref = self.db.collection('reports').document(report_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return ProcessedReport(**data)
            return None
        except Exception as e:
            raise ValueError(f"Error getting report: {str(e)}")
    
    async def get_user_reports(self, user_id: str, limit: int = 50) -> List[ProcessedReport]:
        """Get all reports for a user"""
        try:
            query = (self.db.collection('reports')
                    .where('user_id', '==', user_id)
                    .order_by('created_at', direction='DESCENDING')
                    .limit(limit))
            
            docs = query.stream()
            reports = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                reports.append(ProcessedReport(**data))
            
            return reports
        except Exception as e:
            raise ValueError(f"Error getting user reports: {str(e)}")
    
    async def delete_report(self, report_id: str) -> bool:
        """Delete report by ID"""
        try:
            doc_ref = self.db.collection('reports').document(report_id)
            doc_ref.delete()
            return True
        except Exception as e:
            raise ValueError(f"Error deleting report: {str(e)}")
    
    async def get_reports_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary statistics for user reports"""
        try:
            query = (self.db.collection('reports')
                    .where('user_id', '==', user_id))
            
            docs = query.stream()
            
            total_reports = 0
            total_alarms = 0
            total_vehicles = set()
            
            for doc in docs:
                total_reports += 1
                data = doc.to_dict()
                total_alarms += data.get('summary', {}).get('totalAlarms', 0)
                vehicle_plate = data.get('vehicle_plate', '')
                if vehicle_plate:
                    total_vehicles.add(vehicle_plate)
            
            return {
                'totalReports': total_reports,
                'totalAlarms': total_alarms,
                'totalVehicles': len(total_vehicles),
                'lastUpdated': datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise ValueError(f"Error getting reports summary: {str(e)}")
