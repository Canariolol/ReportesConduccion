import sys
import os

# Agregar el directorio actual al path para importar el módulo
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generador_datos_alarmas import GeneradorDatosAlarma

def prueba_simple():
    """Prueba simple para verificar el funcionamiento básico del generador"""
    print("=== Iniciando prueba simple del generador ===")
    
    try:
        # Crear instancia del generador
        generador = GeneradorDatosAlarma()
        print("✓ Instancia del generador creada correctamente")
        
        # Probar generación de patentes
        patente = generador.generar_patente()
        print(f"✓ Patente generada: {patente}")
        
        # Probar generación de múltiples patentes
        patentes = generador.generar_patentes(3)
        print(f"✓ Patentes generadas: {', '.join(patentes)}")
        
        # Probar generación de archivo con parámetros básicos
        print("\nGenerando archivo de prueba con parámetros básicos...")
        archivo = generador.generar_archivo_excel_multiple(
            cantidad_camiones=2,
            total_eventos=10,
            empresa="TestEmpresa"
        )
        print(f"✓ Archivo generado: {archivo}")
        
        return True
    except Exception as e:
        print(f"✗ Error en la prueba: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    prueba_simple()