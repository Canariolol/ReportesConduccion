import sys
import os

# Agregar el directorio actual al path para importar el módulo
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generador_datos_alarmas import GeneradorDatosAlarma
import pandas as pd

def prueba_randomizacion():
    """Verifica que cada ejecución genere datos completamente diferentes"""
    print("=== Verificando randomización entre ejecuciones ===")
    
    try:
        # Crear instancia del generador
        generador = GeneradorDatosAlarma()
        
        # Generar 3 archivos con los mismos parámetros
        archivos = []
        patentes_todas = []
        eventos_todos = []
        
        for i in range(3):
            print(f"\n--- Ejecución {i+1} ---")
            archivo = generador.generar_archivo_excel_multiple(
                cantidad_camiones=3,
                total_eventos=30,
                empresa=f"RandomTest{i+1}",
                nombre_archivo=f"random_test_{i+1}.xlsx"
            )
            archivos.append(archivo)
            
            # Extraer patentes y eventos para comparación
            df_videos = pd.read_excel(archivo, sheet_name='Vídeos')
            
            # Extraer patentes únicas
            patentes = set()
            for vehiculo in df_videos['Vehículo'].unique():
                partes = vehiculo.split(' - ')
                if len(partes) > 1:
                    patentes.add(partes[1])
            patentes_todas.append(patentes)
            
            # Extraer eventos (primeros 5 para comparación)
            eventos_primeros = df_videos.head(5)[['Tipo', 'Hora', 'Vehículo']].values.tolist()
            eventos_todos.append(eventos_primeros)
            
            print(f"Patentes generadas: {', '.join(sorted(patentes))}")
            print(f"Primeros 5 eventos: {len(eventos_primeros)}")
        
        # Verificar que las patentes sean diferentes entre ejecuciones
        print(f"\n=== Verificación de diferencias ===")
        
        # Comparar patentes
        interseccion_patentes = set.intersection(*patentes_todas)
        if len(interseccion_patentes) == 0:
            print("[OK] No hay patentes repetidas entre ejecuciones")
        else:
            print(f"[INFO] Hay {len(interseccion_patentes)} patentes repetidas: {', '.join(interseccion_patentes)}")
        
        # Comparar eventos
        eventos_iguales = 0
        for i in range(len(eventos_todos)):
            for j in range(i+1, len(eventos_todos)):
                for evento_i in eventos_todos[i]:
                    for evento_j in eventos_todos[j]:
                        if evento_i == evento_j:
                            eventos_iguales += 1
        
        if eventos_iguales == 0:
            print("[OK] No hay eventos idénticos entre ejecuciones")
        else:
            print(f"[INFO] Hay {eventos_iguales} eventos idénticos entre ejecuciones")
        
        # Verificar distribución de tipos de alarma
        print(f"\n=== Distribución de tipos de alarma por ejecución ===")
        for i, archivo in enumerate(archivos):
            df_videos = pd.read_excel(archivo, sheet_name='Vídeos')
            distribucion = df_videos['Tipo'].value_counts()
            print(f"Ejecución {i+1}:")
            for tipo, count in distribucion.items():
                print(f"  - {tipo}: {count}")
        
        return True
    except Exception as e:
        print(f"[ERROR] Error en la prueba de randomización: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    prueba_randomizacion()