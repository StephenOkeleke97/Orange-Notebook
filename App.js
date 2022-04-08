import CreateAccountScreen from "./components/CreateAccountScreen";
import CreateNotesScreen from "./components/CreateNotesScreen";
import HomeScreen from "./components/HomeScreen";
import LoginScreen from "./components/LoginScreen";
import VerifyEmailScreen from "./components/VerifyEmailScreen";
import HomeLoggedInScreen from "./components/HomeLoggedInScreen";
import AddNoteToCategoryScreen from "./components/AddNoteToCategoryScreen";
import BackupSettingsScreen from "./components/BackupSettingsScreen";
import BackupSettingsFrequency from "./components/BackupSettingsFrequency";
import SettingsScreen from "./components/SettingsScreen";
import CreateNewPasswordScreen from "./components/CreateNewPasswordScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DefaultTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import NotesScreen from "./components/NotesScreen";
import CurrentUser from "./services/CurrentUser";
import { checkIfLoggedIn, initializeSettings } from "./components/settings";
import { useFonts } from "expo-font";
import * as FileSystem from "expo-file-system";
import { dropTables, initializeDB } from "./db/SchemaScript";

const db = SQLite.openDatabase("notes.db");

initializeDB();
// dropTables();

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#fff",
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleCheckLoggedIn = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
  };

  useEffect(() => {
    checkIfLoggedIn(handleCheckLoggedIn);
  }, []);

  const [loaded] = useFonts({
    LatoRegular: require("./assets/fonts/Lato-Regular.ttf"),
    LatoBold: require("./assets/fonts/Lato-Bold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? "HomeLoggedIn" : "Home"}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen
          name="HomeLoggedIn"
          component={HomeLoggedInScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="CreateNote" component={CreateNotesScreen} />
        <Stack.Screen
          name="AddToCategory"
          component={AddNoteToCategoryScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="NotesScreen" component={NotesScreen} />
        <Stack.Screen name="Backup" component={BackupSettingsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="BackupFrequency"
          component={BackupSettingsFrequency}
        />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen
          name="CreatePassword"
          component={CreateNewPasswordScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
