from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class AlarmEvent(BaseModel):
    tipo: str = Field(..., description="Tipo de alarma")
    hora: str = Field(..., description="Fecha y hora del evento")
    vehiculo: str = Field(..., description="Patente del vehículo")
    conductor: str = Field(..., description="Nombre del conductor")
    comentario: Optional[str] = Field(None, description="Comentarios del evento")
    severidad: Optional[str] = Field(None, description="Severidad del evento")

class ExcelSummary(BaseModel):
    tipo: str = Field(..., description="Tipo de alarma")
    cantidad: int = Field(..., description="Cantidad de alarmas")

class ExcelData(BaseModel):
    summary: List[ExcelSummary] = Field(..., description="Resumen de alarmas")
    videos: List[AlarmEvent] = Field(..., description="Eventos de video/alarmas")
    videos_solicitados: List[AlarmEvent] = Field(default_factory=list, description="Videos solicitados")
    file_name: str = Field(..., description="Nombre del archivo procesado")

class ProcessedReport(BaseModel):
    id: Optional[str] = Field(None, description="ID del reporte en Firestore")
    user_id: str = Field(..., description="ID del usuario que procesó el archivo")
    file_name: str = Field(..., description="Nombre del archivo original")
    vehicle_plate: str = Field(..., description="Patente principal del vehículo")
    date_range: Dict[str, str] = Field(..., description="Rango de fechas del reporte")
    summary: Dict[str, Any] = Field(..., description="Resumen de métricas")
    events: List[Dict[str, Any]] = Field(..., description="Eventos procesados")
    charts: Dict[str, Any] = Field(..., description="Datos para gráficos")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de actualización")
    status: str = Field(default="processing", description="Estado del procesamiento")
    operation: Optional[str] = Field(None, description="Operación realizada (created/updated)")

class ChartData(BaseModel):
    labels: List[str] = Field(..., description="Etiquetas del gráfico")
    data: List[float] = Field(..., description="Datos del gráfico")
    backgroundColor: List[str] = Field(..., description="Colores de fondo")
