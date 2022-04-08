import axios from "axios";
import * as FileSystem from "expo-file-system";
import { FileSystemSessionType } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import { setLastBackupDate, setLastBackupSize } from "../components/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";

const rawHost = "http://192.168.1.100:8080/";
const host = "http://192.168.1.100:8080/api/";
const registerAPI = host + "register";
const enableAPI = host + "enableaccount";
const requestTokenAPI = host + "requesttoken";
const loginAPI = rawHost + "login";
const backupAPI = host + "backup";
const restoreAPI = host + "restore";
const deleteBackupAPI = host + "deletebackup";
const enableMfaAPI = host + "enablemfa";
const getTwoFactorAPI = host + "mfaenabled";
const deleteUserAPI = host + "deleteaccount";
const resetPasswordAPI = host + "resetpassword";
const getLastBackUpInfoAPI = host + "getbackupinfo";

const db = SQLite.openDatabase("notes.db");

(function () {
  getToken().then((token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
      axios.defaults.headers.common["Authorization"] = null;
      /*if setting null does not remove `Authorization` header then try     
        delete axios.defaults.headers.common['Authorization'];
      */
    }
  });
})();

async function getToken() {
  let token;
  try {
    token = await AsyncStorage.getItem("jwt");
  } catch (error) {
    console.log(error);
  }
  return token;
}

class UserService {
  timeout = 10000;
  initialWait = 5000;

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
        const d = new Date();
        const date = `${d.getFullYear()}-${
          d.getMonth() + 1
        }-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        setLastBackupDate(date);
        setLastBackupSize(size / 100000);
        // setProgressCallBack(0);
        if (isAutomatic) automaticCallBack();
        successful("Backup");
      })
      .catch((error) => {
        console.log(error);
        failure("Backup");
      });
  }

  // restoreBackup(successful, failure, updateProgress, updateLastDateAndSize) {
  //   this._checkIfBackupExists(failure, (auth) => {
  //     FileSystem.createDownloadResumable(
  //       restoreAPI + "t",
  //       // FileSystem.documentDirectory + "SQLite/notes.db",
  //       FileSystem.documentDirectory + "SQLite/backup",

  //       {
  //         sessionType: FileSystemSessionType.BACKGROUND,
  //         headers: {
  //           Authorization: auth,
  //         },
  //       },
  //       (progress) => {
  //         let percentCompleted = Math.floor(
  //           (progress.totalBytesExpectedToWrite / progress.totalBytesWritten) *
  //             100
  //         );
  //         updateProgress(percentCompleted + "%");
  //       },
  //       null
  //     )
  //       .downloadAsync()
  //       .then(() => {
  //         FileSystem.getInfoAsync(FileSystem.documentDirectory+"SQLite/backup", {md5:true})
  //         .then(res => {
  //           console.log(res);
  //         })
  //         db._db.close();
  //         updateLastDateAndSize();
  //         successful("Restore");
  //       })
  //       .catch(() => {
  //         failure("Restore");
  //       });
  //   });
  // }

  // _checkIfBackupExists(failure, callback) {
  //   const uri = host + "backupexists";
  //   axios
  //     .get(uri, {
  //       timeout: this.timeout,
  //     })
  //     .then((response) => {
  //       console.log("Result: ", response.data.md5.toString("hex"));
  //       callback(response.config.headers.Authorization);
  //     })
  //     .catch((error) => {
  //       if (error.response && error.response.status === 404) {
  //         failure("Restore", "There is no backup associated with this account");
  //       } else {
  //         failure("Restore");
  //       }
  //     });
  // }

  restoreBackup(successful, failure, updateProgress, updateLastDateAndSize) {
    getToken().then((token) => {
      FileSystem.createDownloadResumable(
        restoreAPI,
        // FileSystem.documentDirectory + "SQLite/notes.db",
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
                response.headers.Checksum,
                res.md5,
                successful,
                failure,
                updateLastDateAndSize
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

  handleFileCopy(
    serverChecksum,
    clientChecksum,
    successful,
    failure,
    updateLastDateAndSize
  ) {
    console.log("SERVER:", serverChecksum.toLowerCase());
    console.log("CLIENT:", clientChecksum.toLowerCase());
    if (serverChecksum.toLowerCase() === clientChecksum.toLowerCase()) {
      FileSystem.moveAsync({
        from: FileSystem.documentDirectory + "SQLite/backup",
        to: FileSystem.documentDirectory + "SQLite/notes.db",
      })
        .then(() => {
          console.log("Success");
          updateLastDateAndSize();
          successful("Restore");
          db._db.close();
        })
        .catch((error) => {
          console.log(error);
          failure("Restore");
        });
    } else {
      failure("Restore");
    }
  }

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
        console.log(response.data);
        success(response.data);
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

  getTwoFactor(email, password, success, failure) {
    axios
      .post(getTwoFactorAPI, null, {
        params: {
          email: email,
          password: password,
        },
        timeout: this.timeout,
      })
      .then((response) => {
        success(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          console.log(error.response);
          failure("Invalid Credentials");
        } else {
          failure();
        }
      });
  }

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
