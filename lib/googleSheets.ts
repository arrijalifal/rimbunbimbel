import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from '../rimbunbimbelkey.json' with {type: 'json'};
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getGoogleSheetsClient() {
  try {
    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      serviceAccountAuth
    );

    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('Error connecting to Google Sheets:', error);
    throw error;
  }
}

// ===== SHEET 1: Data Murid =====
export async function getMuridByUsername(username: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const murid = rows.find(row => row.get('username') === username);
    if (!murid) return null;

    return {
      username: murid.get('username'),
      nama: murid.get('nama'),
      kelas: murid.get('kelas'),
      program: murid.get('program'),
      jadwal_les: murid.get('jadwal_les'),
      bergabung: murid.get('bergabung'),
    };
  } catch (error) {
    console.error('Error reading murid data:', error);
    throw new Error('Gagal membaca data murid');
  }
}

// ===== SHEET 1: Data Murid (untuk profil) =====
export async function getProfilByUsername(username: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[0]; // Sheet 1 - Data Murid
    const rows = await sheet.getRows();
    
    const profilData = rows.find(row => row.get('username') === username);
    
    if (!profilData) {
      return null;
    }

    return {
      username: profilData.get('username'),
      nama: profilData.get('nama'),
      kelas: profilData.get('kelas'),
      program: profilData.get('program'),
      jadwal_les: profilData.get('jadwal_les'),
      bergabung: profilData.get('bergabung'),
    };
  } catch (error) {
    console.error('Error reading profil data:', error);
    throw new Error('Gagal membaca data profil dari spreadsheet');
  }
}

// ===== SHEET 2: Data Guru =====
export async function getGuruByUsername(username: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[1]; // Sheet 2 - Data Guru
    const rows = await sheet.getRows();
    
    const guru = rows.find(row => row.get('username') === username);
    if (!guru) return null;

    return {
      username: guru.get('username'),
      nama: guru.get('nama'),
      no_hp: guru.get('no_hp') || '-',
      email: guru.get('email') || '-',
    };
  } catch (error) {
    console.error('Error reading guru data:', error);
    throw new Error('Gagal membaca data guru dari spreadsheet');
  }
}

// ===== SHEET 3: Login =====
export async function getUsers() {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[2];
    const rows = await sheet.getRows();
    
    const users = rows.map(row => ({
      username: row.get('username'),
      password: row.get('password'),
      role: row.get('role') || 'Murid'
    }));

    return users;
  } catch (error) {
    console.error('Error reading users:', error);
    throw new Error('Gagal membaca data pengguna');
  }
}

export async function findUserByUsername(username: string) {
  const users = await getUsers();
  return users.find(user => user.username === username);
}

// ===== SHEET 4: Jadwal Murid =====
export async function getJadwalMurid(username: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[3];
    const rows = await sheet.getRows();
    
    const jadwal = rows
      .filter(row => row.get('username').toLowerCase() === username.toLowerCase())
      .map(row => ({
        hari: row.get('hari'),
        jam: row.get('jam'),
      }));

    return jadwal;
  } catch (error) {
    console.error('Error reading jadwal murid:', error);
    throw new Error('Gagal membaca jadwal murid');
  }
}

// ===== SHEET 5: Jadwal Mapel =====
export async function getJadwalMapel(mingguKe: number, hari: string, program: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[4];
    const rows = await sheet.getRows();
    
    const jadwal = rows
      .filter(row => 
        parseInt(row.get('minggu_ke')) === mingguKe &&
        row.get('hari') === hari &&
        row.get('program') === program
      )
      .map(row => ({
        mapel_1: row.get('mapel_1'),
        mapel_2: row.get('mapel_2'),
      }));

    return jadwal;
  } catch (error) {
    console.error('Error reading jadwal mapel:', error);
    throw new Error('Gagal membaca jadwal mapel');
  }
}

// ===== SHEET 6: Absensi =====
export async function getAbsensiByUsername(username: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[5];
    const rows = await sheet.getRows();
    
    const absensi = rows
      .filter(row => row.get('username').toLowerCase() === username.toLowerCase())
      .map(row => ({
        tanggal: row.get('tanggal'),
        hari: row.get('hari'),
        jam: row.get('jam'),
        mapel: row.get('mapel') || '-',
        status: row.get('status'),
        verifikasi_oleh: row.get('verifikasi_oleh') || '-',
      }));

    return absensi;
  } catch (error) {
    console.error('Error reading absensi:', error);
    throw new Error('Gagal membaca data absensi');
  }
}

export async function getAbsensiPending() {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[5];
    const rows = await sheet.getRows();
    
    const pending = rows
      .filter(row => row.get('status') === 'Pending')
      .map(row => ({
        username: row.get('username'),
        tanggal: row.get('tanggal'),
        hari: row.get('hari'),
        jam: row.get('jam'),
        mapel: row.get('mapel') || '-',
        status: row.get('status'),
        verifikasi_oleh: row.get('verifikasi_oleh') || '-',
        rowIndex: row.rowNumber,
      }));

    return pending;
  } catch (error) {
    console.error('Error reading pending absensi:', error);
    throw new Error('Gagal membaca data absensi pending');
  }
}

export async function addAbsensi(data: {
  username: string;
  tanggal: string;
  hari: string;
  jam: string;
  mapel: string;
  status: string;
  verifikasi_oleh: string;
}) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[5];
    await sheet.addRow({
      username: data.username,
      tanggal: data.tanggal,
      hari: data.hari,
      jam: data.jam,
      mapel: data.mapel,
      status: data.status,
      verifikasi_oleh: data.verifikasi_oleh,
    });
    return true;
  } catch (error) {
    console.error('Error adding absensi:', error);
    throw new Error('Gagal menambahkan data absensi');
  }
}

export async function updateAbsensiStatus(rowIndex: number, status: string, verifikasi_oleh: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[5];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.rowNumber === rowIndex);
    
    if (row) {
      row.set('status', status);
      row.set('verifikasi_oleh', verifikasi_oleh);
      await row.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating absensi:', error);
    throw new Error('Gagal mengupdate data absensi');
  }
}

// ===== SHEET 7: Nilai Murid =====
export async function addNilaiMurid(data: {
  username: string;
  tanggal: string;
  hari: string;
  mapel: string;
  pengajar: string;
  nilai: string;
  predikat: string;
  catatan: string;
}) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[6];
    await sheet.addRow({
      username: data.username,
      tanggal: data.tanggal,
      hari: data.hari,
      mapel: data.mapel,
      pengajar: data.pengajar,
      nilai: data.nilai,
      predikat: data.predikat,
      catatan: data.catatan,
    });
    return true;
  } catch (error) {
    console.error('Error adding nilai murid:', error);
    throw new Error('Gagal menambahkan data nilai murid');
  }
}