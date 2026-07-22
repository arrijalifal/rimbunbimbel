/**
 * Hitung minggu ke berapa berdasarkan tanggal mulai 6 Juli 2026
 * @param date - Date object
 * @returns minggu ke-berapa (1, 2, 3, 4)
 */
export function getMingguKe(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Cari tanggal 1 bulan ini
  const firstDay = new Date(year, month, 1);
  
  // Cari hari Senin pertama di bulan ini
  let firstMonday = new Date(firstDay);
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }
  
  // Cari hari Senin di minggu yang sama dengan tanggal yang dicari
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);
  
  let currentMonday = new Date(dateCopy);
  while (currentMonday.getDay() !== 1) {
    currentMonday.setDate(currentMonday.getDate() - 1);
  }
  
  // Hitung selisih dari Senin pertama ke Senin di minggu yang sama
  const diffFromFirstMonday = Math.floor((currentMonday.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
  
  // Minggu = diffFromFirstMonday / 5 + 1
  let minggu = Math.floor(diffFromFirstMonday / 5) + 1;
  
  // Batasi maksimal 4
  if (minggu > 4) minggu = 4;
  if (minggu < 1) minggu = 1;
  
  return minggu;
}