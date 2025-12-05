// ----------------------
// IndexedDB Setup
// ----------------------
let db;

const request = indexedDB.open("sodaroDB", 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  db.createObjectStore("apiData", { keyPath: "id" });
};

request.onsuccess = function (e) {
  db = e.target.result;
  loadStoredData();
};

request.onerror = function () {
  console.error("IndexedDB failed.");
};


// ----------------------
// Save to IndexedDB
// ----------------------
function saveData(id, data) {
  const tx = db.transaction("apiData", "readwrite");
  tx.objectStore("apiData").put({ id, data });
}

// ----------------------
// Load stored data
// ----------------------
function loadStoredData() {
  const tx = db.transaction("apiData", "readonly");
  const store = tx.objectStore("apiData");

  ["btc", "user"].forEach(id => {
    const req = store.get(id);
    req.onsuccess = () => {
      if (req.result) displayData(id, req.result.data);
    };
  });
}


// ----------------------
// Fetch API Data
// ----------------------
document.getElementById("fetchBtn").addEventListener("click", fetchAllData);

async function fetchAllData() {
  document.getElementById("status").textContent = "Fetching…";

  try {
    // BTC
    const btcRes = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
    const btcData = await btcRes.json();
    saveData("btc", btcData);
    displayData("btc", btcData);

    // Random User
    const userRes = await fetch("https://randomuser.me/api/");
    const userData = await userRes.json();
    saveData("user", userData);
    displayData("user", userData);

    document.getElementById("status").textContent = "Updated ✔";

  } catch (err) {
    document.getElementById("status").textContent = "Offline — Loaded Cached Data";
  }
}


// ----------------------
// Display Data
// ----------------------
function displayData(id, data) {
  if (id === "btc") {
    document.getElementById("btcOutput").textContent =
      `USD: $${data.bpi.USD.rate}`;
  }

  if (id === "user") {
    const u = data.results[0];
    document.getElementById("userOutput").textContent =
      `${u.name.first} ${u.name.last} — ${u.location.country}`;
  }
}


// ----------------------
// Top 10 Crypto Bar Chart
// ----------------------
const cryptoNames = [
  "Bitcoin","Ethereum","Tether","XRP","BNB",
  "USDC","Solana","TRON","Dogecoin","Cardano"
];

const marketCaps = [
  1.84e12, 3.827e11, 1.8557e11, 1.2621e11, 1.2421e11,
  7.804e10, 7.772e10, 2.725e10, 2.383e10, 1.579e10
];

// Sodaro color
const sodaroColor = "#0ab3a3";

new Chart(document.getElementById("cryptoChart"), {
  type: "bar",
  data: {
    labels: cryptoNames,
    datasets: [{
      label: "Market Cap (USD)",
      data: marketCaps,
      backgroundColor: sodaroColor
    }]
  },
  options: {
    plugins: {
      legend: { labels: { color: "#e5e7eb" } }
    },
    scales: {
      x: { ticks: { color: "#e5e7eb" } },
      y: { ticks: { color: "#e5e7eb" } }
    }
  }
});
