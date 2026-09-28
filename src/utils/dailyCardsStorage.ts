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
 * Guarda una carta en la caché local y sincroniza con Supabase
 */
export async function saveDailyCard(
  day: number,
  imageUrl: string,
  characterName: string = ''
): Promise<void> {
  // 1. Guardar en localStorage inmediatamente
  try {
    const current = getStoredDailyCards();
    current[day] = imageUrl;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error saving to localStorage:', err);
  }

  // 2. Intentar sincronizar en Supabase si la tabla existe
  try {
    const { error } = await supabase.from('daily_cards').upsert({
      day,
      image_url: imageUrl,
      character: characterName,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase daily_cards upsert warning (stored in local):', error.message);
    }
  } catch (err) {
    console.warn('Supabase not reachable for daily_cards, stored locally:', err);
  }
}

/**
 * Elimina una carta de la caché y de Supabase
 */
export async function deleteDailyCard(day: number): Promise<void> {
  try {
    const current = getStoredDailyCards();
    delete current[day];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error deleting from localStorage:', err);
  }

  try {
    await supabase.from('daily_cards').delete().eq('day', day);
  } catch (err) {
    console.warn('Supabase delete warning:', err);
  }
}

/**
 * Descarga las cartas desde Supabase y actualiza la caché local
 */
export async function fetchRemoteDailyCards(): Promise<Record<number, string>> {
  const localMap = getStoredDailyCards();

  try {
    const { data, error } = await supabase
      .from('daily_cards')
      .select('day, image_url');

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
