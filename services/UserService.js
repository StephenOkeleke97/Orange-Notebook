import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { FileSystemSessionType, FileSystemUploadType } from "expo-file-system";
import CurrentUser from "./CurrentUser";
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";
import { getLastBackUpDate, getLastBackUpSize, setLastBackupDate, setLastBackupSize } from "../components/settings";

const auth = {username: "user", password: "password"};
const getUsersAPI = 'http://10.0.0.47:8080/api/getUsers';
const postNewUserAPI = 'http://10.0.0.47:8080/api/addUser';
const verifyOTPAPI = 'http://10.0.0.47:8080/api/verifyOTP';
const requestNewCodeAPI = 'http://10.0.0.47:8080/api/resendVerification';
const getNotesAPI = 'http://10.0.0.47:8080/api/getNotes';
const addNoteAPI = 'http://10.0.0.47:8080/api/addNote';
const loginAPI = 'http://10.0.0.47:8080/api/login';
const backUpAPI = 'http://10.0.0.91:8080/api/backup';
const restoreBackupAPI = 'http://10.0.0.91:8080/api/files/';
const deleteBackupAPI = 'http://10.0.0.91:8080/api/deleteBackup/';

const db = SQLite.openDatabase('notes.db');

// axios.get('http://10.0.0.91:8080/api/files', {
//     auth: auth
// }).then(response => console.log(response.data))

class UserService {
    timeout = 10000;
    initialWait = 5000;
    successWait = 2000;
    
     async backUp(setProgressActiveCallBack, setProgressCallBack, 
        isAutomatic, isSuccesful) {
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
                        if (isAutomatic) isSuccesful(true);
                        this._successAlert("Back Up", isAutomatic);
                    }, this.successWait);
                } else {
                    this._errorAlert("Back Up", isAutomatic);
                    setProgressActiveCallBack(false);
                    // if (isAutomatic) isSuccesful(false);
                }
            }).catch(error => {
                console.log(error);
                this._errorAlert("Back Up", isAutomatic);
                setProgressActiveCallBack(false);
                // if (isAutomatic) isSuccesful(false);
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

    addUser(email, password, verify) {
        axios.post(postNewUserAPI, {}, {
            params: {
                email,
                password
            },
            auth: auth
        }).then(response => {
            verify.goodResponse(response.data);
        }).catch(error => {
            verify.badResponse();
        });
    }

    async verifyUser(email, verificationCode, verify) {
        await axios.get(verifyOTPAPI, {
            params: {
                email,
                verificationCode
            },
            auth: auth
        }).then(response => {
            verify.goodResponse(response.data);
        }).catch(error => {
            verify.badResponse();
        });
    }

     resendVerification(email) {
         axios.get(requestNewCodeAPI, {
             params: {
                 email
             },
             auth:auth
         }).then(response => {
             console.log(response.data);
         }).catch(error => {
             console.log(error);
         });
     }

     login(email, password, verify) {
         axios.get(loginAPI, {
             params: {
                 email,
                 password
             },
             auth: auth
         }).then(response => {
             verify.goodResponse(response.data);
         }).catch(error => {
             verify.badResponse();
         })
     }

     //Private functions 

     _errorAlert(action, isAutomatic) {
         if (!isAutomatic) Alert.alert(`${action} Failed`, "Something went wrong. Please try again later");
     }

     _successAlert(action, isAutomatic) {
         if (!isAutomatic) Alert.alert("", `${action} Succesful`);
     }

     _noBackupAlert() {
        Alert.alert("No Backup", "There is no backup associated with this account");
     }
}

export default new UserService();
