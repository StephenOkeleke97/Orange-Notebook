import CreateAccountScreen from './components/CreateAccountScreen';
import CreateNotesScreen from './components/CreateNotesScreen';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import VerifyEmailScreen from './components/VerifyEmailScreen';
import HomeLoggedInScreen from './components/HomeLoggedInScreen';
import AddNoteToCategoryScreen from './components/AddNoteToCategoryScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {  DefaultTheme } from '@react-navigation/native';
import { useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import NotesScreen from './components/NotesScreen';

const db = SQLite.openDatabase('notes.db');

db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
console.log('Foreign keys turned on'));

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff'
  },
};
export default function App() {

  useEffect(() => {
    db.transaction((tx) => {
      // tx.executeSql('DROP TABLE IF EXISTS Category' );

      // tx.executeSql( 'DROP TABLE IF EXISTS Notes');

      // tx.executeSql( 'DROP TABLE IF EXISTS Settings');


      tx.executeSql( 'CREATE TABLE IF NOT EXISTS Settings(SettingName TEXT UNIQUE, SettingEnabled TEXT, ' + 
      'PRIMARY KEY(SettingName))', [], null, (t, error) => console.log(error));

      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Category(CategoryName TEXT UNIQUE ' +
           'NOT NULL, RedColor INT, GreenColor INT, BlueColor INT, PRIMARY KEY(CategoryName))'
      , [], null, (t,error) => console.log(error));

      

      tx.executeSql('CREATE TABLE IF NOT EXISTS Notes(NotesID INTEGER UNIQUE NOT NULL,' +  
          'Title TEXT, CategoryName TEXT, Label TEXT, Content TEXT, DateAdded DATE, Deleted TEXT, Pinned TEXT, Synced TEXT,' +
           'PRIMARY KEY (NotesID) FOREIGN KEY (CategoryName) REFERENCES Category ON DELETE SET NULL ON UPDATE CASCADE)'
           , [], null, (t,error) => console.log(error));

      tx.executeSql('INSERT OR IGNORE INTO Category VALUES ("None", 209, 211, 212)'
      , [], null, (t,error) => console.log(error));

      tx.executeSql('INSERT OR IGNORE INTO Settings VALUES ("DetailedView", "1.0")'
      , [], null, (t,error) => console.log(error));

      tx.executeSql('INSERT OR IGNORE INTO Settings VALUES ("BackupEnabled", "1.0")'
      , [], null, (t,error) => console.log(error));
      
    });
  }, []);
    
  // options={{gestureEnabled:false }}
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='Home'>
        <Stack.Screen name='Home' component={HomeScreen}/>
        <Stack.Screen name='CreateAccount' component={CreateAccountScreen}/>
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name='VerifyEmail' component={VerifyEmailScreen}/>
        <Stack.Screen name='HomeLoggedIn' component={HomeLoggedInScreen}/>
        <Stack.Screen name='CreateNote' component={CreateNotesScreen}/>
        <Stack.Screen name='AddToCategory' component={AddNoteToCategoryScreen} options={{gestureEnabled:false }}/>
        <Stack.Screen name='NotesScreen' component={NotesScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


