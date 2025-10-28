import pandas as pd

def analizar_archivo_generado():
    # Cargar archivo generado
    xl_gen = pd.ExcelFile('Reporte StandLite2 - RZLH36 - 20 al 26 de octubre.xlsx')
    
    # Analizar Hoja1
    df1 = pd.read_excel(xl_gen, 'Hoja1')
    print("=== ANÁLISIS HOJA1 ===")
    print(f"Total de filas: {len(df1)}")
    print("Contenido:")
    for idx, row in df1.iterrows():
        print(f"  {row['Etiquetas de fila']}: {row['Cuenta de Tipo']}")
    
    # Analizar Vídeos
    df2 = pd.read_excel(xl_gen, 'Vídeos')
    print("\n=== ANÁLISIS VÍDEOS ===")
    print(f"Total de registros: {len(df2)}")
    print(f"Columnas: {list(df2.columns)}")
    
    print("\nDistribución de tipos de alarma:")
    print(df2['Tipo'].value_counts())
    
    print("\nPrimeros 3 registros:")
    for i in range(min(3, len(df2))):
        print(f"\nRegistro {i+1}:")
        for col in df2.columns:
            print(f"  {col}: {df2.iloc[i][col]}")
    
    # Verificar tipos adicionales
    tipos_presentes = set(df2['Tipo'].unique())
    tipos_adicionales = {"Distancia de Seguridad", "Teléfono Móvil", "Fatiga"}
    tipos_encontrados = tipos_presentes.intersection(tipos_adicionales)
    
    print(f"\n=== VERIFICACIÓN DE TIPOS ADICIONALES ===")
    print(f"Tipos adicionales encontrados: {tipos_encontrados}")
    print(f"Todos los tipos adicionales presentes: {len(tipos_encontrados) == 3}")

if __name__ == "__main__":
    analizar_archivo_generado()