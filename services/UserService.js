import axios from "axios";
import * as FileSystem from "expo-file-system";
import { FileSystemSessionType } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import { setLastBackupDate, setLastBackupSize } from "../components/settings";

const auth = { username: "user", password: "password" };
const host = "http://192.168.1.124:8080/api/";
const verifyEmailAPI = host + "verifyEmail";
const postNewUserAPI = host + "addUser";
const verifyOTPAPI = host + "verifyOTP";
const requestNewCodeAPI = host + "resendVerification";
const loginAPI = host + "login";
const backUpAPI = host + "backup";
const restoreBackupAPI = host + "files/";
const deleteBackupAPI = host + "deleteBackup/";
const enableTwoFactorAPI = host + "enableTwoFactor";
const getTwoFactorAPI = host + "getTwoFactor";
const deleteUserAPI = host + "deleteAccount";
const resetPasswordAPI = host + "resetPassword";
const updateLastBackUpAPI = host + "updateLastBackUp";
const getLastBackUpAPI = host + "lastBackUp";

const db = SQLite.openDatabase("notes.db");

class UserService {
  timeout = 10000;
  initialWait = 5000;

  async backUp(
    email,
    setProgressActiveCallBack,
    setProgressCallBack,
    isAutomatic,
    automaticCallBack
  ) {
    let size = 0;
    setProgressActiveCallBack(true);
    setTimeout(() => {
      const data = new FormData();
      const path = FileSystem.documentDirectory + "SQLite/notes.db";
      data.append("file", {
        uri: path,
        type: "db",
        name: `${email}backup`,
      });

      axios
        .post(backUpAPI, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          auth: auth,
          timeout: this.timeout,
          onUploadProgress: (progress) => {
            size = progress.total;
            let percentCompleted = Math.floor(
              (progress.loaded / progress.total) * 100
            );
            setProgressCallBack(percentCompleted + "%");
          },
        })
        .then((response) => {
          if (response.status === 200) {
            console.log(response.status);
            const d = new Date();
            const date = `${d.getFullYear()}-${
              d.getMonth() + 1
            }-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
            setLastBackupDate(date);
            setLastBackupSize(size / 100000);
            setProgressActiveCallBack(false);
            setProgressCallBack(0);
            this._successAlert("Back Up", isAutomatic);
            if (isAutomatic) automaticCallBack();
            this.updateLastBackUpInfo(email, 5, date, size / 100000);
          } else {
            this._errorAlert("Back Up", isAutomatic);
            setProgressActiveCallBack(false);
          }
        })
        .catch((error) => {
          console.log(error);
          this._errorAlert("Back Up", isAutomatic);
          setProgressActiveCallBack(false);
        });
    }, this.initialWait);
  }

  restoreBackup(
    email,
    setProgressActiveCallBack,
    setProgressCallBack,
    updateLastDateAndSize,
    lastDate,
    lastSize
  ) {
    setProgressActiveCallBack(true);
    setTimeout(() => {
      this._checkIfBackupExists(email, setProgressActiveCallBack, () => {
        FileSystem.createDownloadResumable(
          restoreBackupAPI + `${email}backup`,
          FileSystem.documentDirectory + "SQLite/notes.db",
          {
            sessionType: FileSystemSessionType.BACKGROUND,
          },
          (progress) => {
            let percentCompleted = Math.floor(
              (progress.totalBytesExpectedToWrite /
                progress.totalBytesWritten) *
                100
            );
            setProgressCallBack(percentCompleted + "%");
          },
          null
        )
          .downloadAsync()
          .then(() => {
            db._db.close();
            updateLastDateAndSize(lastDate, lastSize);
            setProgressActiveCallBack(false);
            setProgressCallBack(0);
            this._successAlert("Restore");
          })
          .catch(() => {
            this._errorAlert("Restore");
            setProgressActiveCallBack(false);
          });
      });
    }, this.initialWait);
  }

  _checkIfBackupExists(email, setProgressActiveCallBack, callback) {
    const uri = host + "backupexists/";
    axios
      .get(uri + `${email}backup`, {
        auth: auth,
        timeout: this.timeout,
      })
      .then(() => {
        callback();
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          this._noBackupAlert();
          setProgressActiveCallBack(false);
        } else {
          this._errorAlert("Restore");
          setProgressActiveCallBack(false);
        }
      });
  }

  deleteBackup(email, setProgressActiveCallBack, setProgressCallBack) {
    setProgressActiveCallBack(true);
    setProgressCallBack("deleting...");
    setTimeout(() => {
      axios
        .delete(deleteBackupAPI + `${email}backup`, {
          auth: auth,
          timeout: this.timeout,
          params: {
            userEmail: email,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setLastBackupDate(null);
            setLastBackupSize(null);
            setProgressActiveCallBack(false);
            setProgressCallBack(0);
            this._successAlert("Delete");
          } else {
            this._errorAlert("Delete");
            setProgressActiveCallBack(false);
            setProgressCallBack(0);
          }
        })
        .catch((error) => {
          if (error.response === undefined) this._errorAlert("Delete");
          else if (error.response.status === 404) this._noBackupAlert();
          else this._errorAlert("Delete");
          setProgressActiveCallBack(false);
          setProgressCallBack(0);
        });
    }, this.initialWait);
  }

  addUser(userEmail, password, callback) {
    axios
      .get(verifyEmailAPI, {
        params: {
          userEmail: userEmail,
        },
        auth: auth,
        timeout: this.timeout,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data === true) {
          this._postUser(userEmail, password, callback);
        } else {
          this._userExistsWhenCreateError();
        }
      })
      .catch((error) => {
        console.log(error);
        this._errorAlert("Create Account");
      });
  }

  _postUser(email, password, callback) {
    axios
      .post(postNewUserAPI, null, {
        auth: auth,
        params: {
          email: email,
          password: password,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          callback();
        } else {
          this._errorAlert("Create Account");
        }
      })
      .catch((error) => {
        console.log(error);
        this._errorAlert("Create Account");
      });
  }

  async verifyUser(email, verificationCode, callback) {
    await axios
      .get(verifyOTPAPI, {
        params: {
          email,
          verificationCode,
        },
        auth: auth,
      })
      .then((response) => {
        if (response.data === true) callback();
        else this._invalidVerificationCodeAlert();
      })
      .catch((error) => {
        console.log(error);
        this._errorAlert("Verification");
      });
  }

  resendVerification(email, callback) {
    axios
      .get(requestNewCodeAPI, {
        params: {
          email,
        },
        auth: auth,
      })
      .then((response) => {
        if (response.status === 200) {
          callback();
        } else {
          alert("Something went wrong. Please try again later");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Something went wrong. Please try again later");
      });
  }

  login(email, password, callback) {
    axios
      .get(loginAPI, {
        params: {
          email,
          password,
        },
        auth: auth,
      })
      .then((response) => {
        if (response.status === 200) {
          if (response.data === true) callback();
          else this._invalidUserNameOrPasswordAlert();
        } else {
          this._errorAlert("Login");
        }
      })
      .catch((error) => {
        console.log(error);
        this._errorAlert("Login");
      });
  }

  enableTwoFactor(email, enable, failure) {
    axios
      .post(enableTwoFactorAPI, null, {
        auth: auth,
        params: {
          userEmail: email,
          enabled: enable,
        },
      })
      .catch((error) => {
        console.log(error);
        failure();
      });
  }

  getTwoFactor(email, callback) {
    axios
      .get(getTwoFactorAPI, {
        params: {
          userEmail: email,
        },
        auth: auth,
      })
      .then((response) => {
        console.log(response.data);
        if (response.status === 200) {
          callback(response.data);
        } else {
          this._errorAlert("Login");
        }
      })
      .catch((error) => {
        console.log(error);
        this._errorAlert("Login");
      });
  }

  delete(email, callback) {
    axios
      .delete(deleteUserAPI, {
        auth: auth,
        params: {
          userEmail: email,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          callback();
        } else {
          this._errorAlert("Delete");
        }
      })
      .catch((error) => {
        this._errorAlert("Delete");
      });
  }

  resetPassword(email, password, callback) {
    axios
      .put(resetPasswordAPI, null, {
        auth: auth,
        params: {
          email: email,
          password: password,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          callback();
        } else {
          this._errorAlert("Password Reset");
        }
      })
      .catch((error) => {
        console.log(error.response);
        this._errorAlert("Password Reset");
      });
  }

  updateLastBackUpInfo(email, retries, date, size) {
    axios
      .put(updateLastBackUpAPI, null, {
        params: {
          userEmail: email,
          date: date,
          size: size,
        },
        auth: auth,
      })
      .catch((error) => {
        if (retries > 0) {
          setTimeout(() => {
            this.updateLastBackUpInfo(email, retries - 1, date, size);
          }, 60000);
        }
      });
  }

  getLastBackUpInfo(email, getLastBackUpCallback) {
    axios
      .get(getLastBackUpAPI, {
        params: {
          userEmail: email,
        },
        auth: auth,
      })
      .then((response) => {
        if (response.status === 200) {
          getLastBackUpCallback(response.data);
        }
      })
      .catch((error) => {
        console.log("Get last back up error:", error);
      });
  }

  //Error alerts

  _errorAlert(action, isAutomatic) {
    if (!isAutomatic)
      Alert.alert(
        `${action} Failed`,
        "Something went wrong. Please try again later"
      );
  }

  _successAlert(action, isAutomatic) {
    if (!isAutomatic) Alert.alert("", `${action} Succesful`);
  }

  _noBackupAlert() {
    Alert.alert("No Backup", "There is no backup associated with this account");
  }

  _userExistsWhenCreateError() {
    Alert.alert(
      "Create Account Failed",
      "There is an account associated with this email"
    );
  }

  _invalidVerificationCodeAlert() {
    Alert.alert("Verification Failed", "The code you entered is incorrect");
  }

  _invalidUserNameOrPasswordAlert() {
    Alert.alert(
      "Login Failed",
      "Your email or password is incorrect. Please try again"
    );
  }
}

export default new UserService();
