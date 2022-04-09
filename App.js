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
import { checkIfLoggedIn } from "./settings/settings";
import { useFonts } from "expo-font";
import { initializeDB } from "./db/SchemaScript";
import { Asset } from "expo-asset";
import AppLoading from "expo-app-loading";

initializeDB();

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
  /**
   * Indicates if assets have been loaded.
   */
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Callback to set login status.
   *
   * @param {boolean} isLoggedIn login status
   */
  const handleCheckLoggedIn = (isLoggedIn) => {
    setIsLoggedIn(isLoggedIn);
  };

  /**
   * Check if a user is logged in. Used to render initial
   * component. If logged in, HomeLoggedIn screen is
   * rendered otherwise the Home screen is rendered.
   */
  useEffect(() => {
    checkIfLoggedIn(handleCheckLoggedIn);
  }, []);

  /**
   * Load fonts.
   */
  const [fontLoaded] = useFonts({
    LatoRegular: require("./assets/fonts/Lato-Regular.ttf"),
    LatoBold: require("./assets/fonts/Lato-Bold.ttf"),
    OverpassBold: require("./assets/fonts/Overpass-SemiBold.ttf"),
    Overpass: require("./assets/fonts/Overpass-Regular.ttf"),
  });

  /**
   * Cache assets.
   *
   * @returns promise that caches assets upon resolve
   */
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

  /**
   * Load resources when mounted.
   */
  useEffect(() => {
    const loadResources = async () => {
      await cacheResources();
      setIsLoaded(true);
    };
    loadResources();
  }, []);

  /**
   * Display splash screen while resources are
   * being loaded.
   */
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
        <Stack.Screen name="Privacy" component={PrivacyPolicy} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
