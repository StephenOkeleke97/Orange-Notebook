import { View,
        StyleSheet,
        TouchableOpacity,
        Text,
        FlatList } from "react-native";
import CreateCategory from "./CreateCategory";
import React from "react";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from 'expo-sqlite';
import CurrentUser from "../services/CurrentUser";

const db = SQLite.openDatabase('notes.db');

export default function AddNoteToCategoryScreen( {route, navigation} ) {
    const [modalVisible, setModalVisible] = useState(false);
    const [categories, setCategories] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            db.transaction((tx) => {
                tx.executeSql(
                'SELECT CategoryName FROM Category C WHERE UserEmail = ?'
                , [CurrentUser.prototype.getUser()],
                (t, { rows: { _array } }) => {
                    // setNotes(_array);
                    // setFilteredNotes(_array)}
                    _array.forEach((item, index) => {
                        if (item.CategoryName === "None") {
                            _array.splice(index, 1);
                            _array.unshift(item);
                        }
                    })
                    setCategories(_array)}
                    , (t, error) => console.log('Error ', error));
            }); 
        }, [])
    );

    const setModal = (modalVisible) => {
        setModalVisible(modalVisible);
    };

    const CategoryCard = ( {categoryName} ) => {
        const add =  () => {        
            route.params.selectedNotes.map((note, index, array) => {
                db.transaction((tx) => {
                    tx.executeSql(
                    'UPDATE Notes SET CategoryName = ? WHERE NotesID = ? AND UserEmail = ?'
                    , [categoryName, note, CurrentUser.prototype.getUser()],
                    null
                    , (t, error) => console.log('Error ', error));
                    if (index === array.length - 1)
                    navigation.navigate('HomeLoggedIn');
                });   
            });
        };
    
        return (
            <TouchableOpacity style={styles.categoriesCard}
            onPress={() => add()}>
                <Text style={{fontSize: 15, fontWeight: '400', color: '#000'}}>{categoryName}</Text>
            </TouchableOpacity>
        );
    };

    const renderItem = ( {item} )  => (
        <CategoryCard
        categoryName={item.CategoryName}/>
    );

    return(
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.button}>
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Select a category</Text>
                    <TouchableOpacity style={styles.button}
                    onPress={() => navigation.navigate('HomeLoggedIn')}>
                        <Text style={{color: '#FFC11E', fontSize: 16}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.description}>{`${route.params.selectedNotes.length} note(s)`}</Text>
            </View>
            <View  style={styles.categoriesCard}>
                <Text style={{color: '#939598'}}>CATEGORIES</Text>
            </View>
            <TouchableOpacity style={styles.categoriesCard}
            onPress={() => setModalVisible(true)}>
                <Text style={{fontSize: 15, fontWeight: '500', color: '#FFC11E'}}>New Category</Text>
            </TouchableOpacity>
            <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item, index) => index}
            />
             <CreateCategory modalVisible={modalVisible} setModalVisible={setModal} 
             filteredCategories={categories} notes={route.params.selectedNotes} createMode={true}
             oldCategory={[]} navigation={navigation}/>    
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    headerSection: {
        flex: 0.09,
        // borderWidth: 1,
        justifyContent: 'space-between',
        padding: 13,
        paddingTop: 60,
        backgroundColor: 'rgba(241, 242, 242, 0.4)',
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',  
      alignItems: 'center',
    },

    headerText: {
        fontSize: 17,
        fontWeight: '500',
    },

    button: {
        // borderWidth: 1,
        width: 50,
    },

    description:{
        color: '#939598',
        paddingLeft: 10,
    },

    categoriesCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F2',
        padding: 12,
    },
});