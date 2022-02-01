import React from 'react';
import { View,
    FlatList,
    Text,
    Image,
    StyleSheet,
    TextInput  } from 'react-native';
import { deleted, Notes } from '../Notes.js';
import { useEffect, useState } from 'react';
import { TouchableOpacity, Switch } from 'react-native';
import { Icon } from 'react-native-elements';
import Category from './Category.js';
import NoteCardSlim from './NoteCardSlim.js';
import {getDetailedDisplay, toggleDetailedDisplay,
     getBackUpEnabled, toggleBackUpEnabled } from './settings.js'
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/global.js';
import UserService from '../services/UserService.js';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('notes.db');

export default function SettingsScreen() {
    const [isDetailedEnabled, setIsDetailedEnabled] = useState(false);
    const [isBackUpEnabled, setIsBackUpEnabled] = useState(false);

    const setDetailEnabledCallBack = (bool) => {
        setIsDetailedEnabled(bool);
    }

    const setBackUpEnabledCallBack = (bool) => {
        setIsBackUpEnabled(bool);
    }

    useEffect(() => {
        let intervalId = 0;
        if (isBackUpEnabled) {
            intervalId = setInterval(() => {
                console.log("hello");
            }, 5000);
        } 
        return () => {clearInterval(intervalId)};
    }, [isBackUpEnabled]);

    useFocusEffect(
    React.useCallback(() => {
        getDetailedDisplay(setDetailEnabledCallBack);
        getBackUpEnabled(setBackUpEnabledCallBack);
    })
    );

    const toggleDetailedEnabled = () => {
        toggleDetailedDisplay(setDetailEnabledCallBack);
    }

    const toggleEnableBackUp = () => {
        toggleBackUpEnabled(setBackUpEnabledCallBack);
    }

    const handleBackupToServer = () => {
        UserService.backUp();
    }

    return(
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.header}>
                        {/* <TouchableOpacity style={styles.headerIcons}>
                            
                        </TouchableOpacity>             */}
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
            <TouchableOpacity style={globalStyles.yellowButton} onPress={() => handleBackupToServer()}>
                        <Text>Back Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Enable Backup</Text>
                        <Switch
                         trackColor={{false: "#F1F2F2", true: "#00DC7D" }}
                         thumbColor={"#fff"}
                         ios_backgroundColor="#3e3e3e"
                         onValueChange={toggleEnableBackUp}
                         value={isBackUpEnabled}
                         />
                            
            </TouchableOpacity>  
            </View>  

            <View style={styles.settingsComponents}>
                <Text style={{color: '#58595B', fontSize: 15, marginBottom: 10}}>Account</Text>
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Reset Password</Text>
                        <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/>
            </TouchableOpacity>  
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Delete Account</Text>
                        <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/>
            </TouchableOpacity>  
            <TouchableOpacity style={styles.settingsComponent}
            activeOpacity={0.8}>
                        <Text style={styles.settingsText}>Log out</Text>
                        <Icon
                        name='chevron-right'
                        type='material-community'
                        color='#000'/>
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
        // borderTopWidth: 1,
        // borderTopColor: '#6D6E71',
        // borderBottomWidth: 1,
        // borderBottomColor: '#6D6E71',
        // borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: 10,
        borderBottomColor: '#D1D3D4',
        borderBottomWidth: 0.4,
        // marginBottom: 5,
    },

    settingsText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000'
    }

});