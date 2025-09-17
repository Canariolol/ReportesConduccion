import pandas as pd

def analizar_archivo_excel(nombre_archivo):
    print(f"\n=== Analizando {nombre_archivo} ===")
    try:
        excel_file = pd.ExcelFile(nombre_archivo)
        print(f"Hojas encontradas: {excel_file.sheet_names}")
        
        for sheet_name in excel_file.sheet_names:
            print(f"\n--- Hoja: {sheet_name} ---")
            df = pd.read_excel(nombre_archivo, sheet_name=sheet_name)
            print(f"Dimensiones: {df.shape}")
            print(f"Columnas: {df.columns.tolist()}")
            print("Primeras 10 filas:")
            print(df.head(10))
            print("-" * 50)
    except Exception as e:
        print(f"Error al leer {nombre_archivo}: {e}")

# Analizar los tres archivos
analizar_archivo_excel('Reporte StandPro2 - SHGP72 - 04 al 16 de septiembre.xlsx')
analizar_archivo_excel('Reporte StandLite2 - RZLH36 - 04 al 16 de septiembre.xlsx')
analizar_archivo_excel('Reporte StandLite1 - TRSF96 - 04 al 16 de septiembre.xlsx')
