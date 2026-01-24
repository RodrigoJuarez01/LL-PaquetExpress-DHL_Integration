import pandas as pd
from datetime import datetime

# ==========================================
# 1. CONFIGURACIÓN
# ==========================================
# Nombre de tu archivo Excel (asegúrate que esté en la misma carpeta)
ARCHIVO_EXCEL = "reporte_paquetexpress_diciembre.csv" 

# Nombre de la hoja (si no sabes, pon None y pandas lee la primera)
NOMBRE_HOJA = 0 

# Umbral de tiempo para considerar duplicado (segundos)
# Dado que es Excel y a veces no tiene milisegundos, 60 segundos es un buen margen.
UMBRAL_SEGUNDOS = 60 

def limpiar_rastreo(valor):
    """
    Intenta convertir notación científica o floats a string de enteros completos.
    Ej: 4.11229E+11 -> "411229000000"
    """
    try:
        # Si es float (por la notación científica), lo pasamos a entero grande
        return str(int(float(valor)))
    except:
        # Si ya es texto o falla, lo devolvemos limpio de espacios
        return str(valor).strip()

def analizar_excel():
    print(f"📂 Leyendo archivo: {ARCHIVO_EXCEL}...")
    
    try:
        # Intentamos leer con codificación latina (típica de Excel en español)
        df = pd.read_csv(ARCHIVO_EXCEL, encoding='latin-1')
    except UnicodeDecodeError:
        # Si falla, intentamos con utf-8 por si acaso
        df = pd.read_csv(ARCHIVO_EXCEL, encoding='utf-8')
    except pd.errors.ParserError:
        # Si falla el parseo, a veces es porque el separador no es coma, sino tabulador
        print("⚠️ Probando con separador de tabulador...")
        df = pd.read_csv(ARCHIVO_EXCEL, encoding='latin-1', sep='\t')
        
    # ==========================================
    # 2. LIMPIEZA DE DATOS
    # ==========================================
    print("🧹 Limpiando datos y formateando columnas...")

    # 1. Limpiar Rastreo (Tracking)
    # Convertimos la columna a string cuidando la notación científica
    if 'Rastreo' in df.columns:
        df['Rastreo_Clean'] = df['Rastreo'].apply(limpiar_rastreo)
    else:
        print("❌ Error: No encuentro la columna 'Rastreo'.")
        print("Columnas encontradas:", df.columns.tolist())
        return

    # 2. Parsear Fechas
    # Formato esperado: 01/12/2025 12:49 (DD/MM/YYYY HH:MM)
    if 'Fecha emisión' in df.columns:
        # dayfirst=True es vital para fechas en español (01/12 vs 12/01)
        df['Fecha_dt'] = pd.to_datetime(df['Fecha emisión'], dayfirst=True, errors='coerce')
    else:
        print("❌ Error: No encuentro la columna 'Fecha emisión'.")
        return

    # Eliminar filas donde la fecha no se pudo leer
    df = df.dropna(subset=['Fecha_dt'])

    # Ordenar por fecha es OBLIGATORIO para comparar filas adyacentes
    df = df.sort_values('Fecha_dt').reset_index(drop=True)

    posibles_duplicados = []
    
    print(f"🔍 Analizando {len(df)} registros en busca de gemelos...")

    # ==========================================
    # 3. ALGORITMO DE DETECCIÓN
    # ==========================================
    for i in range(len(df)):
        fila_actual = df.iloc[i]
        
        # Comparamos con las siguientes filas
        for j in range(i + 1, len(df)):
            fila_siguiente = df.iloc[j]
            
            # Calcular diferencia de tiempo
            delta_tiempo = (fila_siguiente['Fecha_dt'] - fila_actual['Fecha_dt']).total_seconds()
            
            # Si pasamos el umbral, dejamos de comparar con esta fila
            if delta_tiempo > UMBRAL_SEGUNDOS:
                break
            
            # --- CRITERIOS DE DUPLICIDAD ---
            es_sospechoso = False
            
            # 1. ¿Mismo Cliente Destino? (Para evitar confundir envíos simultáneos a diferentes personas)
            # Usamos str() para manejar posibles NaNs
            cliente_1 = str(fila_actual.get('Cliente destino', '')).strip()
            cliente_2 = str(fila_siguiente.get('Cliente destino', '')).strip()
            
            if cliente_1 == cliente_2 and cliente_1 != '':
                
                # 2. ¿Guías Consecutivas?
                try:
                    track_1 = int(fila_actual['Rastreo_Clean'])
                    track_2 = int(fila_siguiente['Rastreo_Clean'])
                    diff_guia = abs(track_2 - track_1)
                    
                    # Si son consecutivas (diferencia de 1) o idénticas (raro, pero posible)
                    if diff_guia == 1: 
                        es_sospechoso = True
                        razon = "Consecutivas"
                    elif diff_guia == 0:
                        es_sospechoso = True
                        razon = "Mismo Número (Duplicado exacto)"
                    elif diff_guia < 10: # Margen pequeño por si hubo saltos
                         es_sospechoso = True
                         razon = f"Cercanas (Diff: {diff_guia})"
                         
                except ValueError:
                    # Si el rastreo no es numérico, ignoramos comparación matemática
                    pass

            if es_sospechoso:
                posibles_duplicados.append({
                    'Fecha': fila_actual['Fecha_dt'],
                    'Cliente': cliente_1,
                    'Rastreo 1 (Probable Fantasma)': fila_actual['Rastreo_Clean'],
                    'Rastreo 2 (Probable Real)': fila_siguiente['Rastreo_Clean'],
                    'Diferencia (seg)': delta_tiempo,
                    'Razón': razon,
                    'Estatus 1': fila_actual.get('Tipo Servicio', ''), # Para ver si hay pistas extra
                    'Estatus 2': fila_siguiente.get('Tipo Servicio', '')
                })

    # ==========================================
    # 4. RESULTADOS
    # ==========================================
    if posibles_duplicados:
        resultados_df = pd.DataFrame(posibles_duplicados)
        print("\n⚠️  ¡ENCONTRADOS POSIBLES DUPLICADOS! ⚠️")
        print(resultados_df[['Fecha', 'Cliente', 'Rastreo 1 (Probable Fantasma)', 'Rastreo 2 (Probable Real)']])
        
        archivo_salida = "duplicados_diciembre_detectados.csv"
        resultados_df.to_csv(archivo_salida, index=False)
        print(f"\n📄 Reporte guardado en: {archivo_salida}")
    else:
        print("\n✅ No se encontraron duplicados evidentes con los criterios actuales.")

if __name__ == "__main__":
    analizar_excel()