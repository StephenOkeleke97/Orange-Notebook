import axios from "axios";
import * as FileSystem from "expo-file-system";
import { FileSystemSessionType } from "expo-file-system";
import { parseDate, setLastBackupDate, setLastBackupSize } from "../settings/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { close } from "../db/SchemaScript";

const host = "https://orangenotesbysteve.herokuapp.com/api/";
const registerAPI = host + "register";
const enableAPI = host + "enableaccount";
const requestTokenAPI = host + "requesttoken";
const loginAPI = "https://orangenotesbysteve.herokuapp.com/" + "login";
const backupAPI = host + "backup";
const restoreAPI = host + "restore";
const deleteBackupAPI = host + "deletebackup";
const enableMfaAPI = host + "enablemfa";
const getTwoFactorAPI = host + "mfaenabled";
const deleteUserAPI = host + "deleteaccount";
const resetPasswordAPI = host + "resetpassword";
const getLastBackUpInfoAPI = host + "getbackupinfo";

/**
 * Store jwt in auth header and insert bearer prefix.
 */
export function setAuthHeader () {
  getToken().then((token) => {
    console.log(token);
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
      axios.defaults.headers.common["Authorization"] = null;
    }
  });
}

/**
 * Get jwt token.
 *
 * @returns promise that returns token when fulfilled
 */
async function getToken() {
  let token;
  try {
    token = await AsyncStorage.getItem("jwt");
  } catch (error) {
    console.log(error);
  }
  return token;
}

/**
 * Class to handle API calls.
 */
class UserService {
  /**
   * Request timeout.
   */
  timeout = 10000;

  /**
   * Back up database to server.
   *
   * @param {string} email useremail. Used to construct file name
   * @param {function} successful called after successful backup
   * @param {function} failure called when backup fails
   * @param {function} updateProgress update backup progress
   * @param {boolean} isAutomatic true if backup is not initiated by user or
   * false otherwise. If true, no feedback is given.
   * @param {function} automaticCallBack callback called only when
   * back up is auto.
   */
  async backUp(
    email,
    successful,
    failure,
    updateProgress,
    isAutomatic = false,
    automaticCallBack
  ) {
    let size = 0;
    const data = new FormData();
    const path = FileSystem.documentDirectory + "SQLite/notes.db";
    data.append("file", {
      uri: path,
      type: "db",
      name: `${email}backup`,
    });

    axios
      .post(backupAPI, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: this.timeout,
        onUploadProgress: (progress) => {
          size = progress.total;
          let percentCompleted = Math.floor(
            (progress.loaded / progress.total) * 100
          );
          updateProgress(percentCompleted + "%");
        },
      })
      .then((response) => {
        const date = parseDate(new Date());
        setLastBackupDate(date);
        setLastBackupSize(size / 100000);
        if (isAutomatic) automaticCallBack();
        successful("Backup");
      })
      .catch((error) => {
        console.log(error);
        failure("Backup");
      });
  }

  /**
   * Restore backup from server. File is downloaded to
   * the a "backup" file in the SQLite directory.
   *
   * @param {function} successful called if restore is successful
   * @param {function} failure called is restore fails
   * @param {function} updateProgress updates restore progress
   * @param {function} updateLastDateAndSize update last backup date and
   * size if restore successful
   */
  restoreBackup(successful, failure, updateProgress) {
    getToken().then((token) => {
      FileSystem.createDownloadResumable(
        restoreAPI,
        FileSystem.documentDirectory + "SQLite/backup",
        {
          sessionType: FileSystemSessionType.BACKGROUND,
          headers: {
            Authorization: "Bearer " + token,
          },
        },
        (progress) => {
          let percentCompleted = Math.floor(
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
              100
          );
          updateProgress(percentCompleted + "%");
        },
        null
      )
        .downloadAsync()
        .then((response) => {
          FileSystem.getInfoAsync(
            FileSystem.documentDirectory + "SQLite/backup",
            { md5: true }
          ).then((res) => {
            if (response.status === 200) {
              this.handleFileCopy(
                response.headers,
                res.md5,
                successful,
                failure,
                20
              );
            } else if (response.status === 404) {
              failure(
                "Restore",
                "There is no Backup associated with this account"
              );
            } else {
              failure("Restore");
            }
          });
        })
        .catch(() => {
          failure("Restore");
        });
    });
  }

  /**
   * Compare server and client checksum. If they are
   * the same, Copy file from download location "...SQLite/backup" to
   * the actual db path ("...SQLite/notes.db").
   *
   * @param {string} serverChecksum md5 hash from server
   * @param {string} clientChecksum md5 hash of file in file system
   * @param {function} successful called if copy is successful
   * @param {function} failure called if copy fails
   * @param {int} retries number of times to retry copy if it fails
   */
  handleFileCopy(
    headers,
    clientChecksum,
    successful,
    failure,
    retries
  ) {
    const { Checksum, Info } = headers;
    const info = JSON.parse(Info);
    if (Checksum.toLowerCase() === clientChecksum.toLowerCase()) {
      FileSystem.copyAsync({
        from: FileSystem.documentDirectory + "SQLite/backup",
        to: FileSystem.documentDirectory + "SQLite/notes.db",
      })
        .then(() => {
          close();
          const date = parseDate(info.date);
          setLastBackupDate(date);
          setLastBackupSize(info.size / 100000);
          successful("Restore");
        })
        .catch((error) => {
          if (retries > 0)
            this.handleFileCopy(headers, clientChecksum, successful, failure, retries - 1);
        });
    } else {
      failure(
        "Restore",
        "File may have been corrupted during restore. Please try again."
      );
    }
  }

  /**
   * Delete backup from server.
   *
   * @param {function} success called if delete successful
   * @param {function} failure called if delete fails
   */
  deleteBackup(success, failure) {
    axios
      .delete(deleteBackupAPI, {
        timeout: this.timeout,
      })
      .then((response) => {
        setLastBackupDate(null);
        setLastBackupSize(null);
        success("Delete");
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          failure("Delete", "There is no backup associated with this account");
        } else {
          failure("Delete");
        }
      });
  }

  /**
   * Register new user.
   *
   * @param {string} email user email
   * @param {string} password user password
   * @param {function} success callback on success
   * @param {function} failure callback on failure
   */
  register(email, password, success, failure) {
    axios
      .post(registerAPI, null, {
        params: {
          email: email,
          password: password,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success();
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data);
          failure(error.response.data.message);
        } else {
          failure();
        }
      });
  }

  /**
   * Enable newly created account.
   *
   * @param {string} email user email
   * @param {string} code verification code
   * @param {function} success callback on success
   * @param {function} failure callback on success
   */
  enableAccount(email, code, success, failure) {
    axios
      .post(enableAPI, null, {
        params: {
          email: email,
          code: code,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success();
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          failure(error.response.data.message);
        } else {
          failure();
        }
      });
  }

  /**
   * Request verification code.
   *
   * @param {string} email user email
   * @param {function} success callback on success
   * @param {function} failure callback on failure
   */
  requestCode(email, success, failure) {
    axios
      .post(requestTokenAPI, null, {
        params: {
          email,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success();
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          failure("There is no account associated with that email.");
        } else {
          failure();
        }
      });
  }

  /**
   * Login user.
   *
   * @param {string} email user email
   * @param {string} password user password
   * @param {int} code verification code
   * @param {function} success callback on success
   * @param {function} failure callback on failure
   */
  login(email, password, code, success, failure) {
    axios
      .post(loginAPI, null, {
        params: {
          email: email,
          password: password,
          code: code,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success(response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.log("Error: " + error.response.data);
          failure(error.response.data.message);
        } else {
          failure();
        }
        console.log(error);
      });
  }

  /**
   * Enable or disable two factor
   * authentication.
   *
   * @param {email} email user email
   * @param {boolean} enable true to enable or false to disable
   * @param {function} failure
   */
  enableTwoFactor(email, enable, failure) {
    axios
      .post(enableMfaAPI, null, {
        params: {
          userEmail: email,
          enabled: enable,
        },
        timeout: this.timeout,
      })
      .catch((error) => {
        console.log(error);
        failure();
      });
  }

  /**
   * Get two factor setting of user account.
   *
   * @param {string} email user email
   * @param {function} success callback on success
   * @param {function} failure callback on failure
   */
  getTwoFactor(email, success, failure) {
    axios
      .post(getTwoFactorAPI, null, {
        params: {
          email: email,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          console.log(error.response);
          failure("Invalid Username or Password");
        } else {
          failure();
        }
        console.log(error);
      });
  }

  /**
   * Delete user account.
   *
   * @param {function} success callback on success
   * @param {function} failure callback on failure
   */
  delete(success, failure) {
    axios
      .delete(deleteUserAPI, {
        timeout: this.timeout,
      })
      .then((response) => {
        success();
      })
      .catch((error) => {
        failure();
      });
  }

  /**
   * Reset user password.
   *
   * @param {string} email user email
   * @param {string} password user new password
   * @param {int} code verification code
   * @param {function} success callback on success
   * @param {function} failure callback on failure
   */
  resetPassword(email, password, code, success, failure) {
    axios
      .put(resetPasswordAPI, null, {
        params: {
          email: email,
          password: password,
          code: code,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success();
      })
      .catch((error) => {
        if (error.response) {
          failure(error.response.data.message);
        } else {
          failure();
        }
      });
  }

  /**
   * Get last backup information from
   * server.
   *
   * @param {function} updateLocal update local database
   * with new info
   */
  getLastBackUpInfo(updateLocal) {
    axios
      .get(getLastBackUpInfoAPI, {
        timeout: this.timeout,
      })
      .then((response) => {
        updateLocal(response.data);
      })
      .catch((error) => {
        console.log("Get last back up error:", error);
      });
  }
}

export default new UserService();
