export default async function handler(req, res) {
  const { sheet = 'Perkebunan' } = req.query;
  const url = `https://script.google.com/macros/s/AKfycbwGJcBXnbtyVWl3bY2HTdMy9rbWJf2QlSSVNuuEy5wj0bcz4F--0vgM0NNXltgOHWkB/exec?sheet=${encodeURIComponent(sheet)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from Google Script: ${response.statusText}` });
    }

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(500).json({ error: 'Invalid JSON response', raw: text });
    }

    // Tambahkan header agar tidak diblokir oleh CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
