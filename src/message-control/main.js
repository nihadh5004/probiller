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

if (!fs.existsSync(dbPath)) {
  fs.openSync(dbPath, "w");
  database.run(
    "CREATE TABLE orders (id	INTEGER,date	TEXT,products	TEXT,total_amount	REAL,payment	TEXT,mobile	TEXT,name	TEXT,PRIMARY KEY(id AUTOINCREMENT))"
  );
  database.run(
    "CREATE TABLE products (id	INTEGER,name	TEXT,price	INTEGER,PRIMARY KEY(id AUTOINCREMENT))"
  );

  console.log("database initialized");
}

ipcMain.on("asynchronous-message", (event, arg) => {
  const sql = arg;
  database.all(sql, (err, rows) => {
    event.reply("asynchronous-reply", (err && err.message) || rows);
  });
});
