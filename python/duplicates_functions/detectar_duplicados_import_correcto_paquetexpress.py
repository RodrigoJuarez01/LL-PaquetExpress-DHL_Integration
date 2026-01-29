import pandas as pd
import numpy as np

# ==========================================
# CONFIGURACIÓN
# ==========================================
ARCHIVO_EXCEL = "reporte_guias_api_diciembre 2025.xlsx" 

def analizar_duplicados_estrictos():
    print(f"📂 Leyendo archivo: {ARCHIVO_EXCEL}...")
    
    try:
        df = pd.read_excel(ARCHIVO_EXCEL)
    except Exception as e:
        print(f"❌ Error leyendo el archivo: {e}")
        return

    # ==========================================
    # 1. LIMPIEZA Y PREPARACIÓN
    # ==========================================
    print("🧹 Preparando datos para análisis matemático...")

    # Limpieza de texto
    df['NOM_DESTINO'] = df['NOM_DESTINO'].astype(str).str.strip().str.upper()
    df['CODIGO_POSTAL_DESTINO'] = df['CODIGO_POSTAL_DESTINO'].astype(str).str.strip()

    # Convertir Rastreo a Número (Vital para saber si son consecutivos)
    # 'coerce' convierte errores a NaN (por si hay basura)
    df['RASTREO_NUM'] = pd.to_numeric(df['RASTREO'], errors='coerce')

    # Convertir Fechas
    df['FECHA_DT'] = pd.to_datetime(df['FECHA_CREACION'], dayfirst=True, errors='coerce')

    # Eliminamos filas que no tengan rastreo numérico o fecha válida
    df = df.dropna(subset=['RASTREO_NUM', 'FECHA_DT'])

    # ==========================================
    # 2. ALGORITMO STRICTO (Consecutivos + <1seg)
    # ==========================================
    print("🎯 Buscando casos de 'Doble Click' (Consecutivos en < 1 seg)...")

    # Ordenamos PRIMERO por Nombre, y LUEGO por Número de Rastreo.
    # Esto pone la guía ...880 justo arriba de la ...881 del mismo cliente.
    df = df.sort_values(by=['NOM_DESTINO', 'RASTREO_NUM'])

    # Calculamos diferencias con la fila anterior
    df['DIFF_RASTREO'] = df['RASTREO_NUM'].diff().abs() # Diferencia matemática de guías
    df['DIFF_TIEMPO'] = df['FECHA_DT'].diff().dt.total_seconds().abs() # Diferencia de segundos
    
    # Verificamos que sea el mismo cliente y CP
    df['MISMO_CLIENTE'] = (df['NOM_DESTINO'] == df['NOM_DESTINO'].shift(1)) & \
                          (df['CODIGO_POSTAL_DESTINO'] == df['CODIGO_POSTAL_DESTINO'].shift(1))

    # --- LAS REGLAS DE ORO ---
    # 1. Es el mismo cliente.
    # 2. La diferencia de guías es 1 (consecutiva) O 0 (duplicado exacto).
    # 3. La diferencia de tiempo es <= 2 segundos (damos 1 seg de tolerancia por si acaso).
    condicion_error = (
        (df['MISMO_CLIENTE']) & 
        (df['DIFF_RASTREO'] <= 1) & 
        (df['DIFF_TIEMPO'] <= 2)
    )

    # Obtenemos los índices de las filas que cumplen (estas son las "segundas" del par)
    indices_duplicados = df.index[condicion_error]

    if len(indices_duplicados) == 0:
        print("✅ No se encontraron duplicados con estos criterios tan estrictos.")
        return

    # Recuperamos TAMBIÉN la fila "original" (la anterior) para que veas el par completo
    # Usamos un set para evitar duplicar índices si hay tripletas
    indices_totales = set(indices_duplicados).union(set(indices_duplicados - 1)) # Esto asume index default numérico
    
    # Si reordenamos el DF, los índices originales se mantienen, así que necesitamos 
    # localizar por posición para traer al "hermano" anterior.
    # Manera segura de traer los pares:
    ids_finales = []
    # df es el dataframe ordenado actualmente
    # Recorremos el df buscando donde se activó la bandera
    df['ES_DUPLICADO'] = condicion_error
    
    # Filtramos para ver solo los rows marcados
    duplicados_confirmados = df[df['ES_DUPLICADO']].copy()
    
    print(f"⚠️ ¡Encontrados {len(duplicados_confirmados)} pares confirmados (aprox {len(duplicados_confirmados)*2} guías)!")

    # ==========================================
    # 3. EXPORTAR RESULTADOS (Columnas Limpias)
    # ==========================================
    archivo_salida = "duplicados_confirmados_consecutivos.xlsx"
    
    cols_exportar = [
        'RASTREO', 
        'FECHA_CREACION', 
        'NOM_DESTINO', 
        'CODIGO_POSTAL_DESTINO',
        'DIFF_RASTREO',     # Debe ser 1 o 0
        'DIFF_TIEMPO'       # Debe ser casi 0
    ]
    
    # Para exportar, queremos ver el par. 
    # Truco: Filtramos el DF original ordenado usando los índices detectados y sus previos
    # (Esto requiere un poco de magia de pandas para obtener los pares visualmente juntos)
    
    # Obtenemos la posición entera (iloc) de los duplicados
    posiciones = np.where(condicion_error)[0]
    # Agregamos la posición anterior para tener el par (n y n-1)
    posiciones_pares = np.sort(np.unique(np.concatenate((posiciones, posiciones - 1))))
    
    df_export = df.iloc[posiciones_pares].copy()

    df_export[cols_exportar].to_excel(archivo_salida, index=False)

    print( df_export[cols_exportar])
    
    print(f"\n💾 Archivo guardado: {archivo_salida}")
    print("👉 Abre el archivo. Deberías ver PARES exactos.")
    print("   Ejemplo: Guía ...40 y ...41 con el mismo segundo de creación.")

if __name__ == "__main__":
    analizar_duplicados_estrictos()