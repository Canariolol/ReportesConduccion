import pandas as pd

def verificar_estructura_excel(nombre_archivo):
    """Verifica la estructura del archivo Excel generado"""
    print(f"=== Verificando estructura del archivo: {nombre_archivo} ===")
    
    try:
        # Leer todas las hojas del archivo Excel
        with pd.ExcelFile(nombre_archivo) as excel_file:
            print(f"Hojas encontradas: {excel_file.sheet_names}")
            
            # Verificar que existan las hojas esperadas
            if 'Hoja1' in excel_file.sheet_names and 'Vídeos' in excel_file.sheet_names:
                print("[OK] Estructura de hojas correcta: 'Hoja1' y 'Vídeos'")
            else:
                print("[ERROR] Estructura de hojas incorrecta")
                return False
            
            # Verificar contenido de Hoja1
            df_hoja1 = pd.read_excel(excel_file, sheet_name='Hoja1')
            print(f"\n--- Hoja1 ---")
            print(f"Columnas: {list(df_hoja1.columns)}")
            print(f"Filas: {len(df_hoja1)}")
            print("Primeras filas:")
            print(df_hoja1.head())
            
            # Verificar contenido de Vídeos
            df_videos = pd.read_excel(excel_file, sheet_name='Vídeos')
            print(f"\n--- Vídeos ---")
            print(f"Columnas: {list(df_videos.columns)}")
            print(f"Filas: {len(df_videos)}")
            print("Primeras filas:")
            print(df_videos.head())
            
            # Verificar tipos de alarma presentes
            if 'Tipo' in df_videos.columns:
                tipos_alarma = df_videos['Tipo'].unique()
                print(f"\nTipos de alarma encontrados: {len(tipos_alarma)}")
                for tipo in sorted(tipos_alarma):
                    count = len(df_videos[df_videos['Tipo'] == tipo])
                    print(f"  - {tipo}: {count}")
            
            return True
    except Exception as e:
        print(f"[ERROR] Error al verificar el archivo: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    verificar_estructura_excel("Reporte TestEmpresa - 2 camiones - 20 al 26 de octubre.xlsx")