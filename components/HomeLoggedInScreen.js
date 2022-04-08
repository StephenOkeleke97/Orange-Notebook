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
} from "./settings";
import UserService from "../services/UserService";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

export default function HomeLoggedInScreen() {
  const [userEmail, setUserEmail] = useState("");

  const backupFrequency = {
    Daily: 86400000,
    Weekly: 604800000,
    Monthly: 2419200000,
  };

  useEffect(() => {
    getUser().then((user) => {
      setUserEmail(user);
    });
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) UserService.getLastBackUpInfo(updateLocalBackUpInfo);
  }, [userEmail]);

  useEffect(() => {
    getBackupEnabled((enabled) => {
      getNextBackUpDate((date) => {
        let d = new Date().getTime();
        if (enabled && d >= date) {
          UserService.backUp(
            () => {},
            () => {},
            true,
            handleSuccesfulBackUp
          );
        }
      });
    });
  });

  const handleSuccesfulBackUp = () => {
    getBackupFrequency((frequency) => {
      let d = new Date().getTime();
      updateNextBackUpDate(d + backupFrequency[frequency]);
    });
  };

  const updateLocalBackUpInfo = (data) => {
    if (data.date && data.size) {
      const date = parseDateFromServer(data.date);
      setLastBackupDate(date);
      setLastBackupSize(data.size / 100000);
    }
  };

  const parseDateFromServer = (date) => {
    const temp = new Date(Date.parse(date));
    const parsedDate = `${temp.getFullYear()}-${
      temp.getMonth() + 1
    }-${temp.getDate()} ${temp.getHours()}:${temp.getMinutes()}:${temp.getSeconds()}`;
    return parsedDate;
  };

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
