import { StyleSheet, View, 
    TouchableOpacity, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { setBackupFrequency, getBackupFrequency } from './settings';
import { globalStyles } from '../styles/global';

const BackupSettingsFrequency = ({ navigation }) => {
    const [dailyActive, setDailyActive] = useState(false);
    const [weeklyActive, setWeeklyActive] = useState(false);
    const [monthlyActive, setMonthlyActive] = useState(false);

    useFocusEffect(() => {
        getBackupFrequency((frequency) => {
            if (frequency === "Daily") setDailyActive(true);
            else if (frequency === "Weekly") setWeeklyActive(true);
            else if (frequency === "Monthly") setMonthlyActive(true);
            else setDailyActive(true);
        })
    });

    const handleDailyActive = () => {
        setBackupFrequency("Daily", () => {
            setDailyActive(true);
            setWeeklyActive(false);
            setMonthlyActive(false);
        })
    }

    const handleWeeklyActive = () => {
        setBackupFrequency("Weekly", () => {
            setDailyActive(false);
            setWeeklyActive(true);
            setMonthlyActive(false);
        })
    }

    const handleMonthlyActive = () => {
        setBackupFrequency("Monthly", () => {
            setDailyActive(false);
            setWeeklyActive(false);
            setMonthlyActive(true);
        })
    }

    const handleBack = () => {
        navigation.goBack();
    }
    return <View style={globalStyles.container}>
        <View style={styles.container}>
            <View style={styles.navTab}>
                    <TouchableOpacity style={styles.backNavContainer}
                    onPress={() => handleBack()}>
                        <View style={styles.backButtonContainer}>
                            <Icon
                            name='arrow-left'
                            type='material-community'
                            size={18}
                            color='#1771F1'
                            />
                        </View>
                        <Text style={styles.navTitleText}>Back Up</Text>
                    </TouchableOpacity>

                    <View style={styles.navHeaderContainer}>
                        <Text style={styles.navHeaderText}>Frequency</Text>
                    </View>

                    <View style={styles.backNavContainer}/>
                </View>

                <View style={styles.frequencyContainer}>

                    <TouchableOpacity style={styles.settingsComponent}
                    activeOpacity={0.5} onPress={() => handleDailyActive()}>
                        <Text style={styles.settingsText}>Daily</Text>
                        {dailyActive && <Icon
                        name='check'
                        type='feather'
                        color='#5199FF'
                        size={20}/>   }             
                    </TouchableOpacity>  

                    <TouchableOpacity style={styles.settingsComponent}
                    activeOpacity={0.5} onPress={() => handleWeeklyActive()}>
                        <Text style={styles.settingsText}>Weekly</Text>
                        {weeklyActive && <Icon
                        name='check'
                        type='feather'
                        color='#5199FF'
                        size={20}/>}                
                    </TouchableOpacity>  

                    <TouchableOpacity style={styles.settingsComponent}
                    activeOpacity={0.5} onPress={() => handleMonthlyActive()}>
                        <Text style={styles.settingsText}>Monthly</Text>
                        {monthlyActive && <Icon
                        name='check'
                        type='feather'
                        color='#5199FF'
                        size={20}/>}                
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

    frequencyContainer: {
        paddingTop: 40
    },

    settingsComponent: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomColor: '#D1D3D4',
        borderBottomWidth: 0.4,
    },

    settingsText: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000'
    },
})

export default BackupSettingsFrequency