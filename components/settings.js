import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { initializeDB } from "../db/SchemaScript";

const db = SQLite.openDatabase("notes.db");

var detailedDisplay;
var backupEnabled;
var twoFactor;

export function getDetailedDisplay(setDetailEnabledCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT SettingEnabled FROM Settings WHERE SettingName = "DetailedView"',
      null,
      (t, { rows: { _array } }) => {
        detailedDisplay = _array[0].SettingEnabled === 1;
        setDetailEnabledCallBack(detailedDisplay);
      },
      (t, error) => console.log(error)
    );
  });
}

export function toggleDetailedDisplay(setDetailEnabledCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE Settings SET SettingEnabled = ? WHERE SettingName = "DetailedView"',
      [!detailedDisplay],
      () => {
        setDetailEnabledCallBack(!detailedDisplay);
      },
      (t, error) => console.log(error)
    );
  });
}

export function getBackupEnabled(setBackupEnabledCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT SettingEnabled FROM Settings WHERE SettingName = "BackupEnabled"',
      null,
      (t, { rows: { _array } }) => {
        backupEnabled = _array[0].SettingEnabled === 1;
        setBackupEnabledCallBack(backupEnabled);
      },
      (t, error) => console.log(error)
    );
  });
}

export function toggleBackupEnabled(setBackupEnabledCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE Settings SET SettingEnabled = ? WHERE SettingName = "BackupEnabled"',
      [!backupEnabled],
      () => {
        setBackupEnabledCallBack(!backupEnabled);
      },
      (t, error) => console.log(error)
    );
  });
}

export function getTwoFactor(setTwoFactorCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT SettingEnabled FROM Settings WHERE SettingName = "TwoFactor"',
      null,
      (t, { rows: { _array } }) => {
        twoFactor = _array[0].SettingEnabled === 1;
        setTwoFactorCallBack(twoFactor);
      },
      (t, error) => console.log(error)
    );
  });
}

export function toggleTwoFactor(setTwoFactorCallBack, syncWithServerCallBack) {
  unSyncWhenUpdateLocally(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Settings SET SettingEnabled = ? WHERE SettingName = "TwoFactor"',
        [!twoFactor],
        () => {
          setTwoFactorCallBack(!twoFactor);
          syncWithServerCallBack(!twoFactor);
        },
        (t, error) => console.log(error)
      );
    });
  });
}

function unSyncWhenUpdateLocally(toggleTwoFactorCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE Settings SET SettingSynced = "0.0" ' +
        'AND SettingName = "TwoFactor"',
      null,
      (t, success) => toggleTwoFactorCallBack(),
      (t, error) => console.log(error)
    );
  });
}

export function syncWithLocalDB() {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE Settings SET SettingSynced = "1.0"',
      null,
      null,
      (t, error) => console.log(error)
    );
  });
}

export function getSyncStatus(success) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT SettingSynced FROM Settings WHERE SettingName = 'TwoFactor'",
      null,
      (t, { rows: { _array } }) => {
        success(_array[0].SettingSynced);
      },
      (t, error) => console.log(error)
    );
  });
}

export function setBackupFrequency(frequency, callback) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Users SET BackupFrequency = ? WHERE UserEmail = ?",
        [frequency, user],
        () => callback(),
        (t, error) => console.log(error)
      );
    });
  });
}

export function getBackupFrequency(callback) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT BackupFrequency FROM Users WHERE UserEmail = ?",
        [user],
        (t, { rows: { _array } }) => callback(_array[0].BackupFrequency),
        (t, error) => console.log(error)
      );
    });
  });
}

export function setLastBackupDate(date) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Users SET BackupDate = ? WHERE UserEmail = ?",
        [date, user],
        null,
        (error) => console.log(error)
      );
    });
  });
}

export function getLastBackUpDate(callback) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT BackupDate FROM Users WHERE UserEmail = ?",
        [user],
        (t, { rows: { _array } }) => {
          callback(_array[0].BackupDate);
        }
      );
    });
  });
}

export function setLastBackupSize(size) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Users SET BackupSize = ? WHERE UserEmail = ?",
        [size, user],
        null,
        (error) => console.log(error)
      );
    });
  });
}

export function getLastBackUpSize(callback) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT BackupSize FROM Users WHERE UserEmail = ?",
        [user],
        (t, { rows: { _array } }) => {
          callback(_array[0].BackupSize);
        }
      );
    });
  });
}

export function deleteUser(success) {
  FileSystem.deleteAsync(FileSystem.documentDirectory + "SQLite/notes.db")
    .then(() => {
      initializeDB();
      success();
    })
    .catch((error) => {
      console.log(error);
    });
}

export function checkIfLoggedIn(callback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT UserEmail from Users Limit 1",
      null,
      (t, { rows: { _array } }) => {
        callback(_array.length > 0);
      },
      (t, error) => console.log("Error during check logged in", error)
    );
  });
}

export function getNextBackUpDate(callback) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT NextBackUpDate FROM Users WHERE UserEmail = ?",
        [user],
        (t, { rows: { _array } }) => {
          callback(_array[0].NextBackUpDate);
        },
        (t, error) => console.log(error)
      );
    });
  });
}

export function updateNextBackUpDate(dateInEpoch) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Users SET NextBackUpDate = ? WHERE UserEmail = ?",
        [dateInEpoch, user],
        null,
        (t, error) => console.log(error)
      );
    });
  });
}

async function getUser() {
  let user;
  try {
    user = await AsyncStorage.getItem("email");
  } catch (err) {
    console.log(err);
  }
  return user;
}
