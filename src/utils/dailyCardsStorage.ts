import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'dlc_daily_cards_cache';

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

/**
 * Obtiene las cartas guardadas localmente (Base64 o URLs)
 */
export function getStoredDailyCards(): Record<number, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_CARDS, ...parsed };
  } catch (err) {
    console.warn('Error reading local daily cards cache:', err);
    return { ...DEFAULT_CARDS };
  }
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
 * Guarda una carta en la caché local y sincroniza inmediatamente con Supabase
 */
export async function saveDailyCard(
  day: number,
  imageUrl: string,
  characterName: string = ''
): Promise<SaveCardResult> {
  // 1. Guardar en localStorage inmediatamente para visualización instantánea
  try {
    const current = getStoredDailyCards();
    current[day] = imageUrl;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error saving to localStorage:', err);
  }

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
      console.warn('Supabase daily_cards upsert warning:', error.message);
      return {
        success: true,
        cloudSynced: false,
        error: error.message,
      };
    }

    return {
      success: true,
      cloudSynced: true,
    };
  } catch (err: any) {
    console.warn('Supabase not reachable for daily_cards:', err);
    return {
      success: true,
      cloudSynced: false,
      error: err?.message || 'No se pudo conectar a la base de datos en la nube',
    };
  }
}

/**
 * Sincroniza todas las cartas guardadas en local hacia Supabase
 */
export async function syncLocalCardsToCloud(): Promise<{ syncedCount: number; error?: string }> {
  const localCards = getStoredDailyCards();
  const daysToSync = Object.keys(localCards)
    .map(Number)
    .filter((d) => Boolean(localCards[d]) && !localCards[d].startsWith('/')); // Evitar URLs relativas default

  if (daysToSync.length === 0) {
    return { syncedCount: 0 };
  }

  let count = 0;
  let lastError: string | undefined;

  for (const day of daysToSync) {
    try {
      const { error } = await supabase.from('daily_cards').upsert(
        {
          day,
          image_url: localCards[day],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'day' }
      );
      if (error) {
        lastError = error.message;
      } else {
        count++;
      }
    } catch (e: any) {
      lastError = e?.message;
    }
  }

  return { syncedCount: count, error: lastError };
}

/**
 * Elimina una carta de la caché y de Supabase
 */
export async function deleteDailyCard(day: number): Promise<{ success: boolean; cloudSynced: boolean }> {
  try {
    const current = getStoredDailyCards();
    delete current[day];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error deleting from localStorage:', err);
  }

  try {
    const { error } = await supabase.from('daily_cards').delete().eq('day', day);
    if (error) {
      console.warn('Supabase delete warning:', error.message);
      return { success: true, cloudSynced: false };
    }
    return { success: true, cloudSynced: true };
  } catch (err) {
    console.warn('Supabase delete exception:', err);
    return { success: true, cloudSynced: false };
  }
}

/**
 * Descarga las cartas desde Supabase y actualiza la caché local para todos los alumnos
 */
export async function fetchRemoteDailyCards(): Promise<Record<number, string>> {
  const localMap = getStoredDailyCards();

  try {
    const { data, error } = await supabase
      .from('daily_cards')
      .select('day, image_url')
      .order('day', { ascending: true });

    if (!error && data && data.length > 0) {
      const remoteMap: Record<number, string> = { ...localMap };
      data.forEach((row) => {
        if (row.day && row.image_url) {
          remoteMap[row.day] = row.image_url;
        }
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteMap));
      return remoteMap;
    }
  } catch (err) {
    console.warn('Could not fetch remote daily_cards, using local cache:', err);
  }

  return localMap;
}

