import sys
import os

# Agregar el directorio actual al path para importar el módulo
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generador_datos_alarmas import GeneradorDatosAlarma

def prueba_con_parametros(cantidad_camiones, total_eventos, nombre_prueba):
    """Prueba el generador con parámetros específicos"""
    print(f"\n=== {nombre_prueba}: {cantidad_camiones} camiones, {total_eventos} eventos ===")
    
    try:
        # Crear instancia del generador
        generador = GeneradorDatosAlarma()
        
        # Generar archivo con los parámetros especificados
        archivo = generador.generar_archivo_excel_multiple(
            cantidad_camiones=cantidad_camiones,
            total_eventos=total_eventos,
            empresa=f"Prueba{cantidad_camiones}Camiones"
        )
        
        print(f"[OK] Archivo generado: {archivo}")
        
        # Verificar patentes generadas
        patentes_generadas = []
        with open(archivo, 'rb') as f:
            import pandas as pd
            df_videos = pd.read_excel(archivo, sheet_name='Vídeos')
            if 'Vehículo' in df_videos.columns:
                # Extraer patentes únicas de la columna Vehículo
                for vehiculo in df_videos['Vehículo'].unique():
                    # Formato: "Empresa - Patente"
                    partes = vehiculo.split(' - ')
                    if len(partes) > 1:
                        patentes_generadas.append(partes[1])
        
        patentes_unicas = list(set(patentes_generadas))
        print(f"[OK] Patentes únicas generadas: {len(patentes_unicas)}")
        for patente in patentes_unicas:
            print(f"  - {patente}")
            
            # Verificar formato de patente (4 letras + 2 números)
            if len(patente) == 6 and patente[:4].isalpha() and patente[4:].isdigit():
                print(f"    [OK] Formato correcto")
            else:
                print(f"    [ERROR] Formato incorrecto")
        
        # Verificar distribución de eventos
        if 'Tipo' in df_videos.columns:
            tipos_alarma = df_videos['Tipo'].value_counts()
            print(f"\nDistribución de eventos:")
            for tipo, count in tipos_alarma.items():
                print(f"  - {tipo}: {count}")
        
        return True, archivo
    except Exception as e:
        print(f"[ERROR] Error en la prueba: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None

def main():
    """Ejecuta todas las pruebas con diferentes parámetros"""
    print("=== Iniciando pruebas con diferentes parámetros ===")
    
    # Lista de pruebas a realizar
    pruebas = [
        (2, 50, "Prueba 1"),
        (5, 100, "Prueba 2"),
        (10, 200, "Prueba 3")
    ]
    
    archivos_generados = []
    
    for cantidad_camiones, total_eventos, nombre_prueba in pruebas:
        exito, archivo = prueba_con_parametros(cantidad_camiones, total_eventos, nombre_prueba)
        if exito and archivo:
            archivos_generados.append(archivo)
    
    print(f"\n=== Resumen de pruebas ===")
    print(f"Archivos generados: {len(archivos_generados)}")
    for archivo in archivos_generados:
        print(f"  - {archivo}")
    
    return archivos_generados

if __name__ == "__main__":
    main()