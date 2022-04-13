import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NotesScreen from "./NotesScreen";
import CategoriesScreen from "./CategoriesScreen";
import SettingsScreen from "./SettingsScreen";
import TrashScreen from "./TrashScreen";
import { Icon } from "react-native-elements";
import {
  getBackupEnabled,
  getBackupFrequency,
  getNextBackUpDate,
  updateNextBackUpDate,
  setLastBackupDate,
  setLastBackupSize,
  parseDate,
} from "../settings/settings";
import UserService, { setAuthHeader } from "../services/UserService";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

/**
 * Home screen when user is logged in.
 *
 * @returns HomeLoggedInScreen
 */
export default function HomeLoggedInScreen() {
  const [userEmail, setUserEmail] = useState("");

  /**
   * Frequency of backup in milliseconds.
   * Used to calculate next backup date.
   */
  const backupFrequency = {
    Daily: 86400000,
    Weekly: 604800000,
    Monthly: 2419200000,
  };

  /**
   * Get user email when component is mounted.
   */
  useEffect(() => {
    getUser().then((user) => {
      setUserEmail(user);
    });

    setAuthHeader();
  }, [userEmail]);

  /**
   * Get last back up information from server.
   */
  useEffect(() => {
    if (userEmail) UserService.getLastBackUpInfo(updateLocalBackUpInfo);
  }, [userEmail]);

  /**
   * Check if a backup is due when the app
   * is open. Only valid when auto backup
   * is enabled.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        getBackupEnabled((enabled) => {
          getNextBackUpDate((date) => {
            let d = new Date().getTime();
            if (enabled && d >= date) {
              UserService.backUp(
                userEmail,
                () => {},
                () => {},
                () => {},
                true,
                handleSuccesfulBackUp
              );
            }
          });
        });
      }
    });

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  /**
   * Update next back up date after a
   * backup is successful. Calculated
   * as the current time in milliseconds
   * plus the milliseconds value  of the
   * frequency.
   */
  const handleSuccesfulBackUp = () => {
    getBackupFrequency((frequency) => {
      let d = new Date().getTime();
      updateNextBackUpDate(d + backupFrequency[frequency]);
    });
  };

  /**
   * Update local backup info. Used after
   * backup information is synced from server.
   *
   * @param {Object} data backup information from server
   */
  const updateLocalBackUpInfo = (data) => {
    if (data.date && data.size) {
      const date = parseDate(data.date);
      setLastBackupDate(date);
      setLastBackupSize(data.size / 100000);
    }
  };

  /**
   * Get user email from AsyncStorage.
   *
   * @returns promise that returns the user when fulfilled
   */
  const getUser = async () => {
    let user;
    try {
      user = await AsyncStorage.getItem("email");
    } catch (error) {
      console.log(error);
    }
    return user;
  };

  return (
    <Tab.Navigator
      initialRouteName="Notes"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === "Notes") {
            iconName = focused ? "home-edit" : "home-edit-outline";
          } else if (route.name === "Trash") {
            iconName = focused ? "trash-can" : "trash-can-outline";
          } else if (route.name === "Categories") {
            iconName = focused ? "folder-open" : "folder-open-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
            return (
              <Icon type="ionicon" name={iconName} size={25} color="white" />
            );
          }
          return (
            <Icon
              type="material-community"
              name={iconName}
              size={25}
              color="white"
            />
          );
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 90,
          backgroundColor: "#000",
          borderRadius: 35,
          borderColor: "#FFF",
          borderWidth: 4,
        },
      })}
    >
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Trash" component={TrashScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
