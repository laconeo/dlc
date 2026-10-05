import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'dlc_prize_cards_cache';

export interface PrizeCardData {
  week: number;
  imageUrl: string;
  title?: string;
  patriarch?: string;
  updatedAt?: string;
}

export interface SavePrizeCardResult {
  success: boolean;
  cloudSynced: boolean;
  error?: string;
}

/**
 * Optimiza y comprime la imagen a max 1000px de ancho para cartas premio nítidas
 */
export function compressPrizeCardImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Calidad 0.82 para balance óptimo de nitidez y peso (~90-140KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Obtiene las cartas premio guardadas localmente (por semana: 1, 2, 3, 4)
 */
export function getStoredPrizeCards(): Record<number, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Error reading local prize cards cache:', err);
    return {};
  }
}

/**
 * Guarda una carta premio en caché local y sincroniza en Supabase.
 * Usa la tabla `prize_cards` si existe, y además respalda en `daily_cards` con day: 100 + week
 * para máxima compatibilidad sin necesidad de migraciones previas.
 */
export async function savePrizeCard(
  week: number,
  imageUrl: string,
  patriarch: string = ''
): Promise<SavePrizeCardResult> {
  // 1. Guardar en localStorage inmediatamente
  try {
    const current = getStoredPrizeCards();
    current[week] = imageUrl;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error saving prize card to localStorage:', err);
  }

  let cloudSynced = false;
  let lastError: string | undefined;

  // 2. Intentar guardar en public.prize_cards
  try {
    const { error: prizeError } = await supabase.from('prize_cards').upsert(
      {
        week,
        image_url: imageUrl,
        patriarch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'week' }
    );

    if (!prizeError) {
      cloudSynced = true;
    } else {
      lastError = prizeError.message;
    }
  } catch (e: any) {
    lastError = e?.message;
  }

  // 3. Respaldo en daily_cards con day = 100 + week (ej: 101 para semana 1)
  try {
    const fallbackDay = 100 + week;
    const { error: dailyFallbackError } = await supabase.from('daily_cards').upsert(
      {
        day: fallbackDay,
        image_url: imageUrl,
        character: `Carta Premio Semana ${week}: ${patriarch}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'day' }
    );

    if (!dailyFallbackError) {
      cloudSynced = true;
    }
  } catch (e) {
    // Si falla el respaldo secundario, no bloquea
  }

  return {
    success: true,
    cloudSynced,
    error: cloudSynced ? undefined : lastError,
  };
}

/**
 * Elimina una carta premio de la caché y de Supabase
 */
export async function deletePrizeCard(week: number): Promise<{ success: boolean; cloudSynced: boolean }> {
  try {
    const current = getStoredPrizeCards();
    delete current[week];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error deleting prize card from localStorage:', err);
  }

  let cloudSynced = false;
  try {
    await supabase.from('prize_cards').delete().eq('week', week);
    await supabase.from('daily_cards').delete().eq('day', 100 + week);
    cloudSynced = true;
  } catch (err) {
    console.warn('Supabase prize card delete warning:', err);
  }

  return { success: true, cloudSynced };
}

/**
 * Descarga las cartas premio desde Supabase y actualiza la caché local
 */
export async function fetchRemotePrizeCards(): Promise<Record<number, string>> {
  const localMap = getStoredPrizeCards();
  const remoteMap: Record<number, string> = { ...localMap };

  // 1. Intentar desde public.prize_cards
  try {
    const { data, error } = await supabase
      .from('prize_cards')
      .select('week, image_url')
      .order('week', { ascending: true });

    if (!error && data && data.length > 0) {
      data.forEach((row) => {
        if (row.week && row.image_url) {
          remoteMap[row.week] = row.image_url;
        }
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteMap));
      return remoteMap;
    }
  } catch (err) {
    // Silencioso, pasa al respaldo
  }

  // 2. Respaldo desde daily_cards donde day esté entre 101 y 104
  try {
    const { data: fallbackData, error: fbError } = await supabase
      .from('daily_cards')
      .select('day, image_url')
      .gte('day', 101)
      .lte('day', 104);

    if (!fbError && fallbackData && fallbackData.length > 0) {
      fallbackData.forEach((row) => {
        const week = row.day - 100;
        if (week >= 1 && week <= 4 && row.image_url) {
          remoteMap[week] = row.image_url;
        }
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteMap));
      return remoteMap;
    }
  } catch (err) {
    console.warn('Could not fetch remote prize cards, using local cache:', err);
  }

  return localMap;
}
