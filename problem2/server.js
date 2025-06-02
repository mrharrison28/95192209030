const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const TIMEOUT_MS = 500;

app.use(cors());

app.get('/numbers', async (req, res) => {
  const urls = process.env.URLS?.split(',').map(url => url.trim()) || [];
  const token = process.env.ACCESS_TOKEN;

  if (!urls.length) return res.status(400).json({ error: 'No URLs configured.' });

  const fetchPromises = urls.map(url =>
    axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response =>
      Array.isArray(response.data.numbers) ? response.data.numbers : []
    ).catch(err => {
      console.error(`Error fetching ${url}: ${err.message}`);
      return [];
    })
  );

  try {
    const results = await Promise.all(fetchPromises);
    const combined = results.flat();
    const uniqueSorted = [...new Set(combined)].sort((a, b) => a - b);

    res.json({ numbers: uniqueSorted });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
