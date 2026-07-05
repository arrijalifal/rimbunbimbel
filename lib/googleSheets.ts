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

// ===== SHEET KE-3: Login =====
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
    throw new Error('Gagal membaca data pengguna dari spreadsheet');
  }
}

export async function findUserByUsername(username: string) {
  const users = await getUsers();
  return users.find(user => user.username === username);
}

// ===== SHEET PERTAMA: Data Profil =====
export async function getProfilByUsername(username: string) {
  try {
    const doc = await getGoogleSheetsClient();
    const sheet = doc.sheetsByIndex[0]; // Sheet pertama
    const rows = await sheet.getRows();
    
    // Cari data berdasarkan username
    console.log('starting get profilData');
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