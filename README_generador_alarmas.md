# Generador de Datos Ficticios de Alarmas de Conducción

Este script Python genera archivos XLSX con datos ficticios realistas de alarmas de conducción que imitan la estructura del archivo "Reporte StandLite2 - RZLH36 - 20 al 26 de octubre.xlsx".

## Características

- Genera datos ficticios pero realistas para 9 tipos de alarma:
  - Botón de alerta
  - Cinturón de seguridad
  - Conductor distraído
  - Cruce de carril
  - Infracción de señal de stop
  - Vídeo solicitado
  - Distancia de Seguridad
  - Teléfono Móvil
  - Fatiga

- Crea dos hojas en el archivo Excel:
  1. **Hoja1**: Resumen de tipos de alarma y sus cantidades
  2. **Vídeos**: Detalle de eventos con todas las columnas

- Personalización de parámetros:
  - Empresa/vehículo
  - Patente
  - Rango de fechas
  - Número total de eventos
  - Nombre del archivo

## Requisitos

```bash
pip install pandas openpyxl
```

## Uso Básico

Ejecutar el script directamente:

```bash
python generador_datos_alarmas.py
```

Esto generará un archivo de ejemplo con 150 eventos en el rango de fechas del 20 al 26 de octubre de 2025.

## Uso Avanzado

```python
from generador_datos_alarmas import GeneradorDatosAlarma

# Crear instancia del generador
generador = GeneradorDatosAlarma()

# Generar archivo con parámetros personalizados
archivo = generador.generar_archivo_excel(
    empresa="Bosques Los Lagos",
    patente="SHGP72",
    fecha_inicio_str="01/11/2025",
    fecha_fin_str="07/11/2025",
    total_eventos=200,
    nombre_archivo="mi_reporte_personalizado.xlsx"
)

print(f"Archivo generado: {archivo}")
```

## Parámetros

- **empresa**: Nombre de la empresa/vehículo (default: "StandLite2")
- **patente**: Patente del vehículo (default: "RZLH36")
- **fecha_inicio_str**: Fecha de inicio en formato DD/MM/YYYY
- **fecha_fin_str**: Fecha de fin en formato DD/MM/YYYY
- **total_eventos**: Número total de eventos a generar (default: 100)
- **nombre_archivo**: Nombre personalizado del archivo (opcional)

## Distribución de Alarmas

El script genera una distribución realista basada en patrones típicos:

- Conductor distraído: 45%
- Cruce de carril: 25%
- Cinturón de seguridad: 10%
- Infracción de señal de stop: 8%
- Teléfono Móvil: 5%
- Fatiga: 3%
- Distancia de Seguridad: 2%
- Botón de alerta: 1%
- Vídeo solicitado: 1%

## Datos Generados

### Hoja1 (Resumen)
- Columnas: "Etiquetas de fila", "Cuenta de Tipo"
- Muestra la cantidad de cada tipo de alarma
- Incluye línea en blanco y total general

### Hoja Vídeos (Detalle)
- Columnas: Tipo, Hora, Estado de vídeo, Vehículo, Conductor, Posición, Último comentario, Severidad del evento de conducción
- Fechas y horas distribuidas aleatoriamente en el rango especificado
- Comentarios específicos para cada tipo de alarma
- Posiciones geográficas ficticias pero realistas de Chile
- Nombres de conductores variados
- Estados de video y severidades realistas

## Ejemplo de Salida

El script genera un archivo Excel con la siguiente estructura:

```
Reporte StandLite2 - RZLH36 - 20 al 26 de octubre.xlsx
├── Hoja1
│   ├── Etiquetas de fila | Cuenta de Tipo
│   ├── Conductor distraído | 68
│   ├── Cruce de carril | 37
│   ├── ...
│   └── Total general | 150
└── Vídeos
    ├── Tipo | Hora | Estado de vídeo | Vehículo | Conductor | Posición | Último comentario | Severidad
    ├── Conductor distraído | 20/10/25, 01:23:58 | — | StandLite2 - RZLH36 | Juan Pérez | Carretera Panamericana... | — | Crítico
    └── ...
```

## Notas

- El script es completamente autocontenido y no modifica archivos existentes
- Utiliza las librerías pandas y openpyxl para la generación de archivos Excel
- Los datos generados son ficticios pero mantienen un formato consistente con los archivos reales
- Las posiciones geográficas corresponden a ubicaciones reales de la región de Los Lagos, Chile