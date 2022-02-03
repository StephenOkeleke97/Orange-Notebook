import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { FileSystemSessionType, FileSystemUploadType } from "expo-file-system";
import CurrentUser from "./CurrentUser";
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";
import { setLastBackupDate, setLastBackupSize } from "../components/settings";

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

const db = SQLite.openDatabase('notes.db');

class UserService {

     async backUp(setProgressActiveCallBack, setProgressCallBack) {
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
                timeout: 10000,
                onUploadProgress: (progress) => {
                    size = progress.total;
                    let percentCompleted = Math.floor(progress.loaded / progress.total * 100);
                    setProgressCallBack(percentCompleted);
                }
            }).then(response => {
                if (response.status === 200) {
                    const d = new Date();
                    const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                    setLastBackupDate(date);
                    setLastBackupSize(size/100000);
                    setTimeout(() => {
                        setProgressActiveCallBack(false);
                        setProgressCallBack(0);
                        this._successAlert("Back Up");
                    }, 2000);
                } else {
                    this._errorAlert("Back Up");
                    setProgressActiveCallBack(false);
                }
            }).catch(error => {
                console.log(error);
                this._errorAlert("Back Up");
                setProgressActiveCallBack(false);
            });
         }, 3000)
         //MAKE BACKUP
        // const data = new FormData();
        // const path = FileSystem.documentDirectory + 'SQLite/notes.db';
        // data.append('file', {
        //     uri: path,
        //     type: 'db',
        //     name: `${CurrentUser.prototype.getUser()}backup`
        // });
        // axios.post(backUpAPI, data, {
        //     headers: {
        //         'Content-Type': 'multipart/form-data'
        //       },
        //       auth: auth,
        //       timeout: 10000,
        //       onUploadProgress: (progress) => {
        //           let percentCompleted = Math.floor(progress.loaded / progress.total * 100);
        //           console.log(percentCompleted);
        //       }
        // }).then(response => console.log(response.status)).catch(error => {
        //     console.log(error);
        //     Alert.alert("Network Error", "Please connect to the internet and try again")
        // });
        
        //DELETE BACKUP
        // axios.delete('http://10.0.0.91:8080/api/deleteBackup/' + `${CurrentUser.prototype.getUser()}backup`, {
        //     auth: auth,
        // }).then(response => console.log(response.data)).catch(error => console.log(error));

        // axios.get('http://10.0.0.91:8080/api/files', {
        //     auth: auth,
        // }).then(response => console.log(response.data)).catch(error => console.log(error));

        //GET BACKUP
        // axios.get('http://10.0.0.109:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`,
        //  {
        //     auth: auth,
        // }).then(response => {
        //     console.log(response);
        //     FileSystem.downloadAsync('http://10.0.0.109:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`,
        //     FileSystem.documentDirectory + 'SQLite/notes.db', {sessionType: FileSystemSessionType.BACKGROUND}).then((response) => {
        //     db._db.close();
        //     // console.log(response);
        // });
        // }).catch(error => {
        //     if (error.response === undefined) Alert.alert("Backup failed","Something went wrong. Try again later");
        //     else Alert.alert("No backup available", "There is no backup associated with this account");
        //     // console.log(error.response);
        // });

        // let a = await FileSystem.downloadAsync('http://10.0.0.91:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`
        // , FileSystem.documentDirectory + 'SQLite/notes.db', {sessionType: FileSystemSessionType.BACKGROUND}).then((response) => {
        //     db._db.close();
        //     console.log(response);
        // });

        // //GET BACKUP
        // axios.get('http://10.0.0.109:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`,
        //  {
        //     auth: auth,
        // }).then(response => {
        //     console.log(response);
        //     FileSystem.createDownloadResumable('http://10.0.0.109:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`,
        //     FileSystem.documentDirectory + 'SQLite/notes.db', {
        //         sessionType: FileSystemSessionType.BACKGROUND
        //     }, (progress) => {
        //         console.log(progress);
        //     }, null).downloadAsync().then((response) => {
        //     db._db.close();
        //     // console.log(response);
        // });
        // }).catch(error => {
        //     if (error.response === undefined) Alert.alert("Backup failed","Something went wrong. Try again later");
        //     else Alert.alert("No backup available", "There is no backup associated with this account");
        //     // console.log(error.response);
        // });
    }

    restoreBackup(setProgressActiveCallBack, setProgressCallBack) {
        setProgressActiveCallBack(true);
        setTimeout(() => {
            axios.get(restoreBackupAPI + `${CurrentUser.prototype.getUser()}backup`,
                {
                   auth: auth,
               }).then(response => {
                   FileSystem.createDownloadResumable(restoreBackupAPI + `${CurrentUser.prototype.getUser()}backup`,
                   FileSystem.documentDirectory + 'SQLite/notes.db', {
                       sessionType: FileSystemSessionType.BACKGROUND
                   }, (progress) => {
                       let percentCompleted = Math.floor(progress.totalBytesExpectedToWrite / progress.totalBytesWritten * 100);
                       setProgressCallBack(percentCompleted);
                   }, null).downloadAsync().then((response) => {
                       if (response.status === 200) {
                            setTimeout(() => {
                                setProgressActiveCallBack(false);
                                setProgressCallBack(0);
                                this._successAlert("Restore");
                            }, 2000);
                       } else {
                           this._errorAlert("Restore");
                           setProgressActiveCallBack(false);
                       }
                       db._db.close();
               });
               }).catch(error => {
                   console.log(error.response);
                   if (error.response.status === 404) Alert.alert("No Backup Available", "There is no backup associated with this account");
                   else this._errorAlert("Restore");
                   setProgressActiveCallBack(false);
               });
        }, 3000) 
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

     _errorAlert(action) {
         Alert.alert(`${action} failed`, "Something went wrong. Please try again later");
     }

     _successAlert(action) {
         Alert.alert("", `${action} Succesful`);
     }
}

export default new UserService();
