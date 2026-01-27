import requests
import base64
import time


URL_WEBHOOK = "http://localhost:3000/server/staging_webhook_function/"
TOKEN = "8506bb63c80ac3f539ab773d1081ce7fa40ab9686ed8d629a0b6bfb5d461a8b8" 

VALID_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="


casos = [
    {
        "id": "CASO_1_FANTASMA",
        "desc": "Guía inexistente en Zoho. Debe quedar en PENDING -> ERROR -> PERMANENT_FAIL tras 3 intentos.",
        "payload": {
            "trackingNumber": "TEST_FANTASMA_001",
            "firmaBase64": VALID_BASE64,
            "fechaHoraEntrega": "2024-01-26 12:00:00",
            "nombreReceptor": "Test Fantasma"
        }
    },
    {
        "id": "CASO_2_REAL_YA_ENTREGADO",
        "desc": "Guía real vieja. Debe procesarse EXITOSAMENTE ignorando el error 37135 de Zoho.",
        "payload": {
            "trackingNumber": "9505299020",
            "firmaBase64": VALID_BASE64,
            "fechaHoraEntrega": "2024-01-20 12:00:00",
            "nombreReceptor": "Test Real Viejo"
        }
    },
    {
        "id": "CASO_3_FORMATO_MANUAL",
        "desc": "Guía con espacios (formato sucio). Zoho no la encontrará. Debe fallar controladamente.",
        "payload": {
            "trackingNumber": "12345 67890", 
            "firmaBase64": VALID_BASE64,
            "fechaHoraEntrega": "2024-01-26 13:00:00",
            "nombreReceptor": "Test Manual Error"
        }
    },
    {
        "id": "CASO_4_IMAGEN_ROTA",
        "desc": "Base64 inválido. El Webhook debería guardar el registro pero fallar (o loguear error) al guardar la imagen. El Scheduler debe procesar el status aunque no haya imagen.",
        "payload": {
            "trackingNumber": "TEST_IMG_ROTA_001",
            "firmaBase64": "ESTO_NO_ES_BASE64_VALIDO_@@@", 
            "fechaHoraEntrega": "2024-01-26 14:00:00",
            "nombreReceptor": "Test Imagen Rota"
        }
    },
    {
        "id": "CASO_5_PAYLOAD_MINIMO",
        "desc": "Solo trackingNumber. El sistema debe ser robusto y no fallar por falta de campos opcionales.",
        "payload": {
            "trackingNumber": "411233748783"
        }
    }
]

def enviar_test(caso):
    headers = {
        "x-auth-token": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    payload = caso['payload']
    print(f"\n🔹 Enviando {caso['id']}...")
    print(f"   Desc: {caso['desc']}")
    
    try:
        resp = requests.post(URL_WEBHOOK, json=payload, headers=headers)
        
        if resp.status_code == 200:
            print(f"   ✅ [200 OK] Recibido y encolado correctamente.")
        else:
            print(f"   ❌ [{resp.status_code}] Error: {resp.text}")
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")

if __name__ == "__main__":
    print(f"--- INYECTANDO {len(casos)} CASOS DE PRUEBA EN STAGING ---")
    
    for caso in casos:
        enviar_test(caso)
        time.sleep(1)
        
    print("\n Inyección terminada.")