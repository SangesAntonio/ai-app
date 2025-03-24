// api/salva.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST è accettato' });
  }

  const data = req.body;

  if (!data || !data.start_timestamp || !data.letture) {
    return res.status(400).json({ error: 'Dati incompleti' });
  }

  const filePath = path.join(process.cwd(), 'data.json');
  const fileData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};

  const timestamp = new Date().toISOString();
  fileData[timestamp] = data;

  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

  res.status(200).json({ ok: true });
}
