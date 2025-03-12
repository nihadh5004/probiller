const { ipcMain, app, remote } = require("electron");
const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs");

const userDataPath = (app || remote.app).getPath("userData");
let dbPath = path.join(userDataPath, "probiller" + ".db");

console.log(dbPath);
const database = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database opening error: ", err);
});

// If the database file doesn't exist, create it and initialize tables
if (!fs.existsSync(dbPath)) {
  fs.openSync(dbPath, "w");
  // Create orders table with discount columns
  database.run(
    "CREATE TABLE orders (id INTEGER, date TEXT, products TEXT, total_amount REAL, payment TEXT, mobile TEXT, name TEXT, discount REAL, discountedTotal REAL, PRIMARY KEY(id AUTOINCREMENT))"
  );
  database.run(
    "CREATE TABLE products (id INTEGER, name TEXT, price INTEGER, PRIMARY KEY(id AUTOINCREMENT))"
  );
  console.log("database initialized");
}

// If the database already exists, check and add new columns if they're missing
database.all("PRAGMA table_info(orders)", (err, columns) => {
  if (err) {
    console.error("Error reading table info:", err);
    return;
  }
  const columnNames = columns.map(col => col.name);
  if (!columnNames.includes("discount")) {
    database.run("ALTER TABLE orders ADD COLUMN discount REAL DEFAULT 0", (err) => {
      if (err) console.error("Error adding discount column:", err);
      else console.log("Added discount column to orders table.");
    });
  }
  if (!columnNames.includes("discountedTotal")) {
    database.run("ALTER TABLE orders ADD COLUMN discountedTotal REAL DEFAULT 0", (err) => {
      if (err) console.error("Error adding discountedTotal column:", err);
      else console.log("Added discountedTotal column to orders table.");
    });
  }
});

ipcMain.on("asynchronous-message", (event, arg) => {
  const sql = arg;
  database.all(sql, (err, rows) => {
    event.reply("asynchronous-reply", (err && err.message) || rows);
  });
});
