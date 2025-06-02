const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = 3000;
const TIMEOUT_MS = 500;

app.use(cors());

app.get('/numbers', async (req, res) => {
  const rawUrlString = process.env.URLS || '';
  const urls = rawUrlString
    .split(',')
    .map(u => u.trim())
    .filter(Boolean); // remove empty strings

  const accessToken = process.env.ACCESS_TOKEN;

  if (urls.length === 0) {
    return res.status(400).json({ error: 'No URLs provided in .env' });
  }

  const fetchPromises = urls.map(url =>
    axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${accessToken}`, // Add token if required
      },
    })
    .then(res => Array.isArray(res.data.numbers) ? res.data.numbers : [])
    .catch(err => {
      console.error(`Error fetching ${url}:`, err.message);
      return [];
    })
  );

  try {
    const results = await Promise.all(fetchPromises);
    const merged = results.flat();
    const uniqueSorted = [...new Set(merged)].sort((a, b) => a - b);

    res.json({ numbers: uniqueSorted });
  } catch (err) {
    console.error('Unexpected server error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
