#!/usr/bin/env python3
"""
Script de prueba para el generador de datos de alarmas
"""

from generador_datos_alarmas import GeneradorDatosAlarma

def main():
    """
    Función de prueba que genera un archivo con parámetros predefinidos
    """
    print("=== Prueba del Generador de Datos Ficticios de Alarmas de Conducción ===\n")
    
    # Crear instancia del generador
    generador = GeneradorDatosAlarma()
    
    # Probar generador de patentes
    print("1. Probando generador de patentes:")
    patentes_prueba = generador.generar_patentes(5)
    print(f"   Patentes generadas: {', '.join(patentes_prueba)}")
    print()
    
    # Usar parámetros predefinidos para la prueba
    parametros_defecto = {
        "cantidad_camiones": 3,
        "total_eventos": 50,
        "empresa": "StandLite2",
        "fecha_inicio_str": "20/10/2025",
        "fecha_fin_str": "26/10/2025"
    }
    
    print("2. Generando archivo de ejemplo con parámetros predefinidos...")
    print(f"   - Empresa: {parametros_defecto['empresa']}")
    print(f"   - Cantidad de camiones: {parametros_defecto['cantidad_camiones']}")
    print(f"   - Total de eventos: {parametros_defecto['total_eventos']}")
    print(f"   - Rango de fechas: {parametros_defecto['fecha_inicio_str']} al {parametros_defecto['fecha_fin_str']}")
    print()
    
    # Generar archivo con los parámetros por defecto
    archivo_generado = generador.generar_archivo_excel_multiple(**parametros_defecto)
    
    print(f"\n[OK] Archivo generado exitosamente: {archivo_generado}")
    print("\n[INFO] El archivo contiene:")
    print("   - Hoja 'Hoja1': Resumen de alarmas por tipo")
    print("   - Hoja 'Vídeos': Detalle de todos los eventos generados")
    
    return archivo_generado

if __name__ == "__main__":
    main()