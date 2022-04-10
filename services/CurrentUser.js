import AsyncStorage from "@react-native-async-storage/async-storage";
import UserService from "./UserService";
import { setTwoFactor } from "../db/queries";
import { dB } from "../db/SchemaScript";

/**
 * Store user and authentication token to
 * Async storage.
 *
 * @param {string} email user email
 * @param {string} token jwt token
 * @param {function} success callbacl called after
 * successful storage
 */
export function setUser(email, success) {
  syncTwoFactor(email);
  dB().transaction((tx) => {
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
export async function addUserEmailToAsyncStorage(email) {
  await AsyncStorage.setItem("email", email);
}

/**
 * Add auth token to AsyncStorage.
 *
 * @param {string} token jwt token
 */
export async function addTokenToAsyncStorage(token) {
  await AsyncStorage.setItem("jwt", token);
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
