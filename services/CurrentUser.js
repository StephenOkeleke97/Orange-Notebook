import * as SQLite from "expo-sqlite";
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase("notes.db");

export function setUser(email, success) {
  addUserEmailToAsyncStorage(email);
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT OR IGNORE INTO Users(UserEmail, BackupFrequency, " +
        'NextBackUpDate) VALUES (?, "Daily", 0)',
      [email],
      (t, res) => {
        console.log("h");
        success();
      },
      (t, error) => {
        console.log(error);
      }
    );
  });
}

async function addUserEmailToAsyncStorage(email) {
  try {
    await AsyncStorage.setItem("email", email);
  } catch (error) {
    console.log(error);
  }
}
