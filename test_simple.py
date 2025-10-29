import sys
import os

# Agregar el directorio actual al path para importar el módulo
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generador_datos_alarmas import GeneradorDatosAlarma

def prueba_simple():
    """Prueba simple para verificar el funcionamiento basico del generador"""
    print("=== Iniciando prueba simple del generador ===")
    
    try:
        # Crear instancia del generador
        generador = GeneradorDatosAlarma()
        print("[OK] Instancia del generador creada correctamente")
        
        # Probar generacion de patentes
        patente = generador.generar_patente()
        print(f"[OK] Patente generada: {patente}")
        
        # Probar generacion de multiples patentes
        patentes = generador.generar_patentes(3)
        print(f"[OK] Patentes generadas: {', '.join(patentes)}")
        
        # Probar generacion de archivo con parametros basicos
        print("\nGenerando archivo de prueba con parametros basicos...")
        archivo = generador.generar_archivo_excel_multiple(
            cantidad_camiones=2,
            total_eventos=10,
            empresa="TestEmpresa"
        )
        print(f"[OK] Archivo generado: {archivo}")
        
        return True
    except Exception as e:
        print(f"[ERROR] Error en la prueba: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    prueba_simple()