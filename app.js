// ============================
// IndexedDB Setup
// ============================
let db;

const request = indexedDB.open("sodaroDB", 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  let store = db.createObjectStore("apiData", { keyPath: "id" });
  console.log("Database ready.");
};

request.onsuccess = function (e) {
  db = e.target.result;
  console.log("DB Loaded Successfully.");
  loadStoredData();
};

request.onerror = function () {
  console.error("IndexedDB failed to open.");
};


// ============================
// Save Data into IndexedDB
// ============================
function saveData(id, data) {
  const tx = db.transaction("apiData", "readwrite");
  const store = tx.objectStore("apiData");
  store.put({ id, data });
}


// ============================
// Load stored data on startup
// ============================
function loadStoredData() {
  const tx = db.transaction("apiData", "readonly");
  const store = tx.objectStore("apiData");

  // Get both items
  ["btc", "user"].forEach((id) => {
    const req = store.get(id);
    req.onsuccess = () => {
      if (req.result) {
        displayData(id, req.result.data);
      }
    };
  });
}


// ============================
// Fetch Remote Data
// ============================
document.getElementById("fetchBtn").addEventListener("click", fetchAllData);

async function fetchAllData() {
  document.getElementById("status").textContent = "Fetching...";

  try {
    // API #1 — Bitcoin Price
    const btcRes = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
    const btcData = await btcRes.json();

    saveData("btc", btcData);
    displayData("btc", btcData);

    // API #2 — Random User
    const userRes = await fetch("https://randomuser.me/api/");
    const userData = await userRes.json();

    saveData("user", userData);
    displayData("user", userData);

    document.getElementById("status").textContent = "Data updated ✔";

  } catch (err) {
    document.getElementById("status").textContent = "Offline — loaded saved data.";
    console.error(err);
  }
}


// ============================
// Display Data in UI
// ============================
function displayData(id, data) {
  if (id === "btc") {
    document.getElementById("btcOutput").textContent =
      `USD: $${data.bpi.USD.rate}`;
  }

  if (id === "user") {
    const user = data.results[0];
    document.getElementById("userOutput").textContent =
      `${user.name.first} ${user.name.last} — ${user.location.country}`;
  }
}
