import { View,
    FlatList,
    Text,
    Image,
    StyleSheet,
    TextInput  } from 'react-native';
import React from 'react';
import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import NoteCardSlim from './NoteCardSlim.js';
import CurrentUser from '../services/CurrentUser.js';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('notes.db');

export default function TrashScreen() {
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchedText, setSearchedText] = useState('');
    const [reRenderOnSelect, setReRenderOnSelect] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState(false);
    const [triggerSelectAll, setTriggerSelectAll] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setSearchedText('');
            db.transaction((tx) => {
                tx.executeSql(
                'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                'FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName ' + 
                'AND N.UserEmail = C.UserEmail WHERE Deleted = "true" AND N.UserEmail = ? ORDER BY TimeStamp DESC' , 
                [CurrentUser.prototype.getUser()],
                (t, { rows: { _array } }) => {
                    // setNotes(_array);
                    // setFilteredNotes(_array)}
                    setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
                    , (t, error) => console.log('Error ', error));
            }); 
            setSelectMode(false);
            setSelected(false);
        }, [])
      );

      useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
            'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
            'FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName AND N.UserEmail = C.UserEmail ' + 
            'WHERE Deleted = "true" AND N.UserEmail = ? ORDER BY TimeStamp DESC', 
            [CurrentUser.prototype.getUser()],
            (t, { rows: { _array } }) => {
                // setNotes(_array);
                // setFilteredNotes(_array)}
                setFilteredNotes(_array.filter((note) => note.Content.toLowerCase().includes(searchedText.toLowerCase())))}
                , (t, error) => console.log('Error ', error));
        }); 
      },[searchedText]);

    const getSelectMode = () => {
        return selectMode;
    }
    const triggerSelectMode = () => {
        setSelectedNotes([]);
        setSelected(false);
        setSelectMode(!selectMode);
    }


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

    const deleteSelectedNotes = () => {
        if (selectedNotes.length > 0) {
            selectedNotes.map(noteID => {
                db.transaction(tx => {
                    tx.executeSql('DELETE FROM Notes WHERE NotesID = ?', [noteID],
                    null, (t, error) => console.log(error));
                    tx.executeSql(
                    'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                    'FROM Notes N LEFT JOIN Category C on N.CategoryName = C.CategoryName' + 
                    ' AND N.UserEmail = C.UserEmail WHERE Deleted = "true" AND N.UserEmail = ? ORDER BY TimeStamp DESC', 
                    [CurrentUser.prototype.getUser()],
                    (t, { rows: { _array } }) => setNotesCallBack(_array), (t, error) => console.log('Error ', error));
                })
            })
        }
        setSelectMode(!selectMode)
    }

    const restoreSelectedNotes = () => {
        if (selectedNotes.length > 0) {
            selectedNotes.map(noteID => {
                db.transaction(tx => {
                    tx.executeSql('UPDATE Notes SET Deleted = "false" WHERE NotesID = ?', [noteID],
                    null, (t, error) => console.log(error));
                    tx.executeSql(
                    'SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor ' +
                    'FROM Notes N LEFT JOIN Category C on N.CategoryName = C.CategoryName ' + 
                    'AND N.UserEmail = C.UserEmail WHERE Deleted = "true" AND N.UserEmail = ? ORDER BY TimeStamp DESC', 
                    [CurrentUser.prototype.getUser()],
                    (t, { rows: { _array } }) => setNotesCallBack(_array), (t, error) => console.log('Error ', error));
                })
            })
        }
        setSelectMode(!selectMode)
    }

    const setNotesCallBack = (notes) => {
        setFilteredNotes(notes)
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

    const renderItem = ({ item }) => (
        <NoteCardSlim
        id={item.NotesID}
        content={item.Content}
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
        />
        // <NoteCardSlim 
        // content={item.content} 
        // date={item.date}
        // getSelectMode={getSelectMode}
        // setSelectMode={triggerSelectMode}
        // />
    );
    return(
        <View style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.header}>
                        {/* <TouchableOpacity style={styles.headerIcons}>
                            
                        </TouchableOpacity>             */}
                        <Text style={styles.titleText}>Recently Deleted</Text>
                        <View style={styles.headerIcons}>
                            {/* <TouchableOpacity style={styles.headerIconComponents}>
                                <Icon
                                name='search-circle'
                                type='ionicon'
                                size={27}/>
                            </TouchableOpacity> */}
                            {selectMode &&  selectedNotes.length > 0 && <TouchableOpacity style={styles.headerIconComponents}
                            onPress={() => restoreSelectedNotes()}>
                                <Icon
                                name='restore'
                                type='material-community'
                                size={21}/>
                            </TouchableOpacity>}
                            {selectMode && selectedNotes.length > 0 && <TouchableOpacity style={styles.headerIconComponents}
                            onPress={() => deleteSelectedNotes()}>
                                <Icon
                                name='delete-outline'
                                type='material-community'
                                size={21}/>
                            </TouchableOpacity>}
                            {selectMode && <TouchableOpacity style={styles.headerIconComponents}
                            onPress={() => selectAll()}>
                                <Icon
                                name='select-all'
                                type='material-community'
                                size={22}
                                color='#FFC11E'/>
                                {/* <Text style={{color: '#FFC11E'}}>Select All</Text> */}
                            </TouchableOpacity>}
                            <TouchableOpacity style={styles.headerIconComponents}
                            onPress={() => triggerSelectMode()}>
                                {/* <Icon
                                name='check-circle'
                                type='material-community'
                                size={23}
                                /> */}
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
            </View>
                  
                <View style={styles.filter}>
                    <View style={styles.activeTabTitle}>
                        <Text style={{fontSize:15, fontWeight: '500'}}>Deleted Notes</Text>
                    </View>
                </View>   
                <View style={styles.deletedNotes}>
                    {filteredNotes.length > 0 ? <FlatList
                        data={filteredNotes}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                        /> : <Text style={{color:'#939598'}}>No notes deleted</Text>}
                </View>                 
        </View>
    )
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

    titleText: {
        fontSize: 20,
        fontFamily: 'LatoBold',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderWidth: 1,
        // borderBottomWidth: 0.3,
        // borderBottomColor: '#BCBEC0',
        borderColor: 'red',
        flex: 1
    },

    mainContainer: {
        flex: 0.2,
        paddingBottom: 2,
        borderBottomWidth: 0.3,
        borderBottomColor: '#BCBEC0',
    },

    headerIcons: {
        // width: '40%',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1,
    },

    headerIconComponents: {
        marginLeft: 10
    },

    filter: {
        // borderWidth: 1,
        // borderColor: 'red',
        flex: 0.05,
        flexDirection: 'row',
        paddingBottom: 15,
        paddingTop: 15,
    },

    filterButton: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'flex-end',
        width: '50%',
        // borderWidth: 1,
    },

    activeTabTitle: {
        width: '50%',
        // borderWidth: 1,
        justifyContent: 'center'
    },

    searhBar: {
        // borderWidth: 1,
        marginBottom: 5,
        backgroundColor: '#F1F2F2',
        borderRadius: 5,
        height: 30,
        justifyContent: 'center',
        paddingLeft: 10
    },

    deletedNotes: {
        // borderWidth: 1,
        flex: 0.75
    }
});