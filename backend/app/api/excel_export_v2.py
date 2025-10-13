from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import json
from datetime import datetime
from zoneinfo import ZoneInfo

from ..services.excel_export_service_v2 import excel_export_service_v2

router = APIRouter()

@router.post("/export/excel/v2")
async def export_report_to_excel_v2(data: Dict[str, Any]):
    """
    Endpoint para exportar reportes de Excel usando plantillas con estilos preservados.
    
    Esta versión mejorada soporta:
    - Descarga de plantillas desde Cloud Storage (prioridad)
    - Fallback a sistema de archivos local (desarrollo)
    - Preservación completa de estilos y formatos
    - Limpieza automática de archivos temporales
    
    Args:
        data: Diccionario con los datos del reporte:
            - current_report: Datos del reporte actual
            - filtered_events: Lista de eventos filtrados
            - selected_company: Empresa seleccionada
    
    Returns:
        StreamingResponse: Archivo Excel generado con formato profesional
    
    Raises:
        HTTPException: Si hay errores en la generación del archivo
    """
    try:
        print(f"Recibida solicitud de exportación Excel v2:")
        print(f"- Eventos: {len(data.get('filtered_events', []))}")
        print(f"- Empresa: {data.get('selected_company', 'N/A')}")
        print(f"- Vehículo: {data.get('current_report', {}).get('vehicle_plate', 'N/A')}")
        
        # Generar el archivo Excel usando el servicio mejorado
        excel_content = excel_export_service_v2.export_report_to_excel(data)
        
        # Generar nombre de archivo
        current_report = data.get('current_report', {})
        selected_company = data.get('selected_company', '')
        vehicle_plate = current_report.get('vehicle_plate', 'reporte')
        santiago_now = datetime.now(ZoneInfo('America/Santiago'))
        timestamp = santiago_now.strftime('%Y%m%d_%H%M')
        
        company_suffix = f"_{selected_company.replace(' ', '_')}" if selected_company else ""
        filename = f"reporte_conducción_{vehicle_plate}{company_suffix}_{timestamp}.xlsx"
        
        # Configurar headers para la descarga
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
        
        print(f"Archivo Excel generado: {filename} ({len(excel_content)} bytes)")
        
        # Devolver el archivo como streaming response
        return StreamingResponse(
            iter([excel_content]),
            headers=headers,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except Exception as e:
        print(f"Error en exportación Excel v2: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar archivo Excel: {str(e)}"
        )

@router.get("/export/excel/v2/status")
async def get_export_status_v2():
    """
    Endpoint para verificar el estado del servicio de exportación v2
    
    Returns:
        dict: Información sobre el estado del servicio
    """
    try:
        service_status = {
            "service": "excel_export_v2",
            "status": "active",
            "version": "2.0",
            "features": [
                "Cloud Storage template support",
                "Local file fallback",
                "Style preservation",
                "Automatic cleanup"
            ],
            "template_sources": []
        }
        
        # Verificar fuentes de plantillas disponibles
        try:
            # Intentar obtener información sobre Storage
            if excel_export_service_v2.bucket:
                service_status["template_sources"].append("Cloud Storage (primary)")
            else:
                service_status["template_sources"].append("Cloud Storage (unavailable)")
        except:
            service_status["template_sources"].append("Cloud Storage (error)")
        
        # Verificar archivo local
        import os
        if os.path.exists(excel_export_service_v2.local_template_path):
            service_status["template_sources"].append("Local file (fallback)")
        else:
            service_status["template_sources"].append("Local file (missing)")
        
        return service_status
        
    except Exception as e:
        return {
            "service": "excel_export_v2",
            "status": "error",
            "error": str(e)
        }
