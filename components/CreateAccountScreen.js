import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { Icon } from 'react-native-elements';
import { useFonts } from 'expo-font';
import { globalStyles } from '../styles/global.js';
import { HideKeyboard } from './HideKeyboard.js';
import UserService from '../services/UserService.js';

export default function CreateAccountScreen({navigation}) {
    const [email, setEmail] =  useState("");
    const [password, setPassword] = useState("");
    const [emailValidation, setEmailValidation] =  useState("");
    const [passwordValidation, setPasswordValidation] = useState("");
    const validator = require("email-validator");

    const [loaded] = useFonts({
        LatoRegular: require('../assets/fonts/Lato-Regular.ttf'),
        LatoBold: require('../assets/fonts/Lato-Bold.ttf'),
      });
      
      if (!loaded) {
        return null;
      }

      const verify = {
        goodResponse: (response) => {
          if (response === "Saved") {
            navigation.navigate('VerifyEmail', {
              email: email,
            });
          } else if (response === "Exists") {
            alert("There is an account associated with this email address.");
          } else {
            alert("Something went wrong. Try again later.");
          }
        },
        badResponse: () => {
          alert("Something went wrong. Try again later.");
        }
      }

      const onSubmit = () => {
        if (email === "" || password === ""){
            if (email === ""){
              setEmailValidation("Email address can't be empty.");
            } 
            if (password === ""){
              setPasswordValidation("Password can't be empty.");
            } 
        } else {
            if (!validator.validate(email)) {
              setEmailValidation("Please enter a correct email address");
              setPasswordValidation("");
            } 
        else {
              setEmailValidation("");
              setPasswordValidation("");
              UserService.addUser(email, password, verify);
            }
        }
    }

      return (
          <HideKeyboard>
            <View style={globalStyles.container}>
                <View style={styles.loginTopBar}>
                    <TouchableOpacity>
                        <Icon
                        size={20}
                        style={styles.closeIcon}
                        name='x'
                        type='feather'
                        color='#808285'
                        onPress={() => navigation.navigate('Home')}
                        />
                    </TouchableOpacity>
                <Text style={styles.registerLaterText}>Later</Text>
                </View>
                <View style={styles.loginPageHeader}>
                    <Text style={styles.loginPageHeaderText}>Create an Account</Text>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputViewComponents}
                        placeholder='Email Address'
                        onChangeText={setEmail}
                    />
                    <Text style={styles.errorText}>{`${emailValidation}`}</Text>
                    <TextInput
                        style={styles.inputViewComponents}
                        placeholder='Password'
                        secureTextEntry
                        onChangeText={setPassword}
                    />
                    <Text style={styles.errorText}>{`${passwordValidation}`}</Text>
            
                <TouchableOpacity style={globalStyles.yellowButton} onPress={() => onSubmit()}>
                    <Text 
                    style={globalStyles.buttonText}>Create an Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.alreadyRegisteredText}>Already have an account?</Text>
                </TouchableOpacity>
                <View style={styles.separator}/>
                </View>

                <View style={styles.joinWithSocialsSection}>
                    <TouchableOpacity style={globalStyles.whiteButton}>
                        <Icon
                            name='google'
                            type='font-awesome'
                            color='#000'
                            size={20}
                            style={StyleSheet.create({marginRight: 5})}
                        />
                        <Text style={globalStyles.buttonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={globalStyles.whiteButton}>
                        <Icon
                            name='facebook'
                            type='font-awesome'
                            color='#000'
                            size={20}
                            style={StyleSheet.create({marginRight: 5})}
                        />
                        <Text style={globalStyles.buttonText}>Continue with Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={globalStyles.whiteButton}>
                        <Icon
                            name='apple'
                            type='font-awesome'
                            color='#000'
                            size={20}
                            style={StyleSheet.create({marginRight: 5})}
                        />
                        <Text style={globalStyles.buttonText}>Continue with Apple</Text>
                    </TouchableOpacity>
                    
                </View>
                {/* <Text>Login</Text> */}
                <StatusBar style="auto" />
            
            </View>
        </HideKeyboard>
      );
}

const styles = StyleSheet.create({
      loginTopBar: {
        flex: 0.05,
        // borderWidth: 5,
        // borderColor: "pink",
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
      },
    
      closeIcon: {
        paddingLeft: 20,
      },
    
      registerLaterText: {
        paddingRight: 20,
        color: '#808285',
        fontWeight: '500',
        fontFamily: 'LatoRegular',
        fontSize: 16
      },
    
      loginPageHeader: {
        flex: 0.1,
        // borderWidth: 5,
        // borderColor: "pink",
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
      },
    
      loginPageHeaderText: {
        fontSize: 25,
        fontFamily: 'LatoBold',
        fontWeight: '700'
      },
    
      inputView: {
        flex: 0.43,
        padding: 20,
        // borderWidth: 5,
        // borderColor: "pink",
      }, 
    
      inputViewComponents: {
        // borderWidth: 1,
        padding: 15,
        backgroundColor: '#FFF',
        // marginBottom: 25
      },
    
    //   loginPageButtonText: {
    //     color: '#000',
    //     fontFamily: 'LatoBold',
    //     fontWeight: '700'
    //   },
    
      alreadyRegisteredText: {
        textAlign: 'center',
        color: '#808285',
        fontWeight: '500',
        fontFamily: 'LatoRegular',
        fontSize: 12,
        marginBottom: 45,
      },
    
      separator: {
        borderBottomWidth: 0.2,
        borderBottomColor: '#BCBEC0'
      },
    
      joinWithSocialsSection: {
        // borderWidth: 5,
        // borderColor: "pink",
        flex: 0.43,
        padding: 15,
        paddingTop: 50
      },

      errorText: {
          fontSize: 10,
          color: 'red',
          marginBottom: 7,
        //   borderWidth: 2
      }
});