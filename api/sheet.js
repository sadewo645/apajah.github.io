export default async function handler(req, res) {
  const { sheet = 'Perkebunan' } = req.query;
  const url = `https://script.google.com/macros/s/AKfycbyZVUuOh3_WWXeLYP5Q9-pBkaFy-DAstfjKuZglh2y6QJHzkGE4_Ro4d_sRKCC69YGw/exec?sheet=${encodeURIComponent(sheet)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: String(error) });
  }
}
