import { View,
    FlatList,
    Text,
    StyleSheet,
    TextInput,  
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
    KeyboardAvoidingView,
    } from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react';
import { Icon } from 'react-native-elements';
import Category from './Category.js';
import { useFocusEffect } from '@react-navigation/native';
import CreateCategory from './CreateCategory.js';
import * as SQLite from 'expo-sqlite';
import CurrentUser from '../services/CurrentUser.js';

const db = SQLite.openDatabase('notes.db');

export default function CategoriesScreen( {navigation} ){

    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchedText, setSearchedText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [createMode, setCreateMode] = useState(true);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [reRenderOnSelect, setReRenderOnSelect] = useState(false);
    const [selected, setSelected] = useState(false);
    const [triggerSelectAll, setTriggerSelectAll] = useState(false);
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 100 : 0;

    const addToSelectedCategories = (categoryName) => {
        selectedCategories.push(categoryName);
        setReRenderOnSelect(!reRenderOnSelect);
    };

    const removeFromSelectedCategories = (categoryName) => {
        const index = selectedCategories.indexOf(categoryName);
        if (index > -1) {
            selectedCategories.splice(index, 1);
        }
        setReRenderOnSelect(!reRenderOnSelect);
    }

    const deleteSelectedCategories = () => {
        if (selectedCategories.length > 0) {
            selectedCategories.map(categoryName => {
                db.transaction(tx => {
                    tx.executeSql('UPDATE Notes SET CategoryName = "None", Deleted = "true" WHERE CategoryName = ? ' + 
                    'AND UserEmail = ?', [categoryName, CurrentUser.prototype.getUser()],
                    null, (t, error) => console.log(error));
                    tx.executeSql('DELETE FROM Category WHERE CategoryName = ? AND UserEmail = ?'
                    , [categoryName, CurrentUser.prototype.getUser()],
                    null, (t, error) => console.log(error));
                    tx.executeSql(
                        'SELECT COUNT(NotesID) AS NumOfNotes, C.CategoryName, RedColor, GreenColor, BlueColor ' +
                        'FROM Category C LEFT JOIN Notes N on C.CategoryName = N.CategoryName ' +
                        'AND C.UserEmail = N.UserEmail WHERE C.UserEmail = ? ' + 
                        'GROUP BY C.CategoryName HAVING C.CategoryName != "None"'
                        , [CurrentUser.prototype.getUser()],
                        (t, { rows: { _array } }) => {
                            console.log(_array);
                            setFilteredCategories(_array.filter((categories) => categories.CategoryName.toLowerCase().includes(searchedText.toLowerCase())))}
                            , (t, error) => console.log('Error ', error));
                });
     
            })
        }
        setSelectMode(!selectMode);
        setSelectedCategories([]);
    }

    const handleEdit = () => {
        if (selectedCategories.length !== 1) {
            alert("Please select exactly one category");
        } else {
            setCreateMode(false);
            setModalVisible(!modalVisible);
        }
    }
    
    useFocusEffect(
        React.useCallback(() => {
            setSearchedText('');
            db.transaction((tx) => {
                tx.executeSql(
                'SELECT COUNT(NotesID) AS NumOfNotes, C.CategoryName, RedColor, GreenColor, BlueColor ' +
                'FROM Category C LEFT JOIN Notes N on C.CategoryName = N.CategoryName ' +
                'AND C.UserEmail = N.UserEmail WHERE C.UserEmail = ? ' +
                'GROUP BY C.CategoryName HAVING C.CategoryName != "None"'
                , [CurrentUser.prototype.getUser()],
                (t, { rows: { _array } }) => {
                    // setNotes(_array);
                    // setFilteredNotes(_array)}
                    setFilteredCategories(_array.filter((categories) => categories.CategoryName.toLowerCase().includes(searchedText.toLowerCase())))}
                    , (t, error) => console.log('Error ', error));
            }); 
            setSelected(false);
            setSelectMode(false);
            setSelectedCategories([]);
        }, [])
      );

      useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT COUNT(NotesID) AS NumOfNotes, C.CategoryName, RedColor, GreenColor, BlueColor ' +
                'FROM Category C LEFT JOIN Notes N on C.CategoryName = N.CategoryName ' +
                'AND C.UserEmail = N.UserEmail WHERE C.UserEmail = ? ' +
                'GROUP BY C.CategoryName HAVING C.CategoryName != "None"'
            , [CurrentUser.prototype.getUser()],
            (t, { rows: { _array } }) => {
                // setNotes(_array);
                // setFilteredNotes(_array)}
                setFilteredCategories(_array.filter((categories) => categories.CategoryName.toLowerCase().includes(searchedText.toLowerCase())))}
                , (t, error) => console.log('Error ', error));
            setSelectMode(false);
        }); 
      },[searchedText, modalVisible]);

    const setModal = (modalVisible) => {
        setModalVisible(modalVisible);
    }

    const clearSelection = () => {
        setSelectedCategories([]);
    }

    const getSelectMode = () => {
        return selectMode;
    }

    const triggerSelectMode = () => {
        setSelectedCategories([]);
        setSelected(false);
        setSelectMode(!selectMode);
    }

    const selectAll = () => {
        setSelected(true);
        setTriggerSelectAll(!triggerSelectAll);
        setSelectedCategories(filteredCategories.map(category => category.CategoryName));
        setReRenderOnSelect(!reRenderOnSelect);
    }

    const getSelected = () => {
        return selected;
    }

    const renderItem = ({ item }) => (
        <Category 
        name={item.CategoryName} 
        noteCount={item.NumOfNotes}
        redColor={item.RedColor}
        greenColor={item.GreenColor}
        blueColor={item.BlueColor}
        getSelectMode={getSelectMode}
        setSelectMode={triggerSelectMode}
        addToSelectedCategories={addToSelectedCategories}
        removeFromSelectedCategories={removeFromSelectedCategories}
        getSelected={getSelected}
        triggerSelectAll={triggerSelectAll}
        navigation={navigation}
        />
    );

    return (
        <KeyboardAvoidingView style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}>
            <TouchableWithoutFeedback
            onPress={() => {Keyboard.dismiss()}}>
            <View >
                <View style={styles.topSection}>
                    <View style={styles.mainContainer}>
                        <View style={styles.header}>
                            {/* <TouchableOpacity style={styles.headerIcons}/>             */}
                            <Text style={styles.titleText}>Categories</Text>
                            <View style={{width: '60%',flexDirection: 'row', justifyContent:'flex-end'}}>
                            {selectMode  && selectedCategories.length > 0 && <TouchableOpacity style={styles.headerIcons}
                            onPress={() => handleEdit()}>
                            <Icon
                            name='edit'
                            type='feather'
                            size={20}/>
                            </TouchableOpacity>}
                            {selectMode && selectedCategories.length > 0 && <TouchableOpacity style={styles.headerIcons}
                            onPress={() => deleteSelectedCategories()}>
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
                            <TouchableOpacity style={[styles.headerIcons, {width: '22%'}]}
                            onPress={() => triggerSelectMode()}>
                            <Text style={{color: '#FFC11E'}}>{!selectMode ? "Select" : "Cancel"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerIcons}
                            onPress={() => {setCreateMode(true); setModalVisible(!modalVisible)}}>
                            <Icon
                            name='pluscircleo'
                            type='antdesign'
                            size={21}/>
                            </TouchableOpacity>
                            </View>
                            
                        </View> 
                        <View style={styles.searhBar}>
                                <TextInput
                                style={{color: '#939598', fontWeight: '400'}}
                                placeholder='Search Categories'
                                onChangeText={setSearchedText}
                                value={searchedText}/>
                        </View>  
                    </View>
                        
                    <View style={styles.filter}>
                        <View style={styles.activeTabTitle}>
                            <Text style={{fontSize:15, fontWeight: '500'}}>List Categories</Text>
                        </View>
                        {/* <TouchableOpacity style={styles.filterButton}>
                            <Text style={{color: '#939598', fontSize: 11}}>New</Text>
                            <Icon
                            name='select-arrows'
                            type='entypo'
                            size={15}/>
                        </TouchableOpacity> */}
                    </View>  
                </View>
                

                    {filteredCategories.length > 0 ? <View style={styles.categoryFlatListContainer}>
                        <FlatList
                        data={filteredCategories}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                        numColumns={2}
                        style={styles.categoryFlatList}
                        />
                    
                    </View> :
                    <Text style={styles.categoryFlatList}>No categories to show</Text>
                    }
                    <CreateCategory modalVisible={modalVisible} setModalVisible={setModal} 
                    filteredCategories={filteredCategories} createMode={createMode} oldCategory={selectedCategories}
                    clearSelection={clearSelection}/>    
            </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        // padding: 15, 
        paddingTop: 60, 
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

    topSection: {
        paddingLeft: 15,
        paddingRight: 15,
    },

    mainContainer: {
        // flex: 0.2,
        // borderWidth: 1,
        borderBottomWidth: 0.3,
        borderBottomColor: '#BCBEC0',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderWidth: 1,
        paddingBottom: 30
        // borderColor: 'red',
        // flex: 1
    },

    headerIcons: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        // borderWidth: 1,
        marginLeft: 8,
    },

    filter: {
        // borderWidth: 1,
        // borderColor: 'red',
        // flex: 0.05,
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

    categoryFlatListContainer: {
        height: '78%'
    },

    categoryFlatList: {
        paddingLeft: 15,
        paddingRight: 15,
    }
});