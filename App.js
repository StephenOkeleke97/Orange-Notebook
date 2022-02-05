import CreateAccountScreen from './components/CreateAccountScreen';
import CreateNotesScreen from './components/CreateNotesScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import VerifyEmailScreen from './components/VerifyEmailScreen';
import HomeLoggedInScreen from './components/HomeLoggedInScreen';
import AddNoteToCategoryScreen from './components/AddNoteToCategoryScreen';
import BackupSettingsScreen from './components/BackupSettingsScreen';
import BackupSettingsFrequency from './components/BackupSettingsFrequency';
import SettingsScreen from './components/SettingsScreen';
import CreateNewPasswordScreen from './components/CreateNewPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {  DefaultTheme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import NotesScreen from './components/NotesScreen';
import * as FileSystem from 'expo-file-system';
import CurrentUser from './services/CurrentUser';
import { checkIfLoggedIn, initializeSettings } from './components/settings';
import { useFonts } from 'expo-font';

const db = SQLite.openDatabase('notes.db');

db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
console.log('Foreign keys turned on'));

const fileSystem = async () => {
  let a = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/notes.db');
  console.log(a);
  return a;
}
// fileSystem();

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff'
  },
};
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleCheckLoggedIn = (loggedIn, email) => {

    if (loggedIn) {
      CurrentUser.prototype.setUser(email);
      initializeSettings();
      setIsLoggedIn(loggedIn);
    }  
}

  useEffect(() => {
    checkIfLoggedIn(handleCheckLoggedIn);
    db.transaction((tx) => {
      // tx.executeSql('SELECT * FROM Category', [], (t, {rows: {_array}}) => console.log(_array), (t, error) => console.log(error));

      // tx.executeSql('DROP TABLE IF EXISTS Category', [], null, (t, error) => console.log(error));

      // tx.executeSql( 'DROP TABLE IF EXISTS Notes', [], null, (t, error) => console.log(error));
      
      // tx.executeSql( 'DROP TABLE IF EXISTS UserSettings', [], null, (t, error) => console.log(error));

      // tx.executeSql( 'DROP TABLE IF EXISTS Settings', [], null, (t, error) => console.log(error));

      // tx.executeSql( 'DROP TABLE IF EXISTS Users', [], null, (t, error) => console.log(error));

      // tx.executeSql( 'DROP TABLE IF EXISTS BackupFrequency', [], null, (t, error) => console.log(error));

      // tx.executeSql('CREATE TABLE IF NOT EXISTS BackupFrequency(Frequency [Daily, Weekly, Monthly] UNIQUE NOT NULL,' +
      //   'PRIMARY KEY(Frequency))',
      // [], null, (t, error) => console.log(error));

      // tx.executeSql('CREATE TABLE IF NOT EXISTS Users(UserID INTEGER UNIQUE NOT NULL, UserEmail TEXT UNIQUE NOT NULL,' +
      //   'BackupFrequency TEXT, BackupSize INTEGER, BackupDate DATE, LoggedIn INTEGER, PRIMARY KEY(UserID), FOREIGN KEY (BackupFrequency) REFERENCES BackupFrequency(Frequency))',
      // [], null, (t, error) => console.log(error));

      // tx.executeSql('CREATE TABLE IF NOT EXISTS Settings(SettingName TEXT UNIQUE NOT NULL,' +
      //   'PRIMARY KEY(SettingName))',
      // [], null, (t, error) => console.log(error));

      // tx.executeSql( 'CREATE TABLE IF NOT EXISTS UserSettings(UserEmail TEXT NOT NULL, SettingName ' +
      // 'TEXT NOT NULL, SettingEnabled TEXT NOT NULL, SettingSynced TEXT, PRIMARY KEY(UserEmail, SettingName), ' +
      // 'FOREIGN KEY(UserEmail) REFERENCES Users(UserEmail) ON DELETE CASCADE FOREIGN KEY(SettingName) REFERENCES Settings(SettingName) ON DELETE RESTRICT)', 
      // [], null, (t, error) => console.log(error));

      // tx.executeSql(
      //   'CREATE TABLE IF NOT EXISTS Category(CategoryName TEXT NOT NULL, UserEmail TEXT, ' +
      //      'RedColor INT, GreenColor INT, BlueColor INT, PRIMARY KEY(CategoryName, UserEmail), ' + 
      //      'FOREIGN KEY (UserEmail) REFERENCES Users(UserEmail) ON DELETE CASCADE)'
      // , [], null, (t,error) => console.log(error));

      

      // tx.executeSql('CREATE TABLE IF NOT EXISTS Notes(NotesID INTEGER UNIQUE NOT NULL, UserEmail TEXT, ' +  
      //     'Title TEXT, CategoryName TEXT, Label TEXT, Content TEXT, DateAdded DATE, Deleted TEXT, Pinned TEXT, Synced TEXT,' +
      //      'PRIMARY KEY (NotesID) FOREIGN KEY (CategoryName, UserEmail) REFERENCES Category ON DELETE SET NULL ON UPDATE CASCADE ' + 
      //      'FOREIGN KEY(UserEmail) REFERENCES Users(UserEmail) ON DELETE CASCADE)'
      //      , [], null, (t,error) => console.log(error));

      // tx.executeSql('INSERT OR IGNORE INTO Settings VALUES ("DetailedView")'
      // , [], null, (t,error) => console.log(error));
      
      // tx.executeSql('INSERT OR IGNORE INTO Settings VALUES ("TwoFactor")'
      // , [], null, (t,error) => console.log(error));
      // tx.executeSql('INSERT OR IGNORE INTO BackupFrequency VALUES ("Daily")'
      // , [], null, (t,error) => console.log(error));

      // tx.executeSql('INSERT OR IGNORE INTO BackupFrequency VALUES ("Weekly")'
      // , [], null, (t,error) => console.log(error));

      // tx.executeSql('INSERT OR IGNORE INTO BackupFrequency VALUES ("Monthly")'
      // , [], null, (t,error) => console.log(error));
      
    });
  }, []);

  const [loaded] = useFonts({
    LatoRegular: require('./assets/fonts/Lato-Regular.ttf'),
    LatoBold: require('./assets/fonts/Lato-Bold.ttf'),
  });
  
  if (!loaded) {
    return null;
  }
    
  // options={{gestureEnabled:false }}
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}} 
      initialRouteName={isLoggedIn ? 'HomeLoggedIn' : 'Home'}>
        <Stack.Screen name='Home' component={HomeScreen}/>
        <Stack.Screen name='CreateAccount' component={CreateAccountScreen}/>
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name='VerifyEmail' component={VerifyEmailScreen}/>
        <Stack.Screen name='HomeLoggedIn' component={HomeLoggedInScreen} options={{gestureEnabled:false }}/>
        <Stack.Screen name='CreateNote' component={CreateNotesScreen}/>
        <Stack.Screen name='AddToCategory' component={AddNoteToCategoryScreen} options={{gestureEnabled:false }}/>
        <Stack.Screen name='NotesScreen' component={NotesScreen}/>
        <Stack.Screen name='Backup' component={BackupSettingsScreen}/>
        <Stack.Screen name='Settings' component={SettingsScreen}/>
        <Stack.Screen name='BackupFrequency' component={BackupSettingsFrequency}/>
        <Stack.Screen name='ResetPassword' component={ResetPasswordScreen}/>
        <Stack.Screen name='CreatePassword' component={CreateNewPasswordScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


