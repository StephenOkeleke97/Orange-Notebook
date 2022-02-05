import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { FileSystemSessionType, FileSystemUploadType } from "expo-file-system";
import CurrentUser from "./CurrentUser";
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";
import { getLastBackUpDate, getLastBackUpSize, setLastBackupDate, setLastBackupSize } from "../components/settings";

const auth = {username: "user", password: "password"};
const host = 'http://10.0.0.91:8080/api/';
const verifyEmailAPI = host + 'verifyEmail';
const postNewUserAPI = host + 'addUser';
const verifyOTPAPI = host + 'verifyOTP';
const requestNewCodeAPI = host + 'resendVerification';
const loginAPI = host + 'login';
const backUpAPI = host + 'backup';
const restoreBackupAPI = host + 'files/';
const deleteBackupAPI = host + 'deleteBackup/';
const enableTwoFactorAPI = host + 'enableTwoFactor';
const getTwoFactorAPI = host + 'getTwoFactor';
const deleteUserAPI = host + 'deleteAccount';
const resetPasswordAPI = host + 'resetPassword';


const db = SQLite.openDatabase('notes.db');

// axios.get('http://10.0.0.91:8080/api/files', {
//     auth: auth
// }).then(response => console.log(response.data))

class UserService {
    timeout = 10000;
    initialWait = 5000;
    successWait = 2000;
    
     async backUp(setProgressActiveCallBack, setProgressCallBack, 
        isAutomatic) {
         let size = 0;
         setProgressActiveCallBack(true);
         setTimeout(() => {
            const data = new FormData();
            const path = FileSystem.documentDirectory + 'SQLite/notes.db';
            data.append('file', {
                uri: path,
                type: 'db',
                name: `${CurrentUser.prototype.getUser()}backup`
            });

            axios.post(backUpAPI, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                auth: auth,
                timeout: this.timeout,
                onUploadProgress: (progress) => {
                    size = progress.total;
                    let percentCompleted = Math.floor(progress.loaded / progress.total * 100);
                    setProgressCallBack(percentCompleted + '%');
                }
            }).then(response => {
                if (response.status === 200) {
                    console.log(response.status);
                    const d = new Date();
                    const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                    setLastBackupDate(date);
                    setLastBackupSize(size/100000);
                    setTimeout(() => {
                        setProgressActiveCallBack(false);
                        setProgressCallBack(0);
                        this._successAlert("Back Up", isAutomatic);
                    }, this.successWait);
                } else {
                    this._errorAlert("Back Up", isAutomatic);
                    setProgressActiveCallBack(false);
                }
            }).catch(error => {
                console.log(error);
                this._errorAlert("Back Up", isAutomatic);
                setProgressActiveCallBack(false);
            });
         }, this.initialWait)
    }

    restoreBackup(setProgressActiveCallBack, setProgressCallBack, 
        updateLastDateAndSize, lastDate, lastSize) {
        setProgressActiveCallBack(true);
        setTimeout(() => {
            axios.get(restoreBackupAPI + `${CurrentUser.prototype.getUser()}backup`,
                {
                   auth: auth,
                   timeout: this.timeout
               }).then(response => {
                   FileSystem.createDownloadResumable(restoreBackupAPI + `${CurrentUser.prototype.getUser()}backup`,
                   FileSystem.documentDirectory + 'SQLite/notes.db', {
                       sessionType: FileSystemSessionType.BACKGROUND
                   }, (progress) => {
                       let percentCompleted = Math.floor(progress.totalBytesExpectedToWrite / progress.totalBytesWritten * 100);
                       setProgressCallBack(percentCompleted + '%');
                   }, null).downloadAsync().then((response) => {
                       if (response.status === 200) {
                           db._db.close();
                           updateLastDateAndSize(lastDate, lastSize);
                            setTimeout(() => {
                                setProgressActiveCallBack(false);
                                setProgressCallBack(0);
                                this._successAlert("Restore");
                            }, this.successWait);
                       } else {
                           this._errorAlert("Restore");
                           setProgressActiveCallBack(false);
                       }
               });
               }).catch(error => {
                   console.log(error.response);
                   if (error.response === undefined) this._errorAlert("Restore");
                   else if (error.response.status === 404) this._noBackupAlert();
                   else this._errorAlert("Restore");
                   setProgressActiveCallBack(false);
               });
        }, this.initialWait) 
    }

    deleteBackup(setProgressActiveCallBack, setProgressCallBack) {
        setProgressActiveCallBack(true);
        setProgressCallBack('deleting...');
        setTimeout(() => {
            axios.delete(deleteBackupAPI + `${CurrentUser.prototype.getUser()}backup`, {
                auth: auth,
                timeout: this.timeout
            }).then(response => {
                if (response.status === 200) {
                    setTimeout(() => {
                        setLastBackupDate(null);
                        setLastBackupSize(null);
                        setProgressActiveCallBack(false);
                        setProgressCallBack(0)
                        this._successAlert("Delete");
                    }, this.successWait)
                } else {
                    this._errorAlert("Delete");
                    setProgressActiveCallBack(false);
                    setProgressCallBack(0)
                }
            }).catch(error => {
                if (error.response === undefined) this._errorAlert("Delete");
                else if (error.response.status === 404) this._noBackupAlert();
                else this._errorAlert("Delete");
                setProgressActiveCallBack(false);
                setProgressCallBack(0)
            });
        }, this.initialWait);
    }

    addUser(userEmail, password, callback) {
        axios.get(verifyEmailAPI, {
            params: {
                "userEmail": userEmail,
            },
            auth: auth,
            timeout: this.timeout
        }).then(response => {
            console.log(response.data);
            if (response.data === true) {
                this._postUser(userEmail, password, callback);
            } else {
                this._userExistsWhenCreateError();
            }
        }).catch(error => {
            console.log(error);
            this._errorAlert("Create Account");
        });
    }

    _postUser(email, password, callback) {
        axios.post(postNewUserAPI, null, {
            auth: auth,
            params: {
                "email": email,
                "password": password
            }
        }).then(response => {
            if (response.status === 200) {
                callback();
            } else {
                this._errorAlert("Create Account");
            }
        }).catch((error) => {
            console.log(error);
            this._errorAlert("Create Account");
        })
    }

    async verifyUser(email, verificationCode, callback) {
        await axios.get(verifyOTPAPI, {
            params: {
                email,
                verificationCode
            },
            auth: auth
        }).then(response => {
            if (response.data === true) callback();
            else this._invalidVerificationCodeAlert();
        }).catch(error => {
            console.log(error);
            this._errorAlert("Verification");
        });
    }

     resendVerification(email, callback) {
         axios.get(requestNewCodeAPI, {
             params: {
                 email
             },
             auth:auth
         }).then(response => {
             if (callback !== undefined) {
                 callback();
             }
         }).catch(error => {
             console.log(error);
         });
     }

     login(email, password, callback) {
         axios.get(loginAPI, {
             params: {
                 email,
                 password
             },
             auth: auth
         }).then(response => {
             if (response.status === 200) {
                if (response.data === true) callback();
                else this._invalidUserNameOrPasswordAlert();
             } else {
                this._errorAlert("Login");
            }             
         }).catch(error => {
             console.log(error);
             this._errorAlert("Login");
         })
     }

     enableTwoFactor(email, boolean, sync) {
         console.log("called");
        axios.post(enableTwoFactorAPI, null, {
            auth: auth,
            params: {
                "userEmail": email,
                enabled: boolean
            }
        }).then(response => {
            if (response.status === 200) {
                sync();
            }
        }).catch(error => {
            console.log(error);
        })
     }

     getTwoFactor(email, callback) {
         axios.get(getTwoFactorAPI, {
            params: {
                "userEmail": email,
            },
             auth: auth,
         }).then(response => {
             console.log(response.data);
             if (response.status === 200) {
                 callback(response.data);
             } else {
                 this._errorAlert("Login");
             }
         }).catch(error => {
             console.log(error);
             this._errorAlert("Login")
         })
     }

     delete(email, callback) {
         axios.delete(deleteUserAPI, {
             auth: auth,
             params: {
                 "userEmail": email,
             }
         }).then(response => {
             if (response.status === 200) {
                 callback();
             } else {
                 this._errorAlert("Delete");
             }
         }).catch(error => {
            this._errorAlert("Delete");
        })
     }

     resetPassword(email, password, callback) {
         axios.put(resetPasswordAPI, null, {
             auth: auth,
             params: {
                "email": email,
                "password": password
             }
         }).then(response => {
             if (response.status === 200) {
                 callback();
             } else {
                 this._errorAlert("Password Reset");
             }
         }).catch(error => {
             console.log(error.response);
             this._errorAlert("Password Reset");
         })
     }

     //Error alerts 

     _errorAlert(action, isAutomatic) {
         if (!isAutomatic) Alert.alert(`${action} Failed`, "Something went wrong. Please try again later");
     }

     _successAlert(action, isAutomatic) {
         if (!isAutomatic) Alert.alert("", `${action} Succesful`);
     }

     _noBackupAlert() {
        Alert.alert("No Backup", "There is no backup associated with this account");
     }

     _userExistsWhenCreateError() {
         Alert.alert("Create Account Failed", "There is an account associated with this email");
     }

     _invalidVerificationCodeAlert() {
         Alert.alert("Verification Failed", "The code you entered is incorrect");
     }

     _invalidUserNameOrPasswordAlert() {
         Alert.alert("Login Failed", "Your email or password is incorrect. Please try again")
     }
}

export default new UserService();
