import pandas as pd

def comparar_con_referencia():
    # Cargar archivo generado
    xl_gen = pd.ExcelFile('Reporte StandLite2 - RZLH36 - 20 al 26 de octubre.xlsx')
    df_gen_videos = pd.read_excel(xl_gen, 'Vídeos')
    
    # Cargar archivo de referencia
    xl_ref = pd.ExcelFile('Reporte StandLite2 - RZLH36 - 04 al 16 de septiembre.xlsx')
    df_ref_videos = pd.read_excel(xl_ref, 'Vídeos')
    
    print("=== COMPARACIÓN DE ESTRUCTURA ===")
    print(f"Columnas generadas: {len(df_gen_videos.columns)}")
    print(f"Columnas referencia: {len(df_ref_videos.columns)}")
    
    # Comparar columnas (ignorando posibles espacios extra)
    cols_gen = [col.strip() for col in df_gen_videos.columns]
    cols_ref = [col.strip() for col in df_ref_videos.columns if col.strip()]  # Ignorar columnas vacías
    
    print(f"\nColumnas generadas: {cols_gen}")
    print(f"Columnas referencia: {cols_ref}")
    
    # Verificar formato de fecha
    print("\n=== VERIFICACIÓN DE FORMATO DE FECHA ===")
    fecha_gen = df_gen_videos.iloc[0]['Hora']
    fecha_ref = df_ref_videos.iloc[0]['Hora']
    print(f"Formato fecha generada: {fecha_gen}")
    print(f"Formato fecha referencia: {fecha_ref}")
    
    # Verificar distribución de tipos
    print("\n=== DISTRIBUCIÓN DE TIPOS DE ALARMA ===")
    print("Archivo generado:")
    print(df_gen_videos['Tipo'].value_counts())
    
    print("\nArchivo referencia:")
    print(df_ref_videos['Tipo'].value_counts())
    
    # Verificar estados de vídeo
    print("\n=== ESTADOS DE VÍDEO ===")
    print("Archivo generado:")
    print(df_gen_videos['Estado de vídeo'].value_counts())
    
    print("\nArchivo referencia:")
    print(df_ref_videos['Estado de vídeo'].value_counts())
    
    # Verificar severidades
    print("\n=== SEVERIDADES ===")
    print("Archivo generado:")
    print(df_gen_videos['Severidad del evento de conducción'].value_counts())
    
    print("\nArchivo referencia:")
    print(df_ref_videos['Severidad del evento de conducción'].value_counts())

if __name__ == "__main__":
    comparar_con_referencia()