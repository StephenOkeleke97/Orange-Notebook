import React from 'react';
import {Text, View, TouchableOpacity ,
        StyleSheet, Animated, Easing, Switch, Alert} from 'react-native';
import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getBackupFrequency, getLastBackUpDate, getLastBackUpSize } from './settings.js';
import { Icon } from 'react-native-elements';
import { globalStyles } from '../styles/global';
import {getBackUpEnabled, toggleBackUpEnabled } from './settings.js';
import UserService from '../services/UserService.js';

const BackupSettingsScreen = ( {navigation} ) => {
    const backupFrequency = {"Daily": 86400000,
    "Weekly": 604800000,
    "Monthly": 2419200000};
    const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [isBackUpEnabled, setIsBackUpEnabled] = useState(false);
    const [backupFrequencyLabel, setBackupFrequencyLabel] = useState("Daily");
    const [lastBackUpDate, setLastBackupDate] = useState("");
    const [lastBackUpSize, setLastBackupSize] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);

    const backupFrequencyActiveOpacity = isBackUpEnabled ? 0.3 : 1;

    useFocusEffect(
        React.useCallback(() => {
            getBackUpEnabled(setBackUpEnabledCallBack);
            getBackupFrequency((frequency) => setBackupFrequencyLabel(frequency));
            getLastBackUpDate((date) => {
                if (date === null) setLastBackupDate("None");
                else setLastBackupDate(date);
            });
            getLastBackUpSize((size) => {
                if (size !== null) setLastBackupSize(size);
            })
        })
    );

    useEffect(() => {
        if (backupInProgress) startImageRotateFunction();
        else rotateAnimation.stopAnimation();
    });

    const setProgressActiveCallBack = (boolean) => {
        setBackupInProgress(boolean);
    }

    const setProgressCallBack = (percent) => {
        setProgressPercent(percent);
    }

    const handleBackUpToServer = () => {
        Alert.alert('Back Up Notes',
        'Are you sure you want to back up notes now? Completing this' +
        ' action will overwrite any old backups.',
        [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Back Up',
                onPress: () => {UserService.backUp(setProgressActiveCallBack, setProgressCallBack)}
            }
        ]);  
    }

    const handleRestoreFromServer = () => {
        Alert.alert('Restore Backup',
        'Are you sure you want to restore backup? Completing this ' +
        'action will overwrite all notes on this device.',
        [
            {
                text: 'Cancel',
                style: 'cancel'
            }, 
            {
                text: 'Restore',
                onPress: () => {UserService.restoreBackup(setProgressActiveCallBack, setProgressCallBack)}
            }
        ])
    }

    const handleDeleteFromServer = () => {
        Alert.alert('Delete Backup',
        'Are you sure you want to delete backup? Once deleted, ' +
        'back up files can never be recovered.',
        [
            {
                text: 'Cancel',
                style: 'cancel'
            }, 
            {
                text: 'Delete',
                style: 'destructive'
            }
        ])
    }

    const setBackUpEnabledCallBack = (bool) => {
        setIsBackUpEnabled(bool);
    }

    const toggleEnableBackUp = () => {
        toggleBackUpEnabled(setBackUpEnabledCallBack);
    }

    const handleBackToSettings = () => {
        navigation.goBack();
    }

    const handleSelectFrequency = () => {
        if (isBackUpEnabled) {
            navigation.navigate('BackupFrequency');
        }
    }

    const startImageRotateFunction = () => {
        rotateAnimation.setValue(0);
        Animated.timing(rotateAnimation, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: false
        }).start((o) => {
            if (o.finished) startImageRotateFunction();
        })
    }

    const interpolateRotating = rotateAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const animatedStyle = {
        transform: [{
            rotate: interpolateRotating
        }],
        borderRadius: 50,
    }

    const backupFrequencyTextStyle = {
        color: isBackUpEnabled ? '#000' : '#D1D3D4'
    }

    const backupFrequencyText = {
        fontSize: 15,
        color: isBackUpEnabled ? '#939598' : '#D1D3D4'
    }

    return <View style={globalStyles.container}>
        <View style={styles.container}>
            <View style={styles.navTab}>
                <TouchableOpacity style={styles.backNavContainer}
                onPress={() => handleBackToSettings()}>
                    <View style={styles.backButtonContainer}>
                        <Icon
                        name='arrow-left'
                        type='material-community'
                        size={18}
                        color='#1771F1'
                        />
                    </View>
                    <Text style={styles.navTitleText}>Settings</Text>
                </TouchableOpacity>

                <View style={styles.navHeaderContainer}>
                    <Text style={styles.navHeaderText}>Back Up</Text>
                </View>

                <View style={styles.backNavContainer}/>
            </View>

            <View style={styles.backupStatusContainer}>
                <View style={styles.progressContainer}>
                    <View style={styles.progress}>
                        <Animated.View style={animatedStyle}>
                            <Icon
                            type='material-community'
                            name='refresh'
                            size={35}
                            color='#BCBEC0'/>
                        </Animated.View>
                    </View>
                    <View style={styles.progressDescription}>
                        <Text style={styles.progressDescriptionText}>Last Backup: {lastBackUpDate}</Text>
                        <Text style={styles.progressDescriptionText}>Total Size: {lastBackUpSize} mb</Text>
                        {backupInProgress && <Text style={styles.progressDescriptionText}>Progress: {progressPercent}%</Text>}
                    </View>
                </View>
                <View>
                    <Text>Back up your note history so if you lose your phone or
                        switch to a new one, your note history is safe. You can restore your note
                        history by pressing the Restore Backup button below.
                    </Text>
                </View>
            </View>
            <View style={styles.backupFeaturesContainer}>
                <TouchableOpacity style={styles.backupFeatures}
                activeOpacity={0.5} onPress={() => handleBackUpToServer()}>
                    <Text style={styles.settingsText}>Back Up Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backupFeatures}
                activeOpacity={0.5} onPress={() => handleRestoreFromServer()}>
                    <Text style={styles.settingsText}>Restore Backup</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backupFeatures}
                activeOpacity={0.5} onPress={() => handleDeleteFromServer()}>
                    <Text style={[styles.settingsText, {color: 'red'}]}>Delete Backup</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity style={[styles.backupFeatures, styles.autoBackup]}
                activeOpacity={0.8}>
                    <Text style={[styles.settingsText, {color: '#000'}]}>Auto Backup</Text>
                    <Switch
                    trackColor={{false: "#F1F2F2", true: "#00DC7D" }}
                    thumbColor={"#fff"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleEnableBackUp}
                    value={isBackUpEnabled}
                    />
                </TouchableOpacity> 
                <TouchableOpacity style={[styles.backupFeatures, styles.autoBackup]}
                activeOpacity={backupFrequencyActiveOpacity}
                onPress={() => handleSelectFrequency()}>
                    <Text style={backupFrequencyTextStyle}>Backup Frequency</Text>
                    <View style={styles.backupFrequencyContainer}>
                        <Text style={backupFrequencyText}>{backupFrequencyLabel}</Text>
                        <Icon
                        name='chevron-right'
                        type='material-community'
                        color={isBackUpEnabled ? '#939598': '#D1D3D4'}/>
                    </View>

                </TouchableOpacity>   
            </View>
        </View>
    </View>
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        paddingTop: 60
    },

    navTab: {
    //    flex: 0.1,
    //    borderWidth: 1,
    //    borderColor: 'green',
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'space-between'
    },

    backNavContainer: {
        // borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '35%'
    },

    navHeaderContainer: {
        // borderWidth: 1,
        alignItems: 'center',
        width: '30%'
    },

    navHeaderText: {
        fontSize: 19,
        fontWeight: '600'
    },

    backButtonContainer: {
        // borderWidth: 1,
        marginRight: 3
    },

    navTitleText: {
        fontSize: 14,
        color: '#1771F1'
    },

    backupStatusContainer: {
        // borderWidth: 1,
        // flex: 0.3,
        paddingTop: 20,
        paddingBottom: 30
    },

    progressContainer: {
        // borderWidth: 1,
        // borderColor: 'red',
        // flex: 0.4,
        flexDirection: 'row',
        padding: 12,
        paddingLeft: 0
    },

    progress: {
        // borderWidth: 1,
        // borderColor: 'blue',
        width: '23%',
        borderRadius: 12,
        backgroundColor: '#E6E7E8',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60
    },

    progressDescription: {
        // borderWidth: 1,
        // borderColor: 'red',
        flex: 1,
        paddingLeft: 20,
    },

    progressDescriptionText: {
        color: '#808285',
    },

    backupFeaturesContainer: {
        // borderWidth: 1,
        paddingBottom: 30
    },

    backupFeatures: {
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingLeft: 10,
        borderBottomColor: '#D1D3D4',
        borderBottomWidth: 0.4,
    },

    settingsText: {
        fontWeight: '500',
        color: '#5199FF'
    },

    autoBackup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backupFrequencyContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    // backupFrequencyText: {
    //     fontSize: 15,
    //     color: '#939598'
    // }

})

export default BackupSettingsScreen;