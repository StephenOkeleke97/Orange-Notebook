import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { initializeDB } from "../db/SchemaScript";

const db = SQLite.openDatabase("notes.db");

var detailedDisplay;
var backupEnabled;
var twoFactor;

/**
 * Get detailed display setting from database.
 *
 * @param {function} setDetailEnabledCallBack callback to be called
 * after detail retrieved
 */
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

/**
 * Toggle detailed display setting.
 *
 * @param {function} setDetailEnabledCallBack callback called
 * after setting toggled in database
 */
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

/**
 * Get auto backup setting from database.
 *
 * @param {function} setBackupEnabledCallBack callback to be called
 * after setting retrieved
 */
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

/**
 * Toggle auto backup setting in database.
 *
 * @param {function} setBackupEnabledCallBack callback to be called
 * after setting toggled
 */
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

/**
 * Get two factor authentication setting
 * from database.
 *
 * @param {function} setTwoFactorCallBack callback called
 * after setting retrieved
 */
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

/**
 * Toggle two factor authentication setting in
 * database.
 *
 * @param {function} setTwoFactorCallBack callback called after
 * setting is toggled
 * @param {function} syncWithServerCallBack callback to post updated setting
 * to server
 */
export function toggleTwoFactor(setTwoFactorCallBack, syncWithServerCallBack) {
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
}

/**
 * Set frequency of automatic backups.
 * Three options available: Daily, Weekly, Monthly.
 * 
 * @param {string} frequency auto backup frequency
 * @param {function} callback callback called after setting
 * set successfully
 */
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

/**
 * Get frequency of automatic backups.
 * 
 * @param {function} callback callback called after 
 * setting retrieved successfully
 */
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

/**
 * Set date of last back up.
 * 
 * @param {string} date formatted date
 */
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

/**
 * Get date of last backup.
 * 
 * @param {function} callback callback called
 * after date is retrieved successfully
 */
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

/**
 * Set the size of last back up in bytes.
 * 
 * @param {int} size size of last back up
 */
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

/**
 * Get the size of last back up.
 * 
 * @param {function} callback callback called
 * after size is retrieved
 */
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

/**
 * Delete local database and recreate schema.
 * 
 * @param {function} success callback called after
 * database successfully deleted
 */
export function deleteUser(success) {
  FileSystem.deleteAsync(FileSystem.documentDirectory + "SQLite/notes.db")
    .then(() => {
      initializeDB();
      AsyncStorage.clear()
        .then(() => {
          success();
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Check size of user table to find out if
 * user exists. Return size > 0 to callback.
 * 
 * @param {function} callback callback to receive 
 * result
 */
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

/**
 * Get date of next scheduled back up.
 * 
 * @param {function} callback callback to receive date
 */
export function getNextBackUpDate(callback) {
  getUser().then((user) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT NextBackUpDate FROM Users WHERE UserEmail = ?",
        [user],
        (t, { rows: { _array } }) => {
          if (_array[0]) {
            callback(_array[0].NextBackUpDate);
          }
        },
        (t, error) => console.log(error)
      );
    });
  });
}

/**
 * Set the date of next back up in epoch time.
 * 
 * @param {long} dateInEpoch date in epoch time
 */
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

/**
 * Retrieve email of logged in user from AsyncStorage.
 *  
 * @returns promise which returns a user when fulfilled
 */
async function getUser() {
  let user;
  try {
    user = await AsyncStorage.getItem("email");
  } catch (err) {
    console.log(err);
  }
  return user;
}
