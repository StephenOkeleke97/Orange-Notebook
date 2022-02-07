import React from 'react';
import { View, Text,
    StyleSheet, Switch, TouchableOpacity, Alert  } from 'react-native';
import { useState } from 'react';
import { Icon } from 'react-native-elements';
import { getDetailedDisplay, toggleDetailedDisplay,
getTwoFactor, toggleTwoFactor, syncWithLocalDB, deleteUser, logOut } from './settings.js'
import { useFocusEffect } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import UserService from '../services/UserService.js';
import CurrentUser from '../services/CurrentUser';

const db = SQLite.openDatabase('notes.db');

export default function SettingsScreen( {navigation} ) {
    const [isDetailedEnabled, setIsDetailedEnabled] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);

    useFocusEffect(
    React.useCallback(() => {
        getDetailedDisplay(setDetailEnabledCallBack);
        getTwoFactor(setTwoFactorCallBack);
    })
    );

    const setDetailEnabledCallBack = (bool) => {
        setIsDetailedEnabled(bool);
    }

    const setTwoFactorCallBack = (bool) => {
        setTwoFactor(bool);
    }

    const handleNavigateToBackupSettings = () => {
        navigation.navigate('Backup');
    }

    const toggleDetailedEnabled = () => {
        toggleDetailedDisplay(setDetailEnabledCallBack);
    }

    const toggleTwoFactorEnabled = () => {
        toggleTwoFactor(setTwoFactorCallBack, syncWithServerCallBack);
    }

    const syncWithServerCallBack = (bool) => {
        UserService.enableTwoFactor(CurrentUser.prototype.getUser(), bool, syncWithLocalDB);
    }

    const handleDeleteAccount = () => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete your account? " +
        "This action cannot be done", [
            {
                text: 'Cancel',
                style: 'cancel'
            },

            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    UserService.delete(CurrentUser.prototype.getUser(), handleDeleteFromLocalAndLogOut);
                }
            }
        ])
    }

    const handleDeleteFromLocalAndLogOut = () => {
        deleteUser(() => {
            navigation.navigate('Home');
        })
    }

    const handleLogOut = () => {
        Alert.alert("Log out", "You will be logged out of your account", [
            {
                text: 'Cancel',
                style: 'cancel'
            },

            {
                text: 'Log out',
                onPress: () => {
                    logOut(() => {
                        navigation.navigate('Home');
                    })
                }
            }
        ])
    }

    return(
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.header}>
                        <Text style={styles.titleText}>Settings</Text>  
                </View> 
            </View>  
            <View style={styles.settingsComponents}>
                <Text style={{color: '#58595B', fontSize: 15, marginBottom: 10}}>Preferences</Text>
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Detailed View</Text>
                        <Switch
                         trackColor={{false: "#F1F2F2", true: "#00DC7D" }}
                         thumbColor={"#fff"}
                         ios_backgroundColor="#3e3e3e"
                         onValueChange={toggleDetailedEnabled}
                         value={isDetailedEnabled}
                         />

            </TouchableOpacity>  

            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Two-Factor Authentication</Text>
                        <Switch
                         trackColor={{false: "#F1F2F2", true: "#00DC7D" }}
                         thumbColor={"#fff"}
                         ios_backgroundColor="#3e3e3e"
                         onValueChange={toggleTwoFactorEnabled}
                         value={twoFactor}
                         />

            </TouchableOpacity>  
           
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.5} onPress={() => handleNavigateToBackupSettings()}>
                        <Text style={styles.settingsText}>Backup</Text>
                          <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/>
                            
            </TouchableOpacity>  
            </View>  

            <View style={styles.settingsComponents}>
                <Text style={{color: '#58595B', fontSize: 15, marginBottom: 10}}>Account</Text>
            {/* <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Change Password</Text>
                        <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/>
            </TouchableOpacity>   */}
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.5} onPress={handleDeleteAccount}>
                        <Text style={[styles.settingsText, {color: 'red'}]}>Delete Account</Text>
                        {/* <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/> */}
            </TouchableOpacity>  
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.5} onPress={handleLogOut}>
                        <Text style={styles.settingsText}>Log out</Text>
                        {/* <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/> */}
            </TouchableOpacity>  
            </View>   
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 15, 
        paddingTop: 30, 
        backgroundColor:'#F2F2F2',
    },

    titleText: {
        fontSize: 20,
        fontFamily: 'LatoBold',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1,
        flex: 1
    },

    mainContainer: {
        flex: 0.3,
        paddingBottom: 2,
        borderBottomWidth: 0.3,
        borderBottomColor: '#BCBEC0',
    },

    settingsComponents: {
        paddingTop: 30,
    },

    settingsComponent: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: 10,
        borderBottomColor: '#D1D3D4',
        borderBottomWidth: 0.4,
    },

    settingsText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000'
    }

});