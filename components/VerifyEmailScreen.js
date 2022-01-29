import {View, 
TextInput,
TouchableOpacity,
StyleSheet,
Text,
Keyboard} from 'react-native';
import { globalStyles } from '../styles/global';
import { Icon } from 'react-native-elements';
import { useState } from 'react';
import UserService from '../services/UserService';

 export default function VerifyEmailScreen({ navigation, route} ) {
     const {email} = route.params;
     const numList = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
     const [num1, setNum1] = useState('');
     const [num2, setNum2] = useState('');
     const [num3, setNum3] = useState('');
     const [num4, setNum4] = useState('');
     const [currentNum, setCurrentNum] = useState(1);
     const [nextNum, setNextNum] = useState(1);
     const [errorText, setErrorText] = useState('');

     const setNum = (next, num) => {
        if (next === 1) {
            setNum1(num)
            setCurrentNum(1);
            setNextNum(nextNum+1);
        } else if (next === 2) {
            setNum2(num)
            setCurrentNum(2);
            setNextNum(nextNum+1);
        } else if (next === 3) {
            setNum3(num);
            setCurrentNum(3);
            setNextNum(nextNum+1);
        } else if (next === 4){
            setNum4(num);
            setCurrentNum(4);
            setNextNum(nextNum+1);
        }
     }

     const deleteNum = () => {
         if (currentNum === 1) {
            setNum1('');
            setNextNum(currentNum);
         } else if (currentNum === 2) {
             setNum2('');
             setCurrentNum(currentNum - 1);
             setNextNum(nextNum - 1);
         } else if (currentNum === 3) {
             setNum3('');
             setCurrentNum(currentNum - 1);
             setNextNum(nextNum - 1);
         } else if (currentNum === 4) {
             setNum4('');
             setCurrentNum(currentNum - 1);
             setNextNum(nextNum - 1);
         }
        
     }

     const onSubmit = () => {
         const verificationCode = `${num1}` + `${num2}` + `${num3}` + `${num4}`;
         if (verificationCode.length < 4) {
             setErrorText('Code must be have 4 digits');
         } else {
            setErrorText('');

            const verify = {
                goodResponse: (response) => {
                    if (response){
                        navigation.navigate('HomeLoggedIn');
                    } else {
                        alert("Invalid Verification Code");
                    }
                },
                badResponse: () => {
                    alert("Something went wrong. Please try again later."); 
                }
            }

            UserService.verifyUser(email, verificationCode, verify);
         }       
     }

    return (
        <View style={styles.container}>
            <View style={{backgroundColor: '#FFF', flex: 0.13}}/>
            <View style={styles.headerView}>
                <View style={styles.icon}>
                    <TouchableOpacity>
                        <Icon
                        size={20}
                        style={styles.backIcon}
                        name='arrow-left'
                        type='feather'
                        color='#000'
                        onPress={() => navigation.navigate('CreateAccount')}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerText}>Verify Email</Text>
                <View style={styles.rightContainer}></View>
            </View>
            <View style={styles.inputView}>
                <Text style={styles.inputViewText1}>Code is sent to stephenokeleke@yahoo.com</Text>
                <View style={styles.input}>
                    <View style={styles.inputBoxes}>
                        <Text style={styles.inputBoxText}>{num1}</Text>
                    </View>
                    <View style={styles.inputBoxes}>
                        <Text style={styles.inputBoxText}>{num2}</Text>
                    </View>
                    <View style={styles.inputBoxes}>
                        <Text style={styles.inputBoxText}>{num3}</Text>
                    </View>
                    <View style={styles.inputBoxes}>
                         <Text style={styles.inputBoxText}>{num4}</Text>
                    </View>
                </View>
                <Text style={styles.errorText}>{errorText}</Text>
                <TouchableOpacity onPress={() => UserService.resendVerification(email)}>
                 <Text style={styles.inputViewText1}>Didn't receive code? Request again</Text>
                </TouchableOpacity>
            </View>
            <View style={{paddingLeft: 40, paddingRight: 40, backgroundColor: '#FFF', 
            borderBottomLeftRadius: 40, borderBottomRightRadius: 40}}>
             <TouchableOpacity style={styles.yellowButton} onPress={() => onSubmit()}>
                 <Text style={globalStyles.buttonText}>Verify and Create Account</Text>
             </TouchableOpacity>
            </View>

            <View style={styles.keyboardView}>
                {numList.map((section, index) => {
                    return(
                        <View key={index} style={styles.keyboardRow}>
                            {section.map((num, index) => {
                                return(
                                    <TouchableOpacity key={index} style={styles.keyboardKey} onPress={() => setNum(nextNum, num)}>
                                        <Text style={styles.keypadText}>{num}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    )
                })}
                <View style={styles.keyboardRow}>           
                    <TouchableOpacity style={styles.keyboardKey}>
                        <Text style={styles.keypadText}></Text>
                    </TouchableOpacity>  
                    <TouchableOpacity style={styles.keyboardKey} onPress={() => setNum(nextNum, 0)}>
                        <Text style={styles.keypadText}>0</Text>
                    </TouchableOpacity>  
                    <TouchableOpacity style={styles.keyboardKey} onPress={() => deleteNum()}>
                        <Text style={styles.keypadText}>
                            <Icon
                            size={20}
                            name='delete'
                            type='feather'
                            color='#000'
                            />
                        </Text>
                    </TouchableOpacity>                
                </View>
            </View>
            
        </View>
    )
}

const styles  = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F2F2'
    },

    headerView: {
        flex: 0.05,
        // borderWidth: 2,
        // borderColor: 'pink',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff'
    },

    rightContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
      },

    icon: {
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },

    headerText: {
        fontSize: 18,
        fontFamily: 'LatoRegular',
        fontWeight: '300',
    },

    backIcon: {
        paddingLeft: 20,
      },

      inputView: {
        flex: 0.4,
        // borderWidth: 2,
        // borderColor: 'pink',
        padding: 25,
        paddingLeft: 40,
        paddingRight: 40,
        alignItems: 'center',
        backgroundColor: '#FFF',
      },

      inputViewText1: {
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'LatoRegular',
        fontWeight: '300',
        color: '#808285',
        // fontSize: 11,
        marginBottom: 45
      },

      input: {
        //   borderWidth: 2,
        //   borderColor: 'green',
        //   flex: 0.4,
          justifyContent: 'space-between',
          flexDirection: 'row',
          width: 235,
          height: 50,
        //   marginTop: 45,
        marginBottom: 10
     
      },

      errorText: {
        marginBottom: 45,
        color: 'red',
        fontSize: 13,
      },

      inputBoxes: {
        // borderWidth: 2,
        // borderColor: 'indigo',
        width: 50,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {width: 1, height: 3},
        shadowOpacity: 0.2,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      },

      inputBoxText: {
        fontSize: 20
      }, 

      keyboardView: {
          flex: 0.6,
        //   borderWidth: 2,
        //   borderColor: 'pink',
        //   flexDirection: 'row',
        //   justifyContent: 'space-around',
        //   marginVertical: 20
        paddingTop: 50

      },

      yellowButton: {
        backgroundColor: '#FED876',
        padding: 13,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 30,
      },

      keyboardRow: {
        //   alignSelf: 'center'
        flexDirection: 'row',
        justifyContent: 'space-around'
      },

      keyboardKey: {
        // borderWidth: 2,
        flex: 0.2,
        marginBottom: 20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#fff'
      },

      keypadText: {
        fontSize: 20,
        fontFamily: 'LatoBold',
        fontWeight: '300',
      },
})