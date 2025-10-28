import pandas as pd
import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import os

class GeneradorDatosAlarma:
    """
    Clase para generar datos ficticios realistas de alarmas de conducción
    que imitan la estructura del archivo Excel de referencia.
    """
    
    def __init__(self):
        # Tipos de alarma disponibles
        self.tipos_alarma = [
            "Botón de alerta",
            "Cinturón de seguridad", 
            "Conductor distraído",
            "Cruce de carril",
            "Infracción de señal de stop",
            "Vídeo solicitado",
            "Distancia de Seguridad",
            "Teléfono Móvil",
            "Fatiga"
        ]
        
        # Comentarios específicos para cada tipo de alarma
        self.comentarios_alarma = {
            "Botón de alerta": [
                "Video muestra vehículo estacionado. / JLS.",
                "Conductor activó botón de emergencia manualmente.",
                "Situación de riesgo detectada por el conductor.",
                "Botón presionado durante maniobra compleja."
            ],
            "Cinturón de seguridad": [
                "Conductor sin cinturón de seguridad detectado.",
                "Sensor de cinturón desactivado durante la conducción.",
                "Cinturón de seguridad no abrochado al iniciar viaje.",
                "Detección de cinturón desabrochado en movimiento."
            ],
            "Conductor distraído": [
                "Conductor mirando hacia abajo por más de 3 segundos.",
                "Detección de distracción visual prolongada.",
                "Conductor no mantiene atención en la carretera.",
                "Posible uso de dispositivo móvil detectado."
            ],
            "Cruce de carril": [
                "Cambio de carril sin señalizar debidamente.",
                "Vehículo cruzando línea continua de carril.",
                "Maniobra de cambio de carril peligrosa detectada.",
                "Cruce involuntario de carril detectado."
            ],
            "Infracción de señal de stop": [
                "Vehículo no detuvo completamente en señal de stop.",
                "Paso semaforizado sin detención completa.",
                "Infracción de señal de alto detectada.",
                "Detención parcial en señal de stop."
            ],
            "Vídeo solicitado": [
                "Video solicitado por supervisor de flota.",
                "Revisión de evento específico solicitada.",
                "Video requerido para análisis de incidente.",
                "Solicitud de video para auditoría de conducción."
            ],
            "Distancia de Seguridad": [
                "Distancia de seguimiento demasiado corta.",
                "Colisión por alcance evitada por poco.",
                "Mantenimiento de distancia insegura detectado.",
                "Seguimiento cercano peligroso detectado."
            ],
            "Teléfono Móvil": [
                "Uso de teléfono móvil mientras conduce detectado.",
                "Conductor manipulando dispositivo electrónico.",
                "Detección de teléfono en mano durante conducción.",
                "Uso de celular prohibido detectado por cámara."
            ],
            "Fatiga": [
                "Signos de fatiga detectados en el conductor.",
                "Bostezos frecuentes y somnolencia detectada.",
                "Conductor muestra síntomas de cansancio extremo.",
                "Detección de microsueños durante la conducción."
            ]
        }
        
        # Posiciones geográficas ficticias pero realistas (Chile)
        self.posiciones_geograficas = [
            "Carretera Panamericana Sur, 5500000 Calbuco",
            "Carretera Panamericana Sur, 5550000 Puerto Varas", 
            "Carretera Panamericana Sur, 5300000 Río Negro",
            "Carretera Panamericana Sur, 5550000 Frutillar",
            "Carretera Panamericana Sur, 5500000 Puerto Montt",
            "Carretera Panamericana Sur, 5310000 Osorno",
            "Carretera Panamericana, 5300000 Purranque",
            "Carretera Panamericana Sur, 5310000 San Pablo",
            "208, 5220000 La Unión",
            "T-715, 5220000 La Unión",
            "T-716, 5220000 La Unión",
            "Calle Arturo Prat, 5220000 La Unión",
            "Calle a Valdivia, 5220000 La Unión",
            "O'Higgins, 5550000 Fresia",
            "Calle Pedro Felix Oyarzun, 5500000 Calbuco",
            "V-843, 5500000 Calbuco",
            "V-85, 5500000 Calbuco",
            "U-330, 5300000 San Juan de la Costa",
            "Calle a Frutillar, 5550000 Llanquihue",
            "Camino Pilauco, 5310000 Osorno",
            "Unnamed road, 540 San Juan de la Costa",
            "Ruta Cinco Sur, 5500000 Puerto Montt",
            "Calle a Puerto Varas, 5550000 Llanquihue"
        ]
        
        # Nombres de conductores ficticios
        self.nombres_conductores = [
            "Juan Pérez Silva",
            "María González Rodríguez", 
            "Carlos López Muñoz",
            "Ana Martínez Fernández",
            "Luis Sánchez Torres",
            "Carmen Ramírez Vargas",
            "Pedro Morales Díaz",
            "Laura Castro Rojas",
            "Roberto Herrera Jiménez",
            "Sofía Alvarez Medina"
        ]
        
        # Estados de video posibles
        self.estados_video = ["Disponible", "—", "Procesando", "Eliminado"]
        
        # Severidades de evento
        self.severidades = ["Leve", "Moderado", "Grave", "Crítico", "—"]
    
    def generar_fecha_aleatoria(self, fecha_inicio: datetime, fecha_fin: datetime) -> datetime:
        """Genera una fecha y hora aleatoria dentro del rango especificado"""
        delta = fecha_fin - fecha_inicio
        dias_aleatorios = random.randint(0, delta.days)
        segundos_aleatorios = random.randint(0, 86400)  # Segundos en un día
        return fecha_inicio + timedelta(days=dias_aleatorios, seconds=segundos_aleatorios)
    
    def formatear_fecha(self, fecha: datetime) -> str:
        """Formatea la fecha al estilo del archivo de referencia"""
        return fecha.strftime("%d/%m/%y, %H:%M:%S")
    
    def generar_distribucion_alarmas(self, total_eventos: int) -> Dict[str, int]:
        """
        Genera una distribución realista de tipos de alarma
        basada en patrones típicos de conducción
        """
        # Distribución porcentual realista basada en el archivo de referencia
        distribucion = {
            "Conductor distraído": 0.45,      # 45%
            "Cruce de carril": 0.25,          # 25%
            "Cinturón de seguridad": 0.10,    # 10%
            "Infracción de señal de stop": 0.08, # 8%
            "Teléfono Móvil": 0.05,           # 5%
            "Fatiga": 0.03,                   # 3%
            "Distancia de Seguridad": 0.02,    # 2%
            "Botón de alerta": 0.01,          # 1%
            "Vídeo solicitado": 0.01          # 1%
        }
        
        resultado = {}
        eventos_asignados = 0
        
        # Asignar eventos según la distribución
        for tipo, porcentaje in distribucion.items():
            cantidad = int(total_eventos * porcentaje)
            if cantidad > 0:
                resultado[tipo] = cantidad
                eventos_asignados += cantidad
        
        # Asignar eventos restantes aleatoriamente
        eventos_restantes = total_eventos - eventos_asignados
        for _ in range(eventos_restantes):
            tipo = random.choice(self.tipos_alarma)
            resultado[tipo] = resultado.get(tipo, 0) + 1
        
        return resultado
    
    def generar_eventos_detalle(self, 
                               distribucion: Dict[str, int], 
                               empresa: str,
                               patente: str,
                               fecha_inicio: datetime,
                               fecha_fin: datetime) -> List[Dict]:
        """
        Genera los eventos detallados para la hoja "Vídeos"
        """
        eventos = []
        
        for tipo_alarma, cantidad in distribucion.items():
            for _ in range(cantidad):
                # Generar fecha y hora aleatoria
                fecha_evento = self.generar_fecha_aleatoria(fecha_inicio, fecha_fin)
                
                # Seleccionar estado de video (solo algunos tienen "Disponible")
                if tipo_alarma in ["Botón de alerta", "Vídeo solicitado"]:
                    estado_video = random.choice(["Disponible", "—"])
                else:
                    estado_video = "—"
                
                # Generar comentario específico para el tipo de alarma
                if tipo_alarma in ["Botón de alerta", "Vídeo solicitado"]:
                    comentario = random.choice(self.comentarios_alarma[tipo_alarma])
                else:
                    comentario = "—"
                
                # Generar severidad (solo algunos tienen severidad definida)
                if random.random() < 0.3:  # 30% de probabilidad de tener severidad
                    severidad = random.choice(self.severidades[:-1])  # Excluir "—"
                else:
                    severidad = "—"
                
                evento = {
                    "Tipo": tipo_alarma,
                    "Hora": self.formatear_fecha(fecha_evento),
                    "Estado de vídeo": estado_video,
                    "Vehículo": f"{empresa} - {patente}",
                    "Conductor": random.choice(self.nombres_conductores),
                    "Posición": random.choice(self.posiciones_geograficas),
                    "Último comentario": comentario,
                    "Severidad del evento de conducción": severidad
                }
                
                eventos.append(evento)
        
        # Ordenar eventos por fecha
        eventos.sort(key=lambda x: x["Hora"])
        
        return eventos
    
    def generar_resumen(self, distribucion: Dict[str, int]) -> List[Dict]:
        """
        Genera los datos para la hoja "Hoja1" con el resumen de alarmas
        """
        resumen = []
        
        # Agregar cada tipo de alarma con su cantidad
        for tipo, cantidad in distribucion.items():
            if cantidad > 0:
                resumen.append({
                    "Etiquetas de fila": tipo,
                    "Cuenta de Tipo": cantidad
                })
        
        # Agregar línea en blanco
        resumen.append({
            "Etiquetas de fila": "(en blanco)",
            "Cuenta de Tipo": ""
        })
        
        # Calcular total
        total = sum(distribucion.values())
        resumen.append({
            "Etiquetas de fila": "Total general",
            "Cuenta de Tipo": total
        })
        
        return resumen
    
    def generar_archivo_excel(self,
                            empresa: str = "StandLite2",
                            patente: str = "RZLH36",
                            fecha_inicio_str: str = "20/10/2025",
                            fecha_fin_str: str = "26/10/2025",
                            total_eventos: int = 100,
                            nombre_archivo: str = None) -> str:
        """
        Genera el archivo Excel completo con datos ficticios
        
        Args:
            empresa: Nombre de la empresa/vehículo
            patente: Patente del vehículo
            fecha_inicio_str: Fecha de inicio en formato DD/MM/YYYY
            fecha_fin_str: Fecha de fin en formato DD/MM/YYYY
            total_eventos: Número total de eventos a generar
            nombre_archivo: Nombre del archivo a generar (opcional)
            
        Returns:
            str: Ruta del archivo generado
        """
        
        # Convertir fechas
        fecha_inicio = datetime.strptime(fecha_inicio_str, "%d/%m/%Y")
        fecha_fin = datetime.strptime(fecha_fin_str, "%d/%m/%Y")
        
        # Generar distribución de alarmas
        distribucion = self.generar_distribucion_alarmas(total_eventos)
        
        # Generar eventos detallados
        eventos_detalle = self.generar_eventos_detalle(
            distribucion, empresa, patente, fecha_inicio, fecha_fin
        )
        
        # Generar resumen
        resumen = self.generar_resumen(distribucion)
        
        # Crear DataFrames
        df_resumen = pd.DataFrame(resumen)
        df_videos = pd.DataFrame(eventos_detalle)
        
        # Generar nombre de archivo si no se proporciona
        if nombre_archivo is None:
            nombre_archivo = f"Reporte {empresa} - {patente} - {fecha_inicio_str.split('/')[0]} al {fecha_fin_str.split('/')[0]} de {self._obtener_nombre_mes(fecha_inicio)}.xlsx"
        
        # Crear archivo Excel con dos hojas
        with pd.ExcelWriter(nombre_archivo, engine='openpyxl') as writer:
            df_resumen.to_excel(writer, sheet_name='Hoja1', index=False)
            df_videos.to_excel(writer, sheet_name='Vídeos', index=False)
        
        print(f"Archivo generado exitosamente: {nombre_archivo}")
        print(f"Total de eventos generados: {total_eventos}")
        print(f"Distribución de alarmas:")
        for tipo, cantidad in distribucion.items():
            print(f"  - {tipo}: {cantidad}")
        
        return nombre_archivo
    
    def _obtener_nombre_mes(self, fecha: datetime) -> str:
        """Obtiene el nombre del mes en español"""
        meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ]
        return meses[fecha.month - 1]


def main():
    """
    Función principal para demostrar el uso del generador
    """
    print("=== Generador de Datos Ficticios de Alarmas de Conduccion ===\n")
    
    # Crear instancia del generador
    generador = GeneradorDatosAlarma()
    
    # Generar archivo con parametros personalizados
    archivo_generado = generador.generar_archivo_excel(
        empresa="StandLite2",
        patente="RZLH36",
        fecha_inicio_str="20/10/2025",
        fecha_fin_str="26/10/2025",
        total_eventos=150
    )
    
    print(f"\n[OK] Archivo de ejemplo generado: {archivo_generado}")
    print("\n[INFO] Puedes personalizar los parametros:")
    print("   - empresa: Nombre de la empresa/vehiculo")
    print("   - patente: Patente del vehiculo")
    print("   - fecha_inicio_str y fecha_fin_str: Rango de fechas (DD/MM/YYYY)")
    print("   - total_eventos: Numero total de eventos a generar")
    print("   - nombre_archivo: Nombre personalizado del archivo")


if __name__ == "__main__":
    main()