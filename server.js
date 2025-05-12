const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let numberWindow = [];

const API_BASE = "http://20.244.56.144/evaluation-service";

const API_MAP = {
  p: `${API_BASE}/primes`,
  f: `${API_BASE}/fibo`,
  e: `${API_BASE}/even`,
  r: `${API_BASE}/rand`,
};

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMyNzIwLCJpYXQiOjE3NDcwMzI0MjAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjIyNWRlZDcxLTMzYjctNGM0Zi04Y2NmLTQxMGVmNDY1NzQ4NiIsInN1YiI6ImJhdnlhZGhhcnNoaW5pci4yMmNzZUBrb25ndS5lZHUifSwiZW1haWwiOiJiYXZ5YWRoYXJzaGluaXIuMjJjc2VAa29uZ3UuZWR1IiwibmFtZSI6ImJhdnlhZGhhcnNoaW5pIHIiLCJyb2xsTm8iOiIyMmNzcjAzMCIsImFjY2Vzc0NvZGUiOiJqbXBaYUYiLCJjbGllbnRJRCI6IjIyNWRlZDcxLTMzYjctNGM0Zi04Y2NmLTQxMGVmNDY1NzQ4NiIsImNsaWVudFNlY3JldCI6IkJzU0FQdlN3VlloZHJ4eXkifQ.gdZUQYV1VSz5Be5Y8v9ts9_K1D0WxRnq2ZBrgXLbFvw";

async function fetchNumbersFromAPI(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return res.data.numbers || [];
  } catch (err) {
    console.error("Error fetching numbers:", err.message);
    return [];
  }
}

app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;
  const endpoint = API_MAP[numberid];

  if (!endpoint) {
    return res.status(400).json({ error: "Invalid type. Use p, f, e, or r." });
  }

  const windowPrevState = [...numberWindow];
  const fetchedNumbers = await fetchNumbersFromAPI(endpoint);

  for (const num of fetchedNumbers) {
    if (!numberWindow.includes(num)) {
      if (numberWindow.length >= WINDOW_SIZE) {
        numberWindow.shift(); 
      }
      numberWindow.push(num);
    }
  }

  const avg = numberWindow.length
    ? parseFloat(
        (numberWindow.reduce((sum, val) => sum + val, 0) / numberWindow.length).toFixed(2)
      )
    : 0.0;

  return res.json({
    windowPrevState,
    windowCurrState: numberWindow,
    numbers: fetchedNumbers,
    avg,
  });
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});

