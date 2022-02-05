import { View,
    FlatList,
    Text,
    StyleSheet,
    TextInput,  
    TouchableWithoutFeedback, KeyboardAvoidingView,
    Keyboard} from 'react-native';
import NoteCard from './NoteCard.js';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import {getDetailedDisplay} from './settings.js'
import NoteCardSlim from './NoteCardSlim.js';
import CurrentUser from '../services/CurrentUser.js';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('notes.db');

export default function NotesScreen({ navigation, route }){
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchedText, setSearchedText] = useState('');
    const [notesTabActive, setNotesTabActive] = useState(true);
    const [reRenderOnSelect, setReRenderOnSelect] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [triggerSelectAll, setTriggerSelectAll] = useState(false);
    const [detailedView, setDetailedView] = useState(false);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 60 : 0
    
    const getNotes = () => {
        if (notesTabActive) {
            db.transaction((tx) => {
                route.params === undefined ?
                tx.executeSql(
                'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                'FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName  ' + 
                'AND N.UserEmail = C.UserEmail WHERE Deleted = "false" AND Pinned = "false" AND N.UserEmail = ?', 
                [CurrentUser.prototype.getUser()],
                (t, { rows: { _array } }) => {
                    setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
                    , (t, error) => console.log('Error ', error))
                :
                
                tx.executeSql(
                    'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                    'FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName AND N.UserEmail = C.UserEmail ' + 
                    'WHERE Deleted = "false" AND Pinned = "false" AND N.CategoryName = ? AND N.UserEmail = ?'
                    , [route.params.category, CurrentUser.prototype.getUser()],
                    (t, { rows: { _array } }) => {
                        setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
                        , (t, error) => console.log('Error ', error));
                
            }); 
        } else {
            db.transaction((tx) => {
                route.params === undefined ?
                tx.executeSql(
                'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                'FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName AND N.UserEmail = C.UserEmail ' +  
                'WHERE Deleted = "false" AND Pinned = "true" AND N.UserEmail = ?',
                [CurrentUser.prototype.getUser()],
                (t, { rows: { _array } }) => {
                    setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
                    , (t, error) => console.log('Error ', error))
                :
                
                tx.executeSql(
                    'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                    'FROM Notes N LEFT JOIN Category C on N.CategoryName = C.CategoryName AND N.UserEmail = C.UserEmail' + 
                    'WHERE Deleted = "false" AND Pinned = "true" AND N.CategoryName = ? AND N.UserEmail = ?'
                    , [route.params.category, CurrentUser.prototype.getUser()],
                    (t, { rows: { _array } }) => {
                        setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
                        , (t, error) => console.log('Error ', error));
                
            }); 
        }
    }

    const setDetailedViewCallBack = (bool) => {
        setDetailedView(bool);
    }

    useFocusEffect(
        React.useCallback(() => {
            setSearchedText('');
            // db.transaction((tx) => {
            //     tx.executeSql(
            //     'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
            //     'FROM Notes N LEFT JOIN Category C on N.CategoryName = C.CategoryName WHERE Deleted = "false"', null,
            //     (t, { rows: { _array } }) => {
            //         // setNotes(_array);
            //         // setFilteredNotes(_array)}
            //         setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
            //         , (t, error) => console.log('Error ', error));
            // }); 
            getNotes();
            getDetailedDisplay(setDetailedViewCallBack);
            setSelectMode(false);
            setSelected(false);
        }, [notesTabActive])
      );

      useEffect(() => {
        // db.transaction((tx) => {
        //     tx.executeSql(
        //     'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
        //     'FROM Notes N LEFT JOIN Category C on N.CategoryName = C.CategoryName WHERE Deleted = "false"', null,
        //     (t, { rows: { _array } }) => {
        //         // setNotes(_array);
        //         // setFilteredNotes(_array)}
        //         setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
        //         , (t, error) => console.log('Error ', error));
        // }); 
        getNotes();
      },[searchedText, notesTabActive]);

    const addToSelectedNotes = (noteID) => {
        selectedNotes.push(noteID);
        setReRenderOnSelect(!reRenderOnSelect);
    };

    const removeFromSelectedNotes = (noteID) => {
        const index = selectedNotes.indexOf(noteID);
        if (index > -1) {
            selectedNotes.splice(index, 1);
        }
        setReRenderOnSelect(!reRenderOnSelect);
    }

    const getSelectMode = () => {
        return selectMode;
    }

    const navigateToEditNotes = (action, title, category, label, content, id) => {
        navigation.navigate('CreateNote', {
            action: action,
            title: title,
            category: category,
            label: label,
            content: content,
            id: id,
            fromHome: route.params === undefined ? true : false//If this parameter is true, that means navigation occured from home.
        })
    }
  
    const  highlightsClickEvent = () => {
        setHighlightsTabActive(true);
        setNotesTabActive(false);
        setFavoritesTabActive(false);
    }

    const triggerSelectMode = () => {
        setSelected(false);
        setSelectedNotes([]);
        setSelectMode(!selectMode);
    }

    const selectAll = () => {
        setSelected(true);
        setTriggerSelectAll(!triggerSelectAll);
        setSelectedNotes(filteredNotes.map(note => note.NotesID));
        setReRenderOnSelect(!reRenderOnSelect);
    }

    const getSelected = () => {
        return selected;
    }

    const deleteSelectedNotes = () => {
        if (selectedNotes.length > 0) {
            selectedNotes.map(noteID => {
                db.transaction(tx => {
                    // tx.executeSql('DELETE FROM Notes WHERE NotesID = ?', [noteID],
                    // null, (t, error) => console.log(error));
                    tx.executeSql('UPDATE Notes SET Deleted = "true", CategoryName = "None", Pinned = "false" WHERE NotesID = ?', [noteID],
                    null, (t, error) => console.log(error));
                    // tx.executeSql(
                    // 'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                    // 'FROM Notes N LEFT JOIN Category C on N.CategoryName = C.CategoryName WHERE Deleted = "false"', null,
                    // (t, { rows: { _array } }) => setNotesCallBack(_array), (t, error) => console.log('Error ', error));
                });
                getNotes();
            });
        }
        setSelectMode(!selectMode);
    }

    const pinNote = () => {
        if (selectedNotes.length > 0) {
            selectedNotes.map(noteID => {
                db.transaction(tx => {
                    tx.executeSql('UPDATE Notes SET Pinned = "true" WHERE NotesID = ?', [noteID],
                    null, (t, error) => console.log(error));
                });
                getNotes();
            })
        }
        setSelectMode(!selectMode);
    }

    const unPinNote = () => {
        if (selectedNotes.length > 0) {
            selectedNotes.map(noteID => {
                db.transaction(tx => {
                    tx.executeSql('UPDATE Notes SET Pinned = "false" WHERE NotesID = ?', [noteID],
                    null, (t, error) => console.log(error));
                });
                getNotes();
            })
        }
        setSelectMode(!selectMode);
    }


    const addToCategory = () => {
        if (selectedNotes.length <= 0) {
            alert("Please select at least one note.")
        } else {
            navigation.navigate('AddToCategory', {
                selectedNotes: selectedNotes         
            })
        }
    }

    const renderItem = ({ item, index }) => (
       detailedView ? <NoteCard 
        id={item.NotesID}
        index={index} 
        title={item.Title} 
        content={item.Content} 
        category={item.CategoryName}
        label={item.Label}
        date={item.DateAdded}
        getSelectMode={getSelectMode}
        setSelectMode={triggerSelectMode}
        redColor={item.RedColor}
        greenColor={item.GreenColor}
        blueColor={item.BlueColor}
        addToSelectedNotes = {addToSelectedNotes}
        removeFromSelectedNotes={removeFromSelectedNotes}
        getSelected={getSelected}
        triggerSelectAll={triggerSelectAll}
        navigate={navigateToEditNotes}/> :

        <NoteCardSlim
        id={item.NotesID}
        title={item.Title}
        content={item.Content}
        category={item.CategoryName}
        label={item.Label}
        date={item.DateAdded}
        getSelectMode={getSelectMode}
        setSelectMode={triggerSelectMode}
        redColor={item.RedColor}
        greenColor={item.GreenColor}
        blueColor={item.BlueColor}
        addToSelectedNotes={addToSelectedNotes}
        removeFromSelectedNotes={removeFromSelectedNotes}
        getSelected={getSelected}
        triggerSelectAll={triggerSelectAll}
        navigate={navigateToEditNotes}/>
    );

    return(
        <KeyboardAvoidingView style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}>
            <View style={styles.topContainer}>
            <View style={styles.header}>
                {/* <View style={styles.headerIcon}>
                <Image 
                source={require('../assets/smalllogo.png')}
                style={styles.homeImage}/>
                </View> */}
                <View style={styles.headerTitle}>
                    {route.params === undefined ? 
                    <View style={[styles.title,{
                        width: 
                        selectMode && selectedNotes.length > 0 ? '45%' : 
                        selectMode && selectedNotes.length <= 0 ? '75%' : '85%'
                      }]
                        }>
                        <Text style={styles.titleText}>Notes</Text>
                    </View> : 
                    <View style={[styles.title,{
                        width: 
                        selectMode && selectedNotes.length > 0 ? '45%' : 
                        selectMode && selectedNotes.length <= 0 ? '75%' : '85%'
                        }]}>
                        <TouchableOpacity
                        style={{marginRight: 20}}
                        onPress={() => navigation.navigate('Categories')}>
                            <Icon
                            name='arrow-left'
                            type='material-community'
                            />
                        </TouchableOpacity>
                        <Text style={[styles.titleText, {fontSize: 18}]}>{route.params.category}</Text>
                   </View>
                    }
                    {selectMode && selectedNotes.length > 0 &&
                    (!notesTabActive ?
                    <TouchableOpacity style={styles.headerIcons}
                    onPress={() => unPinNote()}>
                        <Icon
                        name='pin-off-outline'
                        type='material-community'
                        size={22}/>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.headerIcons}
                    onPress={() => pinNote()}>
                        <Icon
                        name='pin-outline'
                        type='material-community'
                        size={22}/>
                    </TouchableOpacity>)
                    }
                    {selectMode && selectedNotes.length > 0 && <TouchableOpacity style={styles.headerIcons}
                    onPress={() => addToCategory()}>
                        <Icon
                        name='addfolder'
                        type='antdesign'
                        size={20}/>
                    </TouchableOpacity>}
                    {selectMode && selectedNotes.length > 0 && <TouchableOpacity style={styles.headerIcons}
                    onPress={() => deleteSelectedNotes()}>
                        <Icon
                        name='delete-outline'
                        type='material-community'
                        size={22}/>
                    </TouchableOpacity>}
                    {selectMode && <TouchableOpacity style={styles.headerIcons}
                    onPress={() => selectAll()}>
                        <Icon
                        name='select-all'
                        type='material-community'
                        size={22}
                        color='#FFC11E'/>
                        {/* <Text style={{color: '#FFC11E'}}>Select All</Text> */}
                    </TouchableOpacity>}
                    <TouchableOpacity style={[styles.headerIcons, {width: '15%'}]}
                    onPress={() => triggerSelectMode()}>
                        {/* <Icon
                        name='check-circle'
                        type='material-community'
                        size={22}/> */}
                        <Text style={{color: '#FFC11E'}}>{!selectMode ? "Select" : "Cancel"}</Text>
                    </TouchableOpacity>
                </View>                
            </View>
            <View style={styles.searhBar}>
                <TextInput
                style={{color: '#939598', fontWeight: '400'}}
                placeholder='Search Notes'
                onChangeText={setSearchedText}
                value={searchedText}/>
            </View>
                {/* Separator */}
            <View style={{borderBottomWidth: 0.3, borderBottomColor: '#BCBEC0', marginBottom: 8}}/>

            {/* <View style={styles.navTab}>
                <View style={{paddingTop: 0, paddingBottom: 0,}}>
                    <View style={styles.backgroundView}>
                        <TouchableOpacity style={[styles.selectableTabs, {backgroundColor: notesTabActive ? '#000' : '#F1F2F2'}]}
                        onPress={() => notesClickEvent()}
                        activeOpacity={1}>
                            <Text style={[styles.selectableTabsText, {color: notesTabActive ? '#FFF' : '#939598'}]}>Notes</Text>
                        </TouchableOpacity>        
                        <TouchableOpacity style={[styles.selectableTabs, {backgroundColor: highlightsTabActive ? '#000' : '#F1F2F2'}]}
                        onPress={() => highlightsClickEvent()}
                        activeOpacity={1}>
                            <Text style={[styles.selectableTabsText, {color: highlightsTabActive ? '#FFF' : '#939598'}]}>Highlights</Text>
                        </TouchableOpacity>  
                        <TouchableOpacity style={[styles.selectableTabs, {backgroundColor: favoritesTabActive ? '#000' : '#F1F2F2'}]}
                        onPress={() => favoritesClickEvent()}
                        activeOpacity={1}>
                            <Text style={[styles.selectableTabsText, {color: favoritesTabActive ? '#FFF' : '#939598'}]}>Favorites</Text>
                        </TouchableOpacity>       
                    </View>
                </View>
                
            </View> */}
    
            <View style={styles.filter}>
                <TouchableOpacity style={styles.activeTabTitle}
                onPress={() => setNotesTabActive(true)}>
                    <Icon
                    name='note'
                    type='material-community'
                    style={notesTabActive && {borderBottomWidth: 1, borderBottomColor: '#939598'}}
                    />
                    {/* <Text style={{fontSize:15, fontWeight: '500'}}>
                       Notes
                    </Text> */}
                </TouchableOpacity>
                <TouchableOpacity style={styles.activeTabTitle}
                onPress={() => setNotesTabActive(false)}>
                <Icon
                    name='pin'
                    type='material-community'
                    style={!notesTabActive && {borderBottomWidth: 1, borderBottomColor: '#939598'}}
                    />
                    {/* <Text style={{fontSize:15, fontWeight: '500'}}>
                        Pinned
                    </Text> */}
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.filterButton}>
                    <Text style={{color: '#939598', fontSize: 11}}>
                        All Notes
                    </Text>
                    <Icon
                    name='select-arrows'
                    type='entypo'
                    size={15}/>
                </TouchableOpacity> */}
            </View>
            </View>
            <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}>
            <View style={styles.cardContainer}>
                {filteredNotes.length > 0 ? <FlatList
                data={filteredNotes}
                renderItem={renderItem}
                keyExtractor={(item, index) => index}
                style={styles.flatList}/> : <Text style={{color:'#6D6E71', paddingLeft: 15}}>
                    {notesTabActive ? 'No notes to show' : 'Nothing pinned yet'}</Text>}
                <TouchableOpacity style={styles.addNoteButton}
                onPress={() => navigation.navigate('CreateNote', {
                    action: 'Create',
                    title: 'Untitled',
                    category: route.params === undefined ? 'None' : route.params.category,
                    label: 'Label',
                    content: '',
                    fromHome: route.params === undefined ? true : false//If this parameter is true, that means navigation occured from home.
                })}>
                <Icon
                name='plus'
                type='material-community'
                size={25}
                color='#FFF'/>
            </TouchableOpacity>
            </View>
            </TouchableWithoutFeedback>
            
        </KeyboardAvoidingView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        paddingBottom: 15, 
        paddingTop: 60, 
        backgroundColor:'#fff',
    },

    topContainer: {
        paddingLeft: 15,
        paddingRight: 15
    },
    
    cardContainer: {
        height: '78%'
    },

    flatList: {
        // borderWidth: 1,
        // flex: 0.8,
        paddingLeft: 15,
        paddingRight: 15
    },

    header: {
        // borderWidth:1,
        // paddingLeft: 15,
        // paddingRight: 15,
        // borderBottomWidth: 0.2,
        // borderBottomColor: '#BCBEC0',
        // flex: 0.15,
        flexDirection: 'row',
        paddingBottom: 30
    },

    navTab: {
        // borderWidth: 1,
        // flex: 0.13,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    backgroundView: {
        // borderWidth: 1,
        // borderColor: "blue",
        flexDirection: 'row',
        padding: 6,
        justifyContent: 'space-between',
        borderRadius: 20,
        backgroundColor: '#F1F2F2',
        width: '50%',
        height: '83%'
    },

    selectableTabs: {
        // borderWidth: 1,
        // borderColor: "yellow",
        height: '100%',
        width: '50%',
        borderRadius: 18,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },

    selectableTabsText: {
        color: '#939598',
        fontWeight: '500'
    },

    filter: {
        // borderWidth: 1,
        // borderColor: 'red',
        // flex: 0.05,
        flexDirection: 'row',
        paddingBottom: 15
    },

    filterButton: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'flex-end',
        width: '50%',
        // borderWidth: 1,
    },

    activeTabTitle: {
        // width: '50%',
        // borderBottomWidth: 1,
        justifyContent: 'center',
        paddingLeft: 5,
        paddingRight: 5,
        marginRight: 10,
    },

    homeImage: {
        width: 35,
        height: 35,
    },

    headerIcon: {
        // borderWidth: 1,
        height: '100%',
        width: '117%',
        justifyContent: 'center',
        // alignItems: 'center'
    },

    headerTitle: {
        flexDirection: 'row',
        // borderWidth: 1,
        // borderColor: 'red',
        // width: '83%',
    },

    titleText: {
        fontSize: 21,
        fontFamily: 'LatoBold',
    },

    title: {
        justifyContent: 'flex-start',
        // borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerIcons: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        // borderWidth: 1
    },

    addNoteButton: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: '#000',
        position: 'absolute',
        // top: '85%',
        bottom: '10%',
        left: '80%'
    },

    searhBar: {
        // borderWidth: 1,
        marginBottom: 5,
        backgroundColor: '#F1F2F2',
        borderRadius: 5,
        height: 30,
        justifyContent: 'center',
        paddingLeft: 10
    }
});
    