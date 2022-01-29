import axios from "axios";

const auth = {username: "user", password: "password"};
const getUsersAPI = 'http://10.0.0.47:8080/api/getUsers';
const postNewUserAPI = 'http://10.0.0.47:8080/api/addUser';
const verifyOTPAPI = 'http://10.0.0.47:8080/api/verifyOTP';
const requestNewCodeAPI = 'http://10.0.0.47:8080/api/resendVerification';
const getNotesAPI = 'http://10.0.0.47:8080/api/getNotes';
const addNoteAPI = 'http://10.0.0.47:8080/api/addNote';
const loginAPI = 'http://10.0.0.47:8080/api/login';

class UserService {
    // getUsers() {
    //     return axios.get(getUsersAPI, {}, {
    //         auth: auth
    //     }).then(response => {
    //         console.log(response.data);
    //     }).catch(error => {
    //         console.log(error)
    //         console.log(email)
    //         console.log(password)
    //     });
    // }

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
