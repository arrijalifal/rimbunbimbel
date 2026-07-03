import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from '../rimbunbimbelkey.json' with {type: 'json'};
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getGoogleSheetsClient() {
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
}

export async function getUsers() {
  const doc = await getGoogleSheetsClient();
  const sheet = doc.sheetsByIndex[2];
  const rows = await sheet.getRows();
  
  const users = rows.map(row => ({
    // id: row.get('id') || row.rowNumber,
    username: row.get('username'),
    password: row.get('password'), // Hashed password
    // name: row.get('name') || row.get('username')
    role: row.get('role')
  }));

  return users;
}

export async function findUserByUsername(username: string) {
  const users = await getUsers();
  return users.find(user => user.username === username);
}