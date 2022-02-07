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
    const [emailIsError, setEmailIsError] =  useState(false);
    const [passwordIsError, setPasswordIsError] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const verifyPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    const validator = require("email-validator");

    const [loaded] = useFonts({
        LatoRegular: require('../assets/fonts/Lato-Regular.ttf'),
        LatoBold: require('../assets/fonts/Lato-Bold.ttf'),
      });
      
      if (!loaded) {
        return null;
      }

      const onSubmit = () => {
        const pEmail = email.trim();
        if (!validator.validate(pEmail)) {
          setEmailIsError(true);
        } else if (!verifyPassword.test(password)) {
          setPasswordIsError(true);
        } else {
          UserService.addUser(pEmail, password, () => {
            navigation.navigate('VerifyEmail', {
              email: pEmail,
            });
          });
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
                </View>
                <View style={styles.loginPageHeader}>
                    <Text style={styles.loginPageHeaderText}>Create an Account</Text>
                </View>
                <View style={styles.inputView}>
                  <View style={styles.textInputContainer}>
                    <View style={styles.textInput}>
                      <TextInput
                          style={[styles.inputViewComponents, {width: '100%'}]}
                          placeholder='Email Address'
                          onChangeText={(e) => {
                            setEmail(e);
                            if (emailIsError) setEmailIsError(false);
                          }}
                          autoCapitalize="none"
                      />
                    </View>
                    {emailIsError && <Text style={styles.errorText}>Please enter a valid email address</Text>}
                  </View>

                  <View style={styles.textInputContainer}>
                    <View style={styles.textInput}>
                      <TextInput
                          style={styles.inputViewComponents}
                          placeholder='Password'
                          secureTextEntry={!passwordVisible}
                          onChangeText={(e) => {
                            setPassword(e);
                            if (passwordIsError) setPasswordIsError(false);
                          }}
                      />
                       <TouchableOpacity onPress={() => {setPasswordVisible(!passwordVisible)}}>
                        <Icon
                        type="entypo"
                        name={passwordVisible ? "eye-with-line" : "eye"}
                        size={20}
                        color='#939598'/>
                      </TouchableOpacity>
                    </View>
                    {passwordIsError && <Text style={styles.errorText}>Password must have at least 8 digits and contain one or more of the following:
                    Uppercase letter, lowercase letter, Number, Special character</Text>}
                  </View>    

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

      textInputContainer: {
          marginBottom: 20
      },

      textInput: {
        paddingLeft: 15,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 10,
        marginBottom: 6
      },
    
      inputViewComponents: {
        height: 45,
        width: '90%'
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