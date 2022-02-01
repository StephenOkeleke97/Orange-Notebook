import * as SQLite from 'expo-sqlite';
import CurrentUser from '../services/CurrentUser';

const db = SQLite.openDatabase('notes.db');

var detailedDisplay;
var backupEnabled;

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
//     tx.executeSql('SELECT * FROM UserSettings',
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

export function getBackUpEnabled(setBackUpEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('SELECT SettingEnabled FROM UserSettings WHERE SettingName = "BackupEnabled" AND UserEmail = ?',
        [CurrentUser.prototype.getUser()], (t, {rows: {_array}}) => {
            if (_array[0].SettingEnabled === "1.0") {
                backupEnabled = true;
                setBackUpEnabledCallBack(true);
            } else {
                backupEnabled = false;
                setBackUpEnabledCallBack(false);
            }  
          }, (t, error) => console.log(error));
    });
}

export function toggleBackUpEnabled(setBackUpEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('UPDATE UserSettings SET SettingEnabled = ? WHERE SettingName = "BackupEnabled" AND UserEmail = ?',
        [(!backupEnabled), CurrentUser.prototype.getUser()], (() => {
            setBackUpEnabledCallBack(!backupEnabled)
        }), (t, error) => console.log(error));
    });
}

export function initializeSettings() {
    db.transaction((tx) => {
        tx.executeSql('INSERT OR IGNORE INTO UserSettings(UserEmail, SettingName, SettingEnabled) ' + 
        ' VALUES (?, "DetailedView", "1.0")', [CurrentUser.prototype.getUser()], 
        null, (t, error) => console.log(error));

        tx.executeSql('INSERT OR IGNORE INTO UserSettings(UserEmail, SettingName, SettingEnabled) ' + 
        ' VALUES (?, "BackupEnabled", "1.0")', [CurrentUser.prototype.getUser()], 
        null, (t, error) => console.log(error));
    });
}


