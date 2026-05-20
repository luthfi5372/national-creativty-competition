// Utility for merging tailwind classes similar to clsx and tailwind-merge
export function cn(...inputs: any[]) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export const generateTicketCode = (id: number | string): string => {
  if (!id) return "0000";
  
  const numId = typeof id === "number" ? id : parseInt(id, 10);
  if (!isNaN(numId)) {
    // Formula LCG coprime dengan modulo 9000
    const val = ((numId * 1793 + 4821) % 9000) + 1000;
    return String(val);
  }
  
  // Fallback hash jika id adalah string UUID/non-integer
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const val = (Math.abs(hash) % 9000) + 1000;
  return String(val);
};

