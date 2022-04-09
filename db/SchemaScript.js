import { openDatabase } from "expo-sqlite";

const db = openDatabase("notes.db");

/**
 * Enable foreign key support for sqlite db.
 */
function enableForeignKeys() {
  db.exec([{ sql: "PRAGMA foreign_keys = ON;", args: [] }], false, () => {});
}

/**
 * Create tables and insert default values.
 */
export function initializeDB() {
  enableForeignKeys();
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS BackupFrequency(Frequency [Daily, Weekly, Monthly] UNIQUE NOT NULL," +
        "PRIMARY KEY(Frequency))",
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Users(UserID INTEGER UNIQUE NOT NULL, UserEmail TEXT UNIQUE NOT NULL," +
        "BackupFrequency TEXT, BackupSize INTEGER, BackupDate DATE, NextBackUpDate INT, PRIMARY KEY(UserID), FOREIGN KEY (BackupFrequency) REFERENCES BackupFrequency(Frequency))",
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Settings(SettingName TEXT UNIQUE NOT NULL," +
        " SettingEnabled INTEGER NOT NULL, SettingSynced INTEGER, PRIMARY KEY(SettingName))",
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Category(CategoryName TEXT NOT NULL, " +
        "RedColor INT, GreenColor INT, BlueColor INT, PRIMARY KEY(CategoryName)) ",
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Notes(NotesID INTEGER UNIQUE NOT NULL, " +
        "Title TEXT, CategoryName TEXT, Label TEXT, Content TEXT, DateAdded DATE, TimeStamp INT, Deleted TEXT, Pinned TEXT, Synced TEXT," +
        "PRIMARY KEY (NotesID) FOREIGN KEY (CategoryName) REFERENCES Category ON DELETE SET NULL ON UPDATE CASCADE)",
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO Settings VALUES ("DetailedView", 1, 0)',
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO Settings VALUES ("TwoFactor", 0, 0)',
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO Settings VALUES ("BackupEnabled", 0, 0)',
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO BackupFrequency VALUES ("Daily")',
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO BackupFrequency VALUES ("Weekly")',
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO BackupFrequency VALUES ("Monthly")',
      [],
      null,
      (t, error) => console.log(error)
    );

    tx.executeSql(
      'INSERT OR IGNORE INTO Category VALUES ("None", 209, 211, 212)',
      null,
      null,
      (t, error) => console.log(error)
    );
  });
}

/**
 * Drop database tables
 */
export function dropTables() {
  db.transaction((tx) => {
    tx.executeSql("DROP TABLE IF EXISTS Category", [], null, (t, error) =>
      console.log(error)
    );

    tx.executeSql("DROP TABLE IF EXISTS Notes", [], null, (t, error) =>
      console.log(error)
    );

    tx.executeSql("DROP TABLE IF EXISTS Settings", [], null, (t, error) =>
      console.log(error)
    );

    tx.executeSql("DROP TABLE IF EXISTS Users", [], null, (t, error) =>
      console.log(error)
    );

    tx.executeSql(
      "DROP TABLE IF EXISTS BackupFrequency",
      [],
      null,
      (t, error) => console.log(error)
    );
  });
}
