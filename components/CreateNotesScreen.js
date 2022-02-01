import { View,
    FlatList,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TextInput,
    Keyboard,
    Dimensions  } from 'react-native';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { HideKeyboard } from './HideKeyboard.js';
import CurrentUser from '../services/CurrentUser.js';
import * as SQLite from 'expo-sqlite';

const getSectionHeight = (percent) => {
    return Dimensions.get('window').height * percent;
};

const db = SQLite.openDatabase('notes.db');

export default function CreateNotesScreen({ navigation, route}){
    const d = new Date();
    const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    const [titleText, setTitleText] = useState(route.params.title)
    const [labelText, setLabelText] = useState(route.params.label)
    const [contentText, setContentText] = useState(route.params.content)
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const createNote = () => {
        if (route.params.action === 'Edit') {
            db.transaction((tx) => {
                tx.executeSql(
                'UPDATE Notes SET Title = ?, Label = ?, Content = ?, DateAdded = ? WHERE NotesID = ?'
                , [titleText, labelText, contentText, date, route.params.id],
                null, (t, error) => console.log('Error ', error));
            });
        } else {
            db.transaction((tx) => {
                tx.executeSql(
                'INSERT INTO Notes(Title, UserEmail, CategoryName, Label, Content, DateAdded, Deleted, Pinned, Synced) VALUES (' +
                    '?, ?, ?, ?, ?, ?, "false", "false", "false")' 
                , [titleText, CurrentUser.prototype.getUser(), route.params.category, labelText, contentText, date],
                null, (t, error) => console.log('Error ', error));
            });
        }     
        // route.params.isHome === undefined  ?  navigation.navigate('HomeLoggedIn') :
        // navigation.navigate('NotesScreen', {
        //     category: route.params.category
        //  });
        goBack();
    }

    const goBack = () => {
        route.params.fromHome ? navigation.navigate('HomeLoggedIn') :
        navigation.navigate('NotesScreen', {
            category: route.params.category
         });
    }

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow",
        (e) => {
            setKeyboardHeight(e.endCoordinates.height)
        });

        const hideSubscription = Keyboard.addListener("keyboardDidHide", 
        () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <HideKeyboard>
        <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={[styles.headerIcons, {alignItems: 'flex-start'}]}
                    onPress={() => goBack()}>
                        <Icon
                        name='closecircleo'
                        type='antdesign'
                        size={23}/>
                    </TouchableOpacity>        
                    <Text style={styles.headerText}>{`${route.params.action} Note`}</Text>
                    <TouchableOpacity style={styles.headerIcons}
                    onPress={() => createNote()}
                    >
                        <Icon
                        name='checkcircleo'
                        type='antdesign'
                        size={23}/>
                    </TouchableOpacity>
                </View> 
                <View style={styles.description}>
                    <View style={styles.title}>
                        <TextInput style={styles.titleText}
                        placeholder='Untitled'
                        multiline={true}
                        value={titleText}
                        onChangeText={setTitleText} />
                    </View>
                    <View style={styles.details}>
                        <View style={styles.categoryPlaceHolder}>
                            <Text style={styles.labelText}>{route.params.category}</Text>
                        </View>
                        <View style={styles.label}>
                            <TextInput 
                            style={styles.labelText}
                            placeholder='Label'
                            value={labelText}
                            onChangeText={setLabelText}/>      
                        </View>
                    </View>
                </View>  
                <View style={[styles.editor, 
                    {height: getSectionHeight(0.72) - keyboardHeight}
                    ]}>
                    <TextInput style={{width: '100%', height:'100%', padding: 5, fontSize:15}}
                    multiline={true}
                    autoFocus={true}
                    value={contentText}
                    onChangeText={setContentText}
                    />
                </View>                       
        </View>
        </HideKeyboard>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 15, 
        paddingTop: 30, 
        backgroundColor:'#fff',
    },

    homeImage: {
        width: 35,
        height: 35,
    },

    headerText: {
        fontSize: 20,
        fontFamily: 'LatoBold',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderWidth: 1,
        borderBottomWidth: 0.3,
        borderBottomColor: '#BCBEC0',
        // borderColor: 'red',
        // flex: 0.13,
        height: getSectionHeight(0.1),
    },

    headerIcons: {
        width: '20%',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },

    title: {
        // borderWidth:1,
        height: 50,
        justifyContent: 'flex-end'
    },

    titleText: {
        fontSize: 17,
        fontFamily: 'LatoBold',
    },

    description: {
        // borderWidth: 1,
        height: getSectionHeight(0.12)
    },

    details: {
        borderBottomWidth: 0.3,
        borderBottomColor: '#BCBEC0',
        paddingBottom: 10,
        flexDirection: 'row',
        height: 50,
        alignItems: 'center'
    },

    label: {
        // borderWidth: 1,
        width: '85%',
        paddingLeft: 10

    },

    categoryPlaceHolder: {
        borderRightWidth: 0.2,
        borderRightColor: '#939598',
        width: '15%',
    },

    labelText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#58595B',
    },

    editor: {
        // borderWidth: 1,
        // borderColor: 'red',
        paddingTop: 10
    }
});