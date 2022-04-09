import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserService from "./UserService";
import { setTwoFactor } from "../db/queries";

const db = SQLite.openDatabase("notes.db");

/**
 * Store user and authentication token to
 * Async storage.
 * 
 * @param {string} email user email
 * @param {string} token jwt token
 * @param {function} success callbacl called after
 * successful storage
 */
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

/**
 * Add user email to AsyncStorage.
 * 
 * @param {string} email user email
 */
async function addUserEmailToAsyncStorage(email) {
  try {
    await AsyncStorage.setItem("email", email);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Add auth token to AsyncStorage.
 * 
 * @param {string} token jwt token
 */
async function addTokenToAsyncStorage(token) {
  try {
    await AsyncStorage.setItem("jwt", token);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Sync 2fa setting from server with local db.
 * 
 * @param {string} email user email
 */
function syncTwoFactor(email) {
  UserService.getTwoFactor(email, (enabled) => {
    setTwoFactor(enabled);
  });
}
