
export function generateCode(prefix: string, sequence?: number): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = sequence ? String(sequence).padStart(3, '0') : String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${prefix}-${dateStr}-${seq}`;
}


export function generateUniqueCode(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `${prefix}-${dateStr}-${timeStr}-${random}`;
}
