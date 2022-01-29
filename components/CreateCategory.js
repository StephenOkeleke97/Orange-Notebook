import { View,
    Text,
    StyleSheet,
    TextInput,  
    TouchableOpacity,
    Modal,
    Dimensions} from 'react-native';
import { useState, useEffect } from 'react';
import React from 'react';
import { Icon } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('notes.db');

export default function CreateCategory( {modalVisible, setModalVisible, 
    filteredCategories, notes, createMode, oldCategory, clearSelection, navigation} ) {
    const colors = {
        blue: {
            redColor: 81,
            greenColor: 153,
            blueColor: 255
        },
        yellow: {
            redColor: 246,
            greenColor: 198,
            blueColor: 94
        },
        green: {
            redColor: 120,
            greenColor: 206,
            blueColor: 107
        },
        purple: {
            redColor: 248,
            greenColor: 92,
            blueColor: 80,
        },
        red: {
            redColor: 216,
            greenColor: 116,
            blueColor: 248
        }
    }

    const [activeColor, setActiveColor] = useState(colors.blue);
    const[categoryName, setCategoryName] = useState("");
    const [blueActive, setBlueActive] = useState(true);
    const [yellowActive, setYellowActive] = useState(false);
    const [greenActive, setGreenActive] = useState(false);
    const [redActive, setRedActive] = useState(false);
    const [purpleActive, setPurpleActive] = useState(false);

    useEffect(() => {
        if (createMode) {
            setCategoryName("");
        } else {
            setCategoryName(oldCategory[0]);
        }
    }, [modalVisible]);

    const triggerActiveColor = () => {
        setBlueActive(false);
        setYellowActive(false);
        setGreenActive(false);
        setRedActive(false);
        setPurpleActive(false);
    }

    const handleClearSelection = () => {
        if (clearSelection !== undefined) {
            clearSelection();
        }
    }

    const saveCategory = () => {
        if (categoryName === "") {
            return alert("Please choose a name for this category");
        } 

        if (createMode) {
            if (filteredCategories.map(x => x.CategoryName.toLowerCase()).includes(categoryName.trim().toLowerCase())) {
                return alert("This name is already taken. Please choose a different name");  
            } else {
                db.transaction((tx) => {
                    tx.executeSql(
                    'INSERT INTO Category(CategoryName, RedColor, GreenColor, BlueColor) VALUES (' +
                        '?, ?, ?, ?)' 
                    , [categoryName.trim(), activeColor.redColor, activeColor.greenColor, activeColor.blueColor],
                    null, (t, error) => {
                        console.log('Error ', error)
                    });
                });
            }
        } else {
            if (filteredCategories.filter(category => category.CategoryName !== oldCategory[0])
            .map(x => x.CategoryName.toLowerCase()).includes(categoryName.trim().toLowerCase())) {
               return alert("This name is already taken. Please choose a different name");  
            } else {
                db.transaction((tx) => {
                    tx.executeSql(
                    'UPDATE Category SET CategoryName = ?, RedColor = ?, GreenColor = ?, BlueColor = ? ' +
                    'WHERE CategoryName = ?' 
                    , [categoryName.trim(), activeColor.redColor, activeColor.greenColor, activeColor.blueColor, oldCategory[0]],
                    null, (t, error) => {
                        console.log('Error ', error)
                    });
                });
            }
        }
              
        if (notes != null) {
            notes.map((note, index, array) => {
                db.transaction((tx) => {
                    tx.executeSql(
                    'UPDATE Notes SET CategoryName = ? WHERE NotesID = ?'
                    , [categoryName, note],
                    null
                    , (t, error) => console.log('Error ', error));
                    if (index === array.length - 1)
                    navigation.navigate('HomeLoggedIn');
                });   
            });
        }
        setModalVisible(false);
        setCategoryName(''); 
    }

    return(
        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHeaderText}>{`${createMode ? "New" : "Edit"} Category`}</Text>
                        <Text style={styles.modalText}>Enter a name and color for this category</Text>
                        <TextInput style={styles.modalTextInput}
                        onChangeText={setCategoryName}
                        value={categoryName === undefined && !createMode ? oldCategory[0] : categoryName}
                        placeholder='Category name'/>

                        <View style={styles.colorView}>
                            <TouchableOpacity style={blueActive && {backgroundColor: '#FFF', borderRadius: 50}}
                            onPress={() => {triggerActiveColor(); setBlueActive(true); setActiveColor(colors.blue)}}>
                                <Icon
                                name='circle'
                                color='#FFF'
                                type='material-community'
                                color='#64C7FF'/>
                            </TouchableOpacity>
                            <TouchableOpacity style={yellowActive && {backgroundColor: '#FFF', borderRadius: 50}}
                            onPress={() => {triggerActiveColor(); setYellowActive(true); setActiveColor(colors.yellow)}}>
                                <Icon
                                name='circle'
                                color='#FFF'
                                type='material-community'
                                color='#FFEB7F'/>
                            </TouchableOpacity>
                            <TouchableOpacity style={greenActive && {backgroundColor: '#FFF', borderRadius: 50}}
                            onPress={() => {triggerActiveColor(); setGreenActive(true); setActiveColor(colors.green)}}>
                                <Icon
                                name='circle'
                                color='#FFF'
                                type='material-community'
                                color='#5BFF62'/>
                            </TouchableOpacity>
                            <TouchableOpacity style={redActive && {backgroundColor: '#FFF', borderRadius: 50}}
                            onPress={() => {triggerActiveColor(); setRedActive(true); setActiveColor(colors.red)}}>
                                <Icon
                                name='circle'
                                color='#FFF'
                                type='material-community'
                                color='#F375F3'/>
                            </TouchableOpacity>
                            <TouchableOpacity style={purpleActive && {backgroundColor: '#FFF', borderRadius: 50}}
                            onPress={() => {triggerActiveColor(); setPurpleActive(true); setActiveColor(colors.purple)}}>
                                <Icon
                                name='circle'
                                color='#FFF'
                                type='material-community'
                                color='#F6522E'/>
                            </TouchableOpacity>
                        </View>

                       <View style={styles.buttonView}>
                            <TouchableOpacity style={styles.buttons}
                            onPress={() => {setModalVisible(false); setCategoryName(''); handleClearSelection();}}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttons}
                            onPress={() => {saveCategory(); handleClearSelection();}}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                       </View>
                    </View>
                </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        position: 'absolute',
        transform: [
            {translateY : Dimensions.get('window').height * 0.5 - 150},
            {translateX : Dimensions.get('window').width * 0.5 - 150}
        ],
        backgroundColor: '#000',
        borderRadius: 25,
        width: 300,
        height: 245,
        padding: 20
        // borderWidth: 1
      },

      modalText: {
        marginBottom: 20,
        textAlign: "center",
        color: '#FFF',
      },

      modalHeaderText: {
          fontSize: 18,
          fontWeight: '600',
          textAlign: 'center',
          color: '#FFF',
          marginBottom: 10
      },

      modalTextInput: {
          backgroundColor: '#fff',
          height: 30,
          borderRadius: 8,
          paddingLeft: 10,
          marginBottom: 15,
      },

      buttonView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },

      buttons: {
          backgroundColor: '#FED876',
          borderWidth: 1,
          padding: 10,
          width: '48%',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 6,
      },

      buttonText: {
        color: '#000',
        fontFamily: 'LatoBold',
        fontWeight: '700'
      },

      colorView: {
          flexDirection: 'row',
          marginBottom: 20,
          justifyContent: 'space-evenly'
      },
});