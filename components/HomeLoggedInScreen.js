import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NotesScreen from './NotesScreen';
import CategoriesScreen from "./CategoriesScreen";
import SettingsScreen from "./SettingsScreen";
import TrashScreen from "./TrashScreen";
import { Icon } from "react-native-elements";
import { getBackupEnabled, getBackupFrequency, getNextBackUpDate, getSyncStatus, syncWithLocalDB, updateNextBackUpDate } from "./settings";
import UserService from "../services/UserService";
import { useEffect, useState } from "react";
import CurrentUser from "../services/CurrentUser";
const Tab = createBottomTabNavigator();

export default function HomeLoggedInScreen() {
  const [backupFrequencyLabel, setBackupFrequencyLabel] = useState("Daily");
  const [backupEnabled, setBackupEnabled] = useState(false);

  const backupFrequency = {"Daily": 86400000,
    "Weekly": 604800000,
    "Monthly": 2419200000};

    useEffect(() => {
      getSyncStatus((synced) => {
        if (synced === "0.0") 
          UserService.enableTwoFactor(CurrentUser.prototype.getUser() ,synced === "1.0", syncWithLocalDB);
      });
    }, []);

    useEffect(() => {
      getBackupEnabled((enabled) => {setBackupEnabled(enabled)});
      getBackupFrequency((frequency) => setBackupFrequencyLabel(frequency));
      getNextBackUpDate((date) => {
        let d = new Date().getTime();
        if (backupEnabled && d >= date) {
          UserService.backUp(() => {}, () => {}, true, handleSuccesfulBackUp);
        }
      });
    })

    const handleSuccesfulBackUp = () => {
      let d = new Date().getTime();
      updateNextBackUpDate(d + backupFrequency[backupFrequencyLabel]);
    }


    return (
      <Tab.Navigator initialRouteName='Notes'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Notes') {
            iconName = focused
              ? 'home-edit'
              : 'home-edit-outline';
          } else if (route.name === 'Trash') {
            iconName = focused ? 'trash-can' : 'trash-can-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'folder-open' : 'folder-open-outline'
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'
            return <Icon type='ionicon' name={iconName} size={25} color='white' />;
          }

          // You can return any component that you like here!
          return <Icon type='material-community' name={iconName} size={25} color='white' />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarStyle: {
            height: 90,
            backgroundColor: '#000',
            borderRadius: 35,
            borderColor: '#FFF',
            borderWidth: 4
            // position: 'absolute'
            
        },
      })}>
        <Tab.Screen name="Notes" component={NotesScreen} />
        <Tab.Screen name='Categories' component={CategoriesScreen}/>
        <Tab.Screen name="Trash" component={TrashScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen}/>
      </Tab.Navigator>
    );
  }