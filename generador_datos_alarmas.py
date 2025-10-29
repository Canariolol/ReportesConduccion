import pandas as pd
import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import os
import string

class GeneradorDatosAlarma:
    """
    Clase para generar datos ficticios realistas de alarmas de conducción
    que imitan la estructura del archivo Excel de referencia.
    """
    
    def __init__(self):
        # Crear carpeta para reportes generados si no existe
        self.carpeta_reportes = "reportes_generados"
        if not os.path.exists(self.carpeta_reportes):
            os.makedirs(self.carpeta_reportes)
            print(f"Carpeta creada: {os.path.abspath(self.carpeta_reportes)}")
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
    
    def generar_patente(self) -> str:
        """
        Genera una patente ficticia en formato ABCD12 (4 letras seguidas de 2 números),
        omitiendo las letras 'O' y los números '0'.
        """
        letras_permitidas = ''.join(c for c in string.ascii_uppercase if c != 'O')
        numeros_permitidos = ''.join(c for c in string.digits if c != '0')

        letras = ''.join(random.choices(letras_permitidas, k=4))
        numeros = ''.join(random.choices(numeros_permitidos, k=2))
    
        return f"{letras}{numeros}"
    
    def generar_patentes(self, cantidad: int) -> List[str]:
        """
        Genera una lista de patentes ficticias únicas
        """
        patentes = set()
        while len(patentes) < cantidad:
            patentes.add(self.generar_patente())
        return list(patentes)
    
    def distribuir_eventos_entre_camiones(self, total_eventos: int, patentes: List[str]) -> Dict[str, Dict[str, int]]:
        """
        Distribuye los eventos de manera realista entre los diferentes camiones
        """
        distribucion_camiones = {}
        
        # Inicializar distribución para cada camión
        for patente in patentes:
            distribucion_camiones[patente] = {}
        
        # Generar distribución de tipos de alarma
        distribucion_tipos = self.generar_distribucion_alarmas(total_eventos)
        
        # Distribuir eventos por tipo entre los camiones
        for tipo_alarma, cantidad in distribucion_tipos.items():
            # Distribuir eventos de este tipo entre los camiones
            eventos_restantes = cantidad
            
            while eventos_restantes > 0:
                # Elegir un camión aleatoriamente con mayor probabilidad para algunos
                if tipo_alarma in ["Conductor distraído", "Cruce de carril"]:
                    # Estos tipos son más comunes, distribuir más uniformemente
                    patente = random.choice(patentes)
                else:
                    # Eventos menos comunes, pueden concentrarse en algunos camiones
                    patente = random.choices(
                        patentes, 
                        weights=[random.uniform(0.5, 1.5) for _ in patentes]
                    )[0]
                
                distribucion_camiones[patente][tipo_alarma] = distribucion_camiones[patente].get(tipo_alarma, 0) + 1
                eventos_restantes -= 1
        
        return distribucion_camiones
    
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
            "Conductor distraído": 0.40,      # 40%
            "Cruce de carril": 0.25,          # 25%
            "Cinturón de seguridad": 0.10,    # 10%
            "Infracción de señal de stop": 0.08, # 8%
            "Teléfono Móvil": 0.08,           # 8%
            "Fatiga": 0.05,                   # 5%
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
                    "Vehículo": patente,
                    "Conductor": f"{random.choice(self.nombres_conductores)} ({empresa})",
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
    
    def generar_archivo_excel_multiple(self,
                                    empresa: str = "StandLite2",
                                    cantidad_camiones: int = 5,
                                    fecha_inicio_str: str = "20/10/2025",
                                    fecha_fin_str: str = "26/10/2025",
                                    total_eventos: int = 100,
                                    nombre_archivo: str = None) -> str:
        """
        Genera el archivo Excel completo con datos ficticios para múltiples camiones
        
        Args:
            empresa: Nombre de la empresa/vehículo
            cantidad_camiones: Número de camiones diferentes a generar
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
        
        # Generar patentes para los camiones
        patentes = self.generar_patentes(cantidad_camiones)
        
        # Distribuir eventos entre los camiones
        distribucion_camiones = self.distribuir_eventos_entre_camiones(total_eventos, patentes)
        
        # Generar eventos detallados para todos los camiones
        todos_los_eventos = []
        distribucion_total = {}
        
        for patente, distribucion in distribucion_camiones.items():
            # Generar eventos para este camión
            eventos_camion = self.generar_eventos_detalle(
                distribucion, empresa, patente, fecha_inicio, fecha_fin
            )
            todos_los_eventos.extend(eventos_camion)
            
            # Acumular distribución total
            for tipo, cantidad in distribucion.items():
                distribucion_total[tipo] = distribucion_total.get(tipo, 0) + cantidad
        
        # Ordenar todos los eventos por fecha
        todos_los_eventos.sort(key=lambda x: x["Hora"])
        
        # Generar resumen
        resumen = self.generar_resumen(distribucion_total)
        
        # Crear DataFrames
        df_resumen = pd.DataFrame(resumen)
        df_videos = pd.DataFrame(todos_los_eventos)
        
        # Generar nombre de archivo si no se proporciona
        if nombre_archivo is None:
            nombre_archivo = f"Reporte {empresa} - {cantidad_camiones} camiones - {fecha_inicio_str.split('/')[0]} al {fecha_fin_str.split('/')[0]} de {self._obtener_nombre_mes(fecha_inicio)}.xlsx"
        
        # Asegurar que el archivo se guarde en la carpeta de reportes
        ruta_completa = os.path.join(self.carpeta_reportes, nombre_archivo)
        
        # Crear archivo Excel con dos hojas
        with pd.ExcelWriter(ruta_completa, engine='openpyxl') as writer:
            df_resumen.to_excel(writer, sheet_name='Hoja1', index=False)
            df_videos.to_excel(writer, sheet_name='Vídeos', index=False)
        
        # Obtener la ruta absoluta para mostrarla al usuario
        ruta_absoluta = os.path.abspath(ruta_completa)
        
        print("\n" + "="*60)
        print("¡ARCHIVO GENERADO EXITOSAMENTE!")
        print("="*60)
        print(f"Archivo guardado en: {ruta_absoluta}")
        print("-"*60)
        print(f"Total de eventos generados: {total_eventos}")
        print(f"Total de camiones: {cantidad_camiones}")
        print(f"Patentes generadas: {', '.join(patentes)}")
        print(f"Distribución de alarmas:")
        for tipo, cantidad in distribucion_total.items():
            print(f"  - {tipo}: {cantidad}")
        print("="*60)
        
        return ruta_absoluta
    
    def generar_archivo_excel(self,
                            empresa: str = "StandLite2",
                            patente: str = "RZLH36",
                            fecha_inicio_str: str = "20/10/2025",
                            fecha_fin_str: str = "26/10/2025",
                            total_eventos: int = 100,
                            nombre_archivo: str = None) -> str:
        """
        Genera el archivo Excel completo con datos ficticios (método original para compatibilidad)
        
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
        
        # Asegurar que el archivo se guarde en la carpeta de reportes
        ruta_completa = os.path.join(self.carpeta_reportes, nombre_archivo)
        
        # Crear archivo Excel con dos hojas
        with pd.ExcelWriter(ruta_completa, engine='openpyxl') as writer:
            df_resumen.to_excel(writer, sheet_name='Hoja1', index=False)
            df_videos.to_excel(writer, sheet_name='Vídeos', index=False)
        
        # Obtener la ruta absoluta para mostrarla al usuario
        ruta_absoluta = os.path.abspath(ruta_completa)
        
        print("\n" + "="*60)
        print("¡ARCHIVO GENERADO EXITOSAMENTE!")
        print("="*60)
        print(f"Archivo guardado en: {ruta_absoluta}")
        print("-"*60)
        print(f"Total de eventos generados: {total_eventos}")
        print(f"Distribución de alarmas:")
        for tipo, cantidad in distribucion.items():
            print(f"  - {tipo}: {cantidad}")
        print("="*60)
        
        return ruta_absoluta
    
    def _obtener_nombre_mes(self, fecha: datetime) -> str:
        """Obtiene el nombre del mes en español"""
        meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ]
        return meses[fecha.month - 1]


def solicitar_parametros_interactivos():
    """
    Solicita parámetros al usuario de forma interactiva
    """
    print("=== Generador de Datos Ficticios de Alarmas de Conducción ===\n")
    
    # Solicitar cantidad de camiones
    while True:
        try:
            cantidad_camiones = int(input("Ingrese la cantidad de camiones (patentes) a generar: "))
            if cantidad_camiones > 0:
                break
            else:
                print("Por favor, ingrese un número mayor a 0.")
        except ValueError:
            print("Por favor, ingrese un número válido.")
    
    # Solicitar cantidad total de eventos
    while True:
        try:
            total_eventos = int(input("Ingrese la cantidad total de eventos a generar: "))
            if total_eventos > 0:
                break
            else:
                print("Por favor, ingrese un número mayor a 0.")
        except ValueError:
            print("Por favor, ingrese un número válido.")
    
    # Solicitar nombre de empresa (opcional)
    empresa = input("Ingrese el nombre de la empresa (presione Enter para usar 'StandLite2'): ").strip()
    if not empresa:
        empresa = "StandLite2"
    
    # Solicitar rango de fechas (opcional)
    fecha_inicio = input("Ingrese fecha de inicio (DD/MM/YYYY, presione Enter para usar fecha actual): ").strip()
    if not fecha_inicio:
        fecha_actual = datetime.now()
        fecha_inicio = fecha_actual.strftime("%d/%m/%Y")
        # Calcular fecha de fin (7 días después)
        fecha_fin = (fecha_actual + timedelta(days=7)).strftime("%d/%m/%Y")
    else:
        fecha_fin = input("Ingrese fecha de fin (DD/MM/YYYY, presione Enter para usar 7 días después del inicio): ").strip()
        if not fecha_fin:
            # Convertir fecha de inicio y sumar 7 días
            try:
                fecha_inicio_dt = datetime.strptime(fecha_inicio, "%d/%m/%Y")
                fecha_fin = (fecha_inicio_dt + timedelta(days=7)).strftime("%d/%m/%Y")
            except ValueError:
                print("Formato de fecha inválido, usando valores por defecto.")
                fecha_inicio = "20/10/2025"
                fecha_fin = "26/10/2025"
    
    return {
        "cantidad_camiones": cantidad_camiones,
        "total_eventos": total_eventos,
        "empresa": empresa,
        "fecha_inicio_str": fecha_inicio,
        "fecha_fin_str": fecha_fin
    }


def main():
    """
    Función principal que permite elegir entre modo interactivo o automático
    """
    print("=== Generador de Datos Ficticios de Alarmas de Conducción ===\n")
    print("Seleccione el modo de ejecución:")
    print("1. Modo interactivo (ingresar parámetros manualmente)")
    print("2. Modo automático (usar parámetros predefinidos)")
    
    try:
        opcion = input("\nIngrese su opción (1 o 2, presione Enter para usar modo automático): ").strip()
        if opcion == "1":
            ejecutar_modo_interactivo()
        else:
            ejecutar_modo_automatico()
    except (EOFError, KeyboardInterrupt):
        # Si hay error con la entrada, ejecutar modo automático
        print("\nUsando modo automático por defecto...")
        ejecutar_modo_automatico()

def ejecutar_modo_interactivo():
    """
    Ejecuta el generador en modo interactivo
    """
    # Crear instancia del generador
    generador = GeneradorDatosAlarma()
    
    # Solicitar parámetros al usuario
    parametros = solicitar_parametros_interactivos()
    
    print("\nGenerando archivo con los siguientes parámetros:")
    print(f"  - Empresa: {parametros['empresa']}")
    print(f"  - Cantidad de camiones: {parametros['cantidad_camiones']}")
    print(f"  - Total de eventos: {parametros['total_eventos']}")
    print(f"  - Rango de fechas: {parametros['fecha_inicio_str']} al {parametros['fecha_fin_str']}")
    print()
    
    # Generar archivo con los parámetros proporcionados
    archivo_generado = generador.generar_archivo_excel_multiple(**parametros)
    
    print("\n" + "="*60)
    print("¡ARCHIVO GENERADO EXITOSAMENTE!")
    print("="*60)
    print(f"Archivo guardado en: {archivo_generado}")
    print("-"*60)
    print("[INFO] El archivo contiene:")
    print("   - Hoja 'Hoja1': Resumen de alarmas por tipo")
    print("   - Hoja 'Vídeos': Detalle de todos los eventos generados")
    print("="*60)

def ejecutar_modo_automatico():
    """
    Ejecuta el generador en modo automático con parámetros predefinidos
    """
    prueba_automatica()

def prueba_automatica():
    """
    Función de prueba que genera un archivo con parámetros predefinidos
    """
    print("=== Generador de Datos Ficticios de Alarmas de Conducción (Modo Prueba) ===\n")
    
    # Crear instancia del generador
    generador = GeneradorDatosAlarma()
    
    # Usar parámetros predefinidos para la prueba
    parametros_defecto = {
        "cantidad_camiones": 3,
        "total_eventos": 50,
        "empresa": "StandLite2",
        "fecha_inicio_str": "20/10/2025",
        "fecha_fin_str": "26/10/2025"
    }
    
    print("Generando archivo de ejemplo con parámetros predefinidos...")
    print(f"  - Empresa: {parametros_defecto['empresa']}")
    print(f"  - Cantidad de camiones: {parametros_defecto['cantidad_camiones']}")
    print(f"  - Total de eventos: {parametros_defecto['total_eventos']}")
    print(f"  - Rango de fechas: {parametros_defecto['fecha_inicio_str']} al {parametros_defecto['fecha_fin_str']}")
    print()
    
    # Generar archivo con los parámetros por defecto
    archivo_generado = generador.generar_archivo_excel_multiple(**parametros_defecto)
    
    print("\n" + "="*60)
    print("¡ARCHIVO DE PRUEBA GENERADO EXITOSAMENTE!")
    print("="*60)
    print(f"Archivo guardado en: {archivo_generado}")
    print("-"*60)
    print("[INFO] El archivo contiene:")
    print("   - Hoja 'Hoja1': Resumen de alarmas por tipo")
    print("   - Hoja 'Vídeos': Detalle de todos los eventos generados")
    print("="*60)
    
    return archivo_generado

    print(f"  - Total de eventos: {parametros['total_eventos']}")
    print(f"  - Rango de fechas: {parametros['fecha_inicio_str']} al {parametros['fecha_fin_str']}")
    print()
    
    # Generar archivo con los parámetros proporcionados
    archivo_generado = generador.generar_archivo_excel_multiple(**parametros)
    
    print("\n" + "="*60)
    print("¡ARCHIVO GENERADO EXITOSAMENTE!")
    print("="*60)
    print(f"Archivo guardado en: {archivo_generado}")
    print("-"*60)
    print("[INFO] El archivo contiene:")
    print("   - Hoja 'Hoja1': Resumen de alarmas por tipo")
    print("   - Hoja 'Vídeos': Detalle de todos los eventos generados")
    print("="*60)


if __name__ == "__main__":
    main()