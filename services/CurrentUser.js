import { useState } from "react";
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('notes.db');

export default class CurrentUser {
    currentUser = "";
    
    setUser(email) {
        this.currentUser = email;
    
        db.transaction((tx) => {
            tx.executeSql('INSERT OR IGNORE INTO Users(UserEmail, BackupFrequency, LoggedIn) VALUES (?, "Daily", 1)', [email], 
            null,
            (t, error) => {console.log(error)});

            tx.executeSql('INSERT OR IGNORE INTO Category VALUES ("None", ?, 209, 211, 212)'
            , [email], null, (t,error) => console.log(error));
        })
    }

    getUser() {
        return this.currentUser;
    }
}
