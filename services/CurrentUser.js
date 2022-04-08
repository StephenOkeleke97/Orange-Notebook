import * as SQLite from "expo-sqlite";
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from "./UserService";
import { toggleTwoFactor } from "../components/settings";
import { setTwoFactor } from "../components/queries";

const db = SQLite.openDatabase("notes.db");

export function setUser(email, token, success) {
  addUserEmailToAsyncStorage(email);
  addTokenToAsyncStorage(token);
  syncTwoFactor(email);
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT OR IGNORE INTO Users(UserEmail, BackupFrequency, " +
        'NextBackUpDate) VALUES (?, "Daily", 0)',
      [email],
      (t, res) => {
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

async function addTokenToAsyncStorage(token) {
  try {
    await AsyncStorage.setItem("jwt", token);
  } catch (error) {
    console.log(error);
  }
}

function syncTwoFactor(email) {
  UserService.getTwoFactor(email, (enabled) => {
    setTwoFactor(enabled);
  })
}
