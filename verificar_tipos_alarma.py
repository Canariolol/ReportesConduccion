import sys
import os

# Agregar el directorio actual al path para importar el módulo
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generador_datos_alarmas import GeneradorDatosAlarma
import pandas as pd

def verificar_todos_los_tipos_alarma():
    """Verifica que todos los tipos de alarma estén presentes incluyendo los 3 adicionales"""
    print("=== Verificando todos los tipos de alarma ===")
    
    try:
        # Crear instancia del generador
        generador = GeneradorDatosAlarma()
        
        # Mostrar tipos de alarma definidos en el generador
        print(f"Tipos de alarma definidos en el generador: {len(generador.tipos_alarma)}")
        for tipo in generador.tipos_alarma:
            print(f"  - {tipo}")
        
        # Generar un archivo con muchos eventos para aumentar la probabilidad
        # de que aparezcan todos los tipos de alarma
        print("\nGenerando archivo con 500 eventos para verificar todos los tipos...")
        archivo = generador.generar_archivo_excel_multiple(
            cantidad_camiones=20,
            total_eventos=500,
            empresa="VerificacionTipos"
        )
        
        # Verificar tipos de alarma presentes en el archivo generado
        df_videos = pd.read_excel(archivo, sheet_name='Vídeos')
        tipos_presentes = df_videos['Tipo'].unique()
        
        print(f"\nTipos de alarma presentes en el archivo generado: {len(tipos_presentes)}")
        for tipo in sorted(tipos_presentes):
            count = len(df_videos[df_videos['Tipo'] == tipo])
            print(f"  - {tipo}: {count}")
        
        # Verificar qué tipos definidos no aparecen
        tipos_faltantes = set(generador.tipos_alarma) - set(tipos_presentes)
        if tipos_faltantes:
            print(f"\n[ADVERTENCIA] Tipos de alarma faltantes: {len(tipos_faltantes)}")
            for tipo in sorted(tipos_faltantes):
                print(f"  - {tipo}")
        else:
            print("\n[OK] Todos los tipos de alarma definidos están presentes")
        
        # Verificar comentarios específicos para cada tipo
        print(f"\n=== Verificando comentarios específicos ===")
        for tipo in generador.tipos_alarma:
            if tipo in generador.comentarios_alarma:
                comentarios = generador.comentarios_alarma[tipo]
                print(f"{tipo}: {len(comentarios)} comentarios definidos")
                # Verificar si hay eventos con comentarios para este tipo
                eventos_con_comentarios = df_videos[
                    (df_videos['Tipo'] == tipo) & 
                    (df_videos['Último comentario'] != '—')
                ]
                if len(eventos_con_comentarios) > 0:
                    print(f"  - Eventos con comentarios: {len(eventos_con_comentarios)}")
                    # Mostrar primer comentario como ejemplo
                    primer_comentario = eventos_con_comentarios.iloc[0]['Último comentario']
                    print(f"  - Ejemplo: {primer_comentario}")
                else:
                    print(f"  - [INFO] No hay eventos con comentarios para este tipo")
            else:
                print(f"{tipo}: [ADVERTENCIA] No hay comentarios definidos")
        
        return True
    except Exception as e:
        print(f"[ERROR] Error en la verificación: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    verificar_todos_los_tipos_alarma()