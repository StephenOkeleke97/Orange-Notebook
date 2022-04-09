import CreateAccountScreen from "./screens/CreateAccountScreen";
import CreateNotesScreen from "./screens/CreateNotesScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import HomeLoggedInScreen from "./screens/HomeLoggedInScreen";
import AddNoteToCategoryScreen from "./screens/AddNoteToCategoryScreen";
import BackupSettingsScreen from "./screens/BackupSettingsScreen";
import BackupSettingsFrequency from "./screens/BackupSettingsFrequency";
import SettingsScreen from "./screens/SettingsScreen";
import CreateNewPasswordScreen from "./screens/CreateNewPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import NotesScreen from "./screens/NotesScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DefaultTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import { checkIfLoggedIn } from "./settings/settings";
import { useFonts } from "expo-font";
import { dropTables, initializeDB } from "./db/SchemaScript";
import { Asset } from "expo-asset";
import AppLoading from "expo-app-loading";

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
  const [isLoaded, setIsLoaded] = useState(false);

  const handleCheckLoggedIn = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
  };

  useEffect(() => {
    checkIfLoggedIn(handleCheckLoggedIn);
  }, []);

  const [fontLoaded] = useFonts({
    LatoRegular: require("./assets/fonts/Lato-Regular.ttf"),
    LatoBold: require("./assets/fonts/Lato-Bold.ttf"),
    OverpassBold: require("./assets/fonts/Overpass-Bold.ttf"),
    Overpass: require("./assets/fonts/Overpass-Regular.ttf")
  });

  const cacheResources = async () => {
    const images = [
      require("./assets/images/notes.png"),
      require("./assets/images/notes.png"),
    ];
    const cachedImages = images.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });

    return Promise.all(cachedImages);
  };

  useEffect(() => {
    const loadResources = async () => {
      await cacheResources();
      setIsLoaded(true);
    };
    loadResources();
  }, []);

  if (!isLoaded || !fontLoaded) {
    return <AppLoading />;
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
        <Stack.Screen name="Privacy" component={PrivacyPolicy}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
