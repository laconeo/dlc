import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'dlc_daily_cards_cache';
const IDB_NAME = 'dlc_cards_db';
const IDB_STORE = 'daily_cards';
const IDB_VERSION = 1;

export const DEFAULT_CARDS: Record<number, string> = {
  1: `${import.meta.env.BASE_URL}cartas/josue.jpeg`,
};

export interface DailyCardData {
  day: number;
  imageUrl: string;
  character?: string;
  updatedAt?: string;
}

export interface SaveCardResult {
  success: boolean;
  cloudSynced: boolean;
  error?: string;
}

export interface CloudStatusResult {
  available: boolean;
  count: number;
  error?: string;
}

// Caché en memoria para acceso sincrónico ultrarrápido
const memoryCache: Record<number, string> = { ...DEFAULT_CARDS };

// Inicializar memoria desde localStorage de inmediato
try {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    Object.assign(memoryCache, parsed);
  }
} catch {
  // Ignorar error inicial
}

// Helper para abrir IndexedDB (permite almacenar megabytes de imágenes sin límite de 5MB)
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'day' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Cargar todas las cartas de IndexedDB a memoria en segundo plano
async function initFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      if (Array.isArray(req.result)) {
        req.result.forEach((item: { day: number; imageUrl: string }) => {
          if (item?.day && item?.imageUrl) {
            memoryCache[item.day] = item.imageUrl;
          }
        });
      }
    };
  } catch {
    // Si IndexedDB no está disponible, se usa memoryCache y Supabase
  }
}

// Iniciar carga de IndexedDB al arrancar
initFromIndexedDB();

// Guardar en IndexedDB
async function saveToIndexedDB(day: number, imageUrl: string): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({ day, imageUrl, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.debug('[DLC] Error al guardar en IndexedDB:', err);
  }
}

// Guardar mapa completo en IndexedDB
async function saveMapToIndexedDB(map: Record<number, string>): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    for (const [dayStr, imageUrl] of Object.entries(map)) {
      if (imageUrl) {
        store.put({ day: Number(dayStr), imageUrl });
      }
    }
  } catch {
    // Silencioso
  }
}

// Eliminar de IndexedDB
async function deleteFromIndexedDB(day: number): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(day);
  } catch {
    // Silencioso
  }
}

/**
 * Guarda en localStorage de forma silenciosa y segura sin romper por cuota.
 */
function safeLocalStorageSave(day: number, imageUrl: string): boolean {
  memoryCache[day] = imageUrl;
  saveToIndexedDB(day, imageUrl);

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const current: Record<string, string> = raw ? JSON.parse(raw) : {};
    current[String(day)] = imageUrl;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch {
    // Si localStorage está lleno, ya está a salvo en memoryCache e IndexedDB
    return true;
  }
}

/**
 * Guarda el mapa en localStorage de forma segura evitando errores de cuota.
 */
function safeLocalStorageSaveMap(map: Record<number, string>): boolean {
  Object.assign(memoryCache, map);
  saveMapToIndexedDB(map);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    // Si falla por límite de 5MB, guardar solo URLs ligeras (<1KB) en localStorage
    // mientras IndexedDB y la memoria retienen todas las imágenes completas
    try {
      const lightMap: Record<number, string> = {};
      for (const [key, val] of Object.entries(map)) {
        if (val && val.length < 1024) {
          lightMap[Number(key)] = val;
        }
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightMap));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Obtiene las cartas guardadas localmente (memoria / IndexedDB / localStorage)
 */
export function getStoredDailyCards(): Record<number, string> {
  return { ...DEFAULT_CARDS, ...memoryCache };
}

/**
 * Verifica si la tabla public.daily_cards existe y es accesible en Supabase
 */
export async function checkDailyCardsCloudStatus(): Promise<CloudStatusResult> {
  try {
    const { data, error, count } = await supabase
      .from('daily_cards')
      .select('day', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('[DLC] checkDailyCardsCloudStatus error:', error.message, error.details, error.hint);
      return {
        available: false,
        count: 0,
        error: error.message,
      };
    }

    return {
      available: true,
      count: count ?? (data?.length || 0),
    };
  } catch (err: any) {
    return {
      available: false,
      count: 0,
      error: err?.message || 'Error de conexión',
    };
  }
}

/**
 * Guarda una carta en la memoria, IndexedDB y sincroniza inmediatamente con Supabase.
 */
export async function saveDailyCard(
  day: number,
  imageUrl: string,
  characterName: string = ''
): Promise<SaveCardResult> {
  // 1. Guardar localmente (memoria, IndexedDB y localStorage)
  safeLocalStorageSave(day, imageUrl);

  // 2. Sincronizar en Supabase para que sea visible por todos los alumnos
  try {
    const { error } = await supabase.from('daily_cards').upsert(
      {
        day,
        image_url: imageUrl,
        character: characterName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'day' }
    );

    if (error) {
      console.error('[DLC] Supabase daily_cards upsert ERROR:', error.message, error.details, error.hint);
      return {
        success: true,
        cloudSynced: false,
        error: `Upsert falló: ${error.message}. Revisa permisos en Supabase.`,
      };
    }

    // Verificar que realmente se guardó leyendo de vuelta
    const { data: verifyData, error: verifyError } = await supabase
      .from('daily_cards')
      .select('day, image_url')
      .eq('day', day)
      .maybeSingle();

    if (verifyError || !verifyData || !verifyData.image_url) {
      console.error('[DLC] Verificación post-upsert FALLÓ:', verifyError?.message || 'No se encontró el registro');
      return {
        success: true,
        cloudSynced: false,
        error: 'El registro se insertó pero no se pudo verificar con SELECT.',
      };
    }

    console.log(`[DLC] ✅ Carta día ${day} guardada y verificada en Supabase (${Math.round(imageUrl.length / 1024)}KB).`);

    return {
      success: true,
      cloudSynced: true,
    };
  } catch (err: any) {
    console.error('[DLC] Supabase not reachable for daily_cards:', err);
    return {
      success: true,
      cloudSynced: false,
      error: err?.message || 'No se pudo conectar a la base de datos en la nube',
    };
  }
}

/**
 * Sincroniza todas las cartas locales hacia Supabase.
 * IMPORTANTE: NO borra cartas del servidor que no estén en local.
 */
export async function syncLocalCardsToCloud(): Promise<{ syncedCount: number; error?: string }> {
  const localCards = getStoredDailyCards();
  const daysToSync = Object.keys(localCards)
    .map(Number)
    .filter((d) => {
      const val = localCards[d];
      return Boolean(val) && !val.startsWith('/') && !val.startsWith(`${import.meta.env.BASE_URL}`);
    });

  if (daysToSync.length === 0) {
    console.log('[DLC] syncLocalCardsToCloud: No hay cartas locales para sincronizar.');
    return { syncedCount: 0 };
  }

  console.log(`[DLC] syncLocalCardsToCloud: Sincronizando ${daysToSync.length} cartas locales: días ${daysToSync.join(', ')}`);

  let count = 0;
  let lastError: string | undefined;

  for (const day of daysToSync) {
    try {
      const { error } = await supabase.from('daily_cards').upsert(
        {
          day,
          image_url: localCards[day],
          character: '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'day' }
      );
      if (error) {
        console.error(`[DLC] Sync error for day ${day}:`, error.message, error.details);
        lastError = error.message;
      } else {
        console.log(`[DLC] ✅ Día ${day} sincronizado a la nube.`);
        count++;
      }
    } catch (e: any) {
      console.error(`[DLC] Sync exception for day ${day}:`, e);
      lastError = e?.message;
    }
  }

  return { syncedCount: count, error: lastError };
}

/**
 * Elimina una carta de la caché y de Supabase
 */
export async function deleteDailyCard(day: number): Promise<{ success: boolean; cloudSynced: boolean }> {
  delete memoryCache[day];
  deleteFromIndexedDB(day);

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const current = JSON.parse(raw);
      delete current[day];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    }
  } catch {
    // Silencioso
  }

  try {
    const { error } = await supabase.from('daily_cards').delete().eq('day', day);
    if (error) {
      console.error('[DLC] deleteDailyCard Supabase error:', error.message);
      return { success: true, cloudSynced: false };
    }
    return { success: true, cloudSynced: true };
  } catch {
    return { success: true, cloudSynced: false };
  }
}

/**
 * Descarga todas las cartas almacenadas en Supabase y las combina con la memoria/IndexedDB.
 */
export async function fetchRemoteDailyCards(): Promise<Record<number, string>> {
  const localMap = getStoredDailyCards();

  try {
    const { data, error } = await supabase
      .from('daily_cards')
      .select('day, image_url')
      .order('day', { ascending: true });

    if (error) {
      console.error('[DLC] fetchRemoteDailyCards error:', error.message, error.details);
      return localMap;
    }

    if (!data) {
      console.warn('[DLC] fetchRemoteDailyCards: data es null. Usando caché local.');
      return localMap;
    }

    console.log(`[DLC] fetchRemoteDailyCards: Supabase devolvió ${data.length} cartas.`);

    // Construir mapa remoto
    const remoteMap: Record<number, string> = {};
    data.forEach((row) => {
      if (row.day != null && row.image_url) {
        remoteMap[row.day] = row.image_url;
      }
    });

    // Merge: Remotas tienen prioridad
    const mergedMap: Record<number, string> = { ...DEFAULT_CARDS, ...localMap, ...remoteMap };

    // Guardar en memoria, IndexedDB y localStorage seguro
    safeLocalStorageSaveMap(mergedMap);

    console.log(`[DLC] fetchRemoteDailyCards: Total cartas activas: ${Object.keys(mergedMap).length} (${data.length} remotas)`);

    return mergedMap;
  } catch (err) {
    console.warn('[DLC] Could not fetch remote daily_cards, using local cache:', err);
    return localMap;
  }
}
