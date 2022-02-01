import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { FileSystemSessionType, FileSystemUploadType } from "expo-file-system";
import CurrentUser from "./CurrentUser";
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";

const auth = {username: "user", password: "password"};
const getUsersAPI = 'http://10.0.0.47:8080/api/getUsers';
const postNewUserAPI = 'http://10.0.0.47:8080/api/addUser';
const verifyOTPAPI = 'http://10.0.0.47:8080/api/verifyOTP';
const requestNewCodeAPI = 'http://10.0.0.47:8080/api/resendVerification';
const getNotesAPI = 'http://10.0.0.47:8080/api/getNotes';
const addNoteAPI = 'http://10.0.0.47:8080/api/addNote';
const loginAPI = 'http://10.0.0.47:8080/api/login';
const backUpAPI = 'http://10.0.0.91:8080/api/backup';

const db = SQLite.openDatabase('notes.db');
class UserService {
     async backUp() {
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
        // }).then(response => console.log(response.status)).catch(error => console.log(error));
        
        // axios.delete('http://10.0.0.91:8080/api/deleteBackup/' + `${CurrentUser.prototype.getUser()}backup`, {
        //     auth: auth,
        // }).then(response => console.log(response.data)).catch(error => console.log(error));

        // axios.get('http://10.0.0.91:8080/api/files', {
        //     auth: auth,
        // }).then(response => console.log(response.data)).catch(error => console.log(error));

        axios.get('http://10.0.0.91:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`, {
            auth: auth,
        }).then(response => {
            FileSystem.downloadAsync('http://10.0.0.91:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`,
            FileSystem.documentDirectory + 'SQLite/notes.db', {sessionType: FileSystemSessionType.BACKGROUND}).then((response) => {
            db._db.close();
            console.log(response);
        });
        }).catch(error => {
            if (error.response === undefined) Alert.alert("Backup failed","Something went wrong. Try again later");
            else Alert.alert("No backup available", "There is no backup associated with this account");
            console.log(error.response);
        });

        // let a = await FileSystem.downloadAsync('http://10.0.0.91:8080/api/files/' + `${CurrentUser.prototype.getUser()}backup`
        // , FileSystem.documentDirectory + 'SQLite/notes.db', {sessionType: FileSystemSessionType.BACKGROUND}).then((response) => {
        //     db._db.close();
        //     console.log(response);
        // });
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
}

export default new UserService();
