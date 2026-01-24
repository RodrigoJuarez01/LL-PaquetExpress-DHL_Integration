import requests
import json
import time

# ==========================================
# 1. CONFIGURACIÓN
# ==========================================
# La URL de tu función local (asegúrate que el servidor esté corriendo)
BASE_URL = "http://localhost:3000/server/paquetexpress_label_request_function/"

# LISTA DE GUÍAS:
# Pon aquí algunas reales para ver el PDF y otras inventadas para ver errores de la API externa.
TRACKING_NUMBERS = [
    "411228980879",  # Pon una REAL aquí para probar "EXITO"
    "123456789000",  # Pon una INVENTADA aquí para probar "ERROR_SISTEMA" (si PaquetExpress falla)
    "",  # Pon una REAL aquí para probar "EXITO"
    "411228938987",  # Pon una INVENTADA aquí para probar "ERROR_SISTEMA" (si PaquetExpress falla)
]

def test_endpoint():
    print(f"🚀 Iniciando pruebas contra: {BASE_URL}\n")

    # ---------------------------------------------------------
    # CASO A: Peticiones con número de guía (Éxito o Error API)
    # ---------------------------------------------------------
    for guia in TRACKING_NUMBERS:
        print(f"🔹 Probando guía: {guia} ...")
        
        try:
            # Enviamos el trackingNumber como query param
            params = {'trackingNumber': guia}
            response = requests.get(BASE_URL, params=params)
            
            # Analizamos respuesta
            if response.status_code == 200:
                data = response.json()
                pdf_preview = data.get('labelPdfBase64', '')[:20] + "..." # Solo mostramos el inicio
                print(f"   ✅ [200 OK] PDF Recibido. (Base64 inicia: {pdf_preview})")
                print("   👉 Revisa en Data Store: Debería decir status 'EXITO'")
            
            elif response.status_code == 500:
                print(f"   ⚠️ [500 Error] Falló la API externa (Esperado si la guía es falsa).")
                print(f"   Mensaje: {response.text}")
                print("   👉 Revisa en Data Store: Debería decir status 'ERROR_SISTEMA'")
            
            else:
                print(f"   ❓ [{response.status_code}] Respuesta inesperada: {response.text}")

        except requests.exceptions.ConnectionError:
            print("   ❌ Error: No se pudo conectar a localhost. ¿Está corriendo 'catalyst serve'?")
            return

        print("-" * 50)
        time.sleep(1) # Un respiro entre peticiones

    # ---------------------------------------------------------
    # CASO B: Petición SIN número de guía (Error de Validación)
    # ---------------------------------------------------------
    print("\n🔹 Probando petición SIN parámetro trackingNumber...")
    try:
        response = requests.get(BASE_URL) # Sin params
        
        if response.status_code == 400:
            print(f"   ✅ [400 Bad Request] Correcto. El servidor rechazó la petición.")
            print("   👉 Revisa en Data Store: Debería decir status 'ERROR_VALIDACION'")
        else:
            print(f"   ❌ Falló la prueba. Esperaba 400, recibí {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

    print("\n🏁 Pruebas finalizadas.")

if __name__ == "__main__":
    test_endpoint()