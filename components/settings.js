import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('notes.db');

var detailedDisplay;
var backupEnabled;

db.transaction(tx => {
    tx.executeSql('SELECT SettingEnabled FROM Settings WHERE SettingName = "DetailedView"',
    null, (t, {rows: {_array}}) => {
        if (_array[0].SettingEnabled === "1.0") {
            detailedDisplay = true;
        } else {
            detailedDisplay = false;
        }
    }, (t, error) => console.log(error));

    tx.executeSql('SELECT SettingEnabled FROM Settings WHERE SettingName = "BackupEnabled"',
    null, (t, {rows: {_array}}) => {
        if (_array[0].SettingEnabled === "1.0") {
            backupEnabled = true;
        } else {
            backupEnabled = false;
        }    }, (t, error) => console.log(error))
});

// db.transaction(tx => {
//     tx.executeSql('SELECT * FROM Settings',
//     null, (t, {rows: {_array}}) => {console.log(_array)}, (t, error) => console.log(error));
// });

export function getDetailedDisplay(setDetailEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('SELECT SettingEnabled FROM Settings WHERE SettingName = "DetailedView"',
        null, (t, {rows: {_array}}) => {
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
        tx.executeSql('UPDATE Settings SET SettingEnabled = ? WHERE SettingName = "DetailedView"',
        [(!detailedDisplay)], (() => {
            setDetailEnabledCallBack(!detailedDisplay);
        }), (t, error) => console.log(error));
    });
}

export function getBackUpEnabled(setBackUpEnabledCallBack) {
    db.transaction(tx => {
        tx.executeSql('SELECT SettingEnabled FROM Settings WHERE SettingName = "BackupEnabled"',
        null, (t, {rows: {_array}}) => {
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
        tx.executeSql('UPDATE Settings SET SettingEnabled = ? WHERE SettingName = "BackupEnabled"',
        [(!backupEnabled)], (() => {
            setBackUpEnabledCallBack(!backupEnabled)
        }), (t, error) => console.log(error));
    });
}


