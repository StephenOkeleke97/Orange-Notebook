import * as SQLite from 'expo-sqlite';
import CurrentUser from '../services/CurrentUser';

const db = SQLite.openDatabase('notes.db');

var detailedDisplay;
var backupEnabled;
var twoFactor;

// db.transaction(tx => {
//     tx.executeSql('SELECT SettingEnabled FROM UserSettings WHERE SettingName = "DetailedView" AND UserEmail = ?',
//     [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
//         console.log(_array);
//         if (_array[0].SettingEnabled === "1.0") {
//             detailedDisplay = true;
//         } else {
//             detailedDisplay = false;
//         }
//     }, (t, error) => console.log(error));

//     tx.executeSql('SELECT SettingEnabled FROM UserSettings WHERE SettingName = "BackupEnabled" AND UserEmail = ?',
//     [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
//         console.log(_array);
//         if (_array[0].SettingEnabled === "1.0") {
//             backupEnabled = true;
//         } else {
//             backupEnabled = false;
//         }    }, (t, error) => console.log(error))
// });

// db.transaction(tx => {
//     tx.executeSql('SELECT * FROM Notes',
//     null, (t, {rows: {_array}}) => {console.log("Array: ", _array)}, (t, error) => console.log(error));
// });

export function getDetailedDisplay(setDetailEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('SELECT SettingEnabled FROM UserSettings WHERE SettingName = "DetailedView" AND UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            if (_array[0].SettingEnabled === "1.0") {
                detailedDisplay = true;
                setDetailEnabledCallBack(true);
            } else {
                detailedDisplay = false;
                setDetailEnabledCallBack(false);
            }
        }, (t, error) => console.log(error));
    });
}

export function toggleDetailedDisplay(setDetailEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('UPDATE UserSettings SET SettingEnabled = ? WHERE SettingName = "DetailedView" AND UserEmail = ?',
        [(!detailedDisplay), CurrentUser.prototype.getUser()], (() => {
            setDetailEnabledCallBack(!detailedDisplay);
        }), (t, error) => console.log(error));
    });
}

export function getBackupEnabled(setBackupEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('SELECT SettingEnabled FROM UserSettings WHERE SettingName = "BackupEnabled" AND UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            // if (_array[0].SettingEnabled === "1.0") {
            //     backupEnabled = true;
            //     setBackupEnabledCallBack(true);
            // } else {
            //     backupEnabled = false;
            //     setBackupEnabledCallBack(false);
            // }
            backupEnabled = _array[0].SettingEnabled === "1.0";
            setBackupEnabledCallBack(_array[0].SettingEnabled === "1.0");
        }, (t, error) => console.log(error));
    });
}

export function toggleBackupEnabled(setBackupEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('UPDATE UserSettings SET SettingEnabled = ? WHERE SettingName = "BackupEnabled" AND UserEmail = ?',
        [(!backupEnabled), CurrentUser.prototype.getUser()], (() => {
            setBackupEnabledCallBack(!backupEnabled);
        }), (t, error) => console.log(error));
    });
}

export function getTwoFactor(setTwoFactorCallBack) {
    db.transaction(tx => {
        tx.executeSql('SELECT SettingEnabled FROM UserSettings WHERE SettingName = "TwoFactor" AND UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            if (_array[0].SettingEnabled === "1.0") {
                twoFactor = true;
                setTwoFactorCallBack(true);
            } else {
                twoFactor = false;
                setTwoFactorCallBack(false);
            }  
          }, (t, error) => console.log(error));
    });
}

export function toggleTwoFactor(setTwoFactorCallBack, syncWithServerCallBack) {
    unSyncWhenUpdateLocally();
    db.transaction(tx => {
        tx.executeSql('UPDATE UserSettings SET SettingEnabled = ? WHERE SettingName = "TwoFactor" AND UserEmail = ?',
        [(!twoFactor), CurrentUser.prototype.getUser()], (() => {
            setTwoFactorCallBack(!twoFactor)
            syncWithServerCallBack(!twoFactor)
        }), (t, error) => console.log(error));
    });
}

function unSyncWhenUpdateLocally() {
    db.transaction((tx) => {
        tx.executeSql('UPDATE UserSettings SET SettingSynced = "0.0" WHERE UserEmail = ?',
        [CurrentUser.prototype.getUser()], null, (t, error) => console.log(error));
    });
}

export function syncWithLocalDB() {
    db.transaction((tx) => {
        tx.executeSql('UPDATE UserSettings SET SettingSynced = "1.0" WHERE UserEmail = ?',
        [CurrentUser.prototype.getUser()], null, (t, error) => console.log(error));
    });
}

export function getSyncStatus(callback) {
    db.transaction((tx) => {
        tx.executeSql('SELECT SettingSynced FROM UserSettings WHERE UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            callback(_array[0].SettingSynced)
        }, (t, error) => console.log(error));
    });
}

export function initializeSettings() {
    db.transaction((tx) => {
        tx.executeSql('INSERT OR IGNORE INTO UserSettings(UserEmail, SettingName, SettingEnabled, SettingSynced) ' + 
        ' VALUES (?, "DetailedView", "1.0", "0.0")', [CurrentUser.prototype.getUser()], 
        null, (t, error) => console.log(error));

        tx.executeSql('INSERT OR IGNORE INTO UserSettings(UserEmail, SettingName, SettingEnabled, SettingSynced) ' + 
        ' VALUES (?, "BackupEnabled", "1.0", "0.0")', [CurrentUser.prototype.getUser()], 
        null, (t, error) => console.log(error));

        tx.executeSql('INSERT OR IGNORE INTO UserSettings(UserEmail, SettingName, SettingEnabled, SettingSynced) ' + 
        ' VALUES (?, "TwoFactor", "0.0", "0.0")', [CurrentUser.prototype.getUser()], 
        null, (t, error) => console.log(error));
    });
}

export function setBackupFrequency(frequency, callback) {
    db.transaction((tx) => {
        tx.executeSql('UPDATE Users SET BackupFrequency = ? WHERE UserEmail = ?', 
        [frequency, CurrentUser.prototype.getUser()], () => callback(), (t, error) => console.log(error))
    });
}

export function getBackupFrequency(callback) {
    db.transaction((tx) => {
        tx.executeSql('SELECT BackupFrequency FROM Users WHERE UserEmail = ?', 
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => callback(_array[0].BackupFrequency), (t, error) => console.log(error))
    });
}

export function setLastBackupDate(date) {
    db.transaction((tx) => {
        tx.executeSql('UPDATE Users SET BackupDate = ? WHERE UserEmail = ?',
        [date, CurrentUser.prototype.getUser()], null, error => console.log(error))
    })
}

export function getLastBackUpDate(callback) {
    db.transaction((tx) => [
        tx.executeSql('SELECT BackupDate FROM Users WHERE UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            callback(_array[0].BackupDate);
        })
    ])
}

export function setLastBackupSize(size) {
    db.transaction((tx) => {
        tx.executeSql('UPDATE Users SET BackupSize = ? WHERE UserEmail = ?',
        [size, CurrentUser.prototype.getUser()], null, error => console.log(error))
    })
}

export function getLastBackUpSize(callback) {
    db.transaction((tx) => [
        tx.executeSql('SELECT BackupSize FROM Users WHERE UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            callback(_array[0].BackupSize);
        })
    ])
}

export function deleteUser(callback) {
    db.transaction(tx => {
        tx.executeSql('DELETE FROM Users WHERE UserEmail = ?', 
        [CurrentUser.prototype.getUser()], () => {
            callback();
        }, (t, error) => {console.log(error)});
    })
}

export function logOut(callback) {
    db.transaction(tx => {
        tx.executeSql('UPDATE Users SET LoggedIn = 0 WHERE UserEmail = ?',
        [CurrentUser.prototype.getUser()], () => {
            callback();
        }, (t, error) => console.log(error))
    })
}

export function checkIfLoggedIn(callback) {
    db.transaction(tx => {
        tx.executeSql('SELECT UserEmail FROM Users WHERE LoggedIn = 1', null,
        (t, {rows: {_array}}) => {
            if (_array.length > 0) {
                callback(true, _array[0].UserEmail);
            } 
        })
    })
}

export function saveLogIn(email) {
    db.transaction((tx) => {
        tx.executeSql('UPDATE Users SET LoggedIn = 1 WHERE UserEmail = ?', 
        [email], null, (t, error) => console.log(error))
    })
}

export function getNextBackUpDate(callback) {
    db.transaction(tx => {
        tx.executeSql('SELECT NextBackUpDate FROM Users WHERE UserEmail = ?', 
        [CurrentUser.prototype.getUser()], (t, {rows:{_array}}) => {
            callback(_array[0].NextBackUpDate);
        }, (t, error) => console.log(error));
    })
}

export function updateNextBackUpDate(dateInEpoch) {
    db.transaction(tx => {
        tx.executeSql('UPDATE Users SET NextBackUpDate = ? WHERE UserEmail = ?', 
        [dateInEpoch, CurrentUser.prototype.getUser()], null, (t, error) => console.log(error));
    })
}

