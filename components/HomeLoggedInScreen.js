import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NotesScreen from './NotesScreen';
import CategoriesScreen from "./CategoriesScreen";
import SettingsScreen from "./SettingsScreen";
import TrashScreen from "./TrashScreen";
import { Icon } from "react-native-elements";

const Tab = createBottomTabNavigator();

export default function HomeLoggedInScreen() {
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