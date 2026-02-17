import json
import pandas as pd
import matplotlib.pyplot as plt

# ==========================================
# 1. CARGA Y APLANADO DE DATOS
# ==========================================
archivo_json = 'webhook_staging_data.json' # Tu archivo con el arreglo de objetos

try:
    with open(archivo_json, 'r', encoding='utf-8') as f:
        data_raw = json.load(f)
    
    # Tu JSON tiene la forma: [{"Webhook_Staging": {...}}, {"Webhook_Staging": {...}}]
    # Necesitamos extraer el diccionario interno de cada elemento.
    data_flat = [item['Webhook_Staging'] for item in data_raw if 'Webhook_Staging' in item]
    
    df = pd.DataFrame(data_flat)
    print(f"✅ Cargados {len(df)} registros exitosamente.")

except FileNotFoundError:
    print(f"❌ Error: No se encontró el archivo '{archivo_json}'.")
    exit()
except Exception as e:
    print(f"❌ Error procesando el JSON: {e}")
    exit()

# ==========================================
# 2. LIMPIEZA DE FECHAS
# ==========================================
# Formato Catalyst: "2026-02-14 11:19:28:504" (Usa ':' para milisegundos)
def limpiar_fecha_catalyst(fecha_str):
    if pd.isna(fecha_str): return None
    fecha_str = str(fecha_str).strip()
    
    # Si termina con :mmm (milisegundos con dos puntos), lo cambiamos a .mmm
    if len(fecha_str) > 19 and fecha_str[-4] == ':': 
        return fecha_str[:-4] + '.' + fecha_str[-3:]
    return fecha_str

print("🧹 Normalizando fechas...")
df['CREATEDTIME_CLEAN'] = df['CREATEDTIME'].apply(limpiar_fecha_catalyst)
df['TIMESTAMP'] = pd.to_datetime(df['CREATEDTIME_CLEAN'])

# Ordenamos por fecha (CRUCIAL para que funcione la ventana de tiempo)
df = df.sort_values('TIMESTAMP').set_index('TIMESTAMP')

# ==========================================
# 3. ANÁLISIS DE VENTANA DESLIZANTE (60s)
# ==========================================
print("🔍 Calculando concurrencia (Peticiones por minuto real)...")

# .rolling('60s').count() cuenta cuántos registros hay en la ventana de 60 segundos 
# que termina en el timestamp de la fila actual.
df['REQ_PER_MIN'] = df.rolling('60s')['CREATEDTIME'].count()

# ==========================================
# 4. RESULTADOS
# ==========================================
LIMITE_SOSPECHOSO = 30 # El límite donde crees que Catalyst empieza a fallar

picos = df[df['REQ_PER_MIN'] >= LIMITE_SOSPECHOSO]
max_trafico = df['REQ_PER_MIN'].max()

print("\n" + "="*40)
print(f"📊 RESULTADO DEL ANÁLISIS")
print("="*40)
print(f"Pico Máximo Detectado: {int(max_trafico)} peticiones/minuto")

if not picos.empty:
    print(f"\n🚨 ALERTA: Se superó el límite de {LIMITE_SOSPECHOSO} en {len(picos)} momentos.")
    print("Momentos más críticos (Top 5):")
    print(picos['REQ_PER_MIN'].sort_values(ascending=False).head(5))
    
    # Exportar picos a CSV
    picos.to_csv('reporte_picos_criticos.csv')
    print("\n📄 Se generó 'reporte_picos_criticos.csv' con los detalles.")
else:
    print(f"\n✅ No se encontraron picos que superen las {LIMITE_SOSPECHOSO} peticiones/min.")
    print("Es poco probable que sea un problema de Rate Limit por volumen.")

# ==========================================
# 5. GRÁFICA (Opcional)
# ==========================================
try:
    plt.figure(figsize=(14, 6))
    plt.plot(df.index, df['REQ_PER_MIN'], label='Tráfico (Ventana 60s)', color='#007bff')
    plt.axhline(y=LIMITE_SOSPECHOSO, color='red', linestyle='--', label=f'Límite ({LIMITE_SOSPECHOSO})')
    
    plt.title('Peticiones Webhook 11 feb a 14 feb')
    plt.xlabel('Hora')
    plt.ylabel('Peticiones / Minuto')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()
except Exception:
    print("(No se pudo generar la gráfica, falta entorno gráfico o librería)")