// Utility for merging tailwind classes similar to clsx and tailwind-merge
export function cn(...inputs: any[]) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * generateTicketCode — Generator ID Tiket 6 Karakter Alfanumerik
 * 
 * Mengubah ID peserta menjadi kode unik 6 karakter (huruf + angka).
 * Contoh output: "A3X7Q2", "NB5K1P", "Z9R4MJ"
 * 
 * Karakter yang DIGUNAKAN: A-Z (tanpa O, I) + 2-9 (tanpa 0, 1)
 * → Total 32 karakter bersih, tidak ada yang mirip/membingungkan
 * → 32^6 = 1.073.741.824 kemungkinan kombinasi
 * 
 * Format final di UI: NCC-A3X7Q2
 */
export const generateTicketCode = (id: number | string): string => {
  if (!id) return "AAAAAA";

  // Pool karakter: huruf + angka, tanpa karakter ambigu (O/0, I/1)
  const charPool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 karakter

  // Hitung seed awal dari ID
  let seed: number;
  const numId = typeof id === "number" ? id : parseInt(id, 10);

  if (!isNaN(numId)) {
    // ID integer: pakai formula LCG primer
    seed = (numId * 6364136223846793005 + 1442695040888963407) >>> 0;
    seed = (seed ^ (seed >>> 16)) >>> 0;
    seed = (seed * 1793 + 4821) % 2147483647;
  } else {
    // ID string UUID: hash djb2 yang dimodifikasi
    let hash = 5381;
    const strId = String(id);
    for (let i = 0; i < strId.length; i++) {
      hash = ((hash << 5) + hash) ^ strId.charCodeAt(i);
      hash = hash >>> 0; // pastikan unsigned 32-bit
    }
    seed = hash;
  }

  // Generate 6 karakter dengan LCG deterministik
  let result = "";
  let s = seed;
  for (let i = 0; i < 6; i++) {
    s = (s * 9301 + 49297) % 233280;
    result += charPool[Math.floor((s / 233280) * charPool.length)];
  }

  return result;
};
