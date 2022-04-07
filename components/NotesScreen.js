import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import NoteCard from "./NoteCard.js";
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { getDetailedDisplay } from "./settings.js";
import NoteCardSlim from "./NoteCardSlim.js";
import {
  deleteNotes,
  pinNotes,
  selectAllNotes,
  selectNotesOfCategory,
} from "./queries.js";

export default function NotesScreen({ navigation, route }) {
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchedText, setSearchedText] = useState("");
  const [notesTabActive, setNotesTabActive] = useState(true);
  const [reRenderOnSelect, setReRenderOnSelect] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [triggerSelectAll, setTriggerSelectAll] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const keyboardVerticalOffset = Platform.OS === "ios" ? 60 : 0;

  useFocusEffect(
    React.useCallback(() => {
      setSearchedText("");
      getNotes();
      getDetailedDisplay(setDetailedViewCallBack);
      setSelectMode(false);
      setSelected(false);
    }, [notesTabActive])
  );

  useEffect(() => {
    getNotes();
  }, [searchedText, notesTabActive]);

  const getNotes = () => {
    if (notesTabActive) {
      route.params === undefined
        ? //select all unpinned
          getAllUnpinnedNotes()
        : //select certain category unpinned
          getUnpinnedNotesOfCategory();
    } else {
      route.params === undefined
        ? //select all pinned
          getAllPinnedNotes()
        : //select certain category pinned
          getPinnedNotesOfCategory();
    }
  };

  const getAllUnpinnedNotes = () => {
    selectAllNotes("false", "false", getNotesCallback);
  };

  const getAllPinnedNotes = () => {
    selectAllNotes("false", "true", getNotesCallback);
  };

  const getUnpinnedNotesOfCategory = () => {
    selectNotesOfCategory("false", route.params.category, getNotesCallback);
  };

  const getPinnedNotesOfCategory = () => {
    selectNotesOfCategory("true", route.params.category, getNotesCallback);
  };

  const getNotesCallback = (array) => {
    setFilteredNotes(
      array.filter((note) =>
        note.Content.toLowerCase().includes(searchedText.toLowerCase())
      )
    );
  };

  const setDetailedViewCallBack = (bool) => {
    setDetailedView(bool);
  };

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
  };

  const getSelectMode = () => {
    return selectMode;
  };

  const navigateToEditNotes = (action, title, category, label, content, id) => {
    navigation.navigate("CreateNote", {
      action: action,
      title: title,
      category: category,
      label: label,
      content: content,
      id: id,
      fromHome: route.params === undefined ? true : false, //If this parameter is true,
      //that means navigation occured from home.
    });
  };

  const triggerSelectMode = () => {
    setSelected(false);
    setSelectedNotes([]);
    setSelectMode(!selectMode);
  };

  const selectAll = () => {
    setSelected(true);
    setTriggerSelectAll(!triggerSelectAll);
    setSelectedNotes(filteredNotes.map((note) => note.NotesID));
    setReRenderOnSelect(!reRenderOnSelect);
  };

  const getSelected = () => {
    return selected;
  };

  const deleteSelectedNotes = () => {
    if (selectedNotes.length > 0) {
      deleteNotes(selectedNotes);
      getNotes();
    }
    setSelectMode(!selectMode);
  };

  const pinNote = () => {
    if (selectedNotes.length > 0) {
      pinNotes(selectedNotes, "true");
      getNotes();
    }
    setSelectMode(!selectMode);
  };

  const unPinNote = () => {
    if (selectedNotes.length > 0) {
      pinNotes(selectedNotes, "false");
      getNotes();
    }
    setSelectMode(!selectMode);
  };

  const addToCategory = () => {
    if (selectedNotes.length <= 0) {
      alert("Please select at least one note.");
    } else {
      navigation.navigate("AddToCategory", {
        selectedNotes: selectedNotes,
      });
    }
  };

  const renderItem = ({ item, index }) =>
    detailedView ? (
      <NoteCard
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
        addToSelectedNotes={addToSelectedNotes}
        removeFromSelectedNotes={removeFromSelectedNotes}
        getSelected={getSelected}
        triggerSelectAll={triggerSelectAll}
        navigate={navigateToEditNotes}
      />
    ) : (
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
        navigate={navigateToEditNotes}
      />
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={styles.topContainer}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            {route.params === undefined ? (
              <View
                style={[
                  styles.title,
                  {
                    width:
                      selectMode && selectedNotes.length > 0
                        ? "45%"
                        : selectMode && selectedNotes.length <= 0
                        ? "75%"
                        : "85%",
                  },
                ]}
              >
                <Text style={styles.titleText}>Notes</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.title,
                  {
                    width:
                      selectMode && selectedNotes.length > 0
                        ? "45%"
                        : selectMode && selectedNotes.length <= 0
                        ? "75%"
                        : "85%",
                  },
                ]}
              >
                <TouchableOpacity
                  style={{ marginRight: 20 }}
                  onPress={() => navigation.navigate("Categories")}
                >
                  <Icon name="arrow-left" type="material-community" />
                </TouchableOpacity>
                <Text
                  style={[styles.titleText, { fontSize: 18 }]}
                  numberOfLines={2}
                >
                  {route.params.category}
                </Text>
              </View>
            )}
            {selectMode &&
              selectedNotes.length > 0 &&
              (!notesTabActive ? (
                <TouchableOpacity
                  style={styles.headerIcons}
                  onPress={() => unPinNote()}
                >
                  <Icon
                    name="pin-off-outline"
                    type="material-community"
                    size={22}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.headerIcons}
                  onPress={() => pinNote()}
                >
                  <Icon
                    name="pin-outline"
                    type="material-community"
                    size={22}
                  />
                </TouchableOpacity>
              ))}
            {selectMode && selectedNotes.length > 0 && (
              <TouchableOpacity
                style={styles.headerIcons}
                onPress={() => addToCategory()}
              >
                <Icon name="addfolder" type="antdesign" size={20} />
              </TouchableOpacity>
            )}
            {selectMode && selectedNotes.length > 0 && (
              <TouchableOpacity
                style={styles.headerIcons}
                onPress={() => deleteSelectedNotes()}
              >
                <Icon
                  name="delete-outline"
                  type="material-community"
                  size={22}
                />
              </TouchableOpacity>
            )}
            {selectMode && (
              <TouchableOpacity
                style={styles.headerIcons}
                onPress={() => selectAll()}
              >
                <Icon
                  name="select-all"
                  type="material-community"
                  size={22}
                  color="#FFC11E"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.headerIcons, { width: "15%" }]}
              onPress={() => triggerSelectMode()}
            >
              <Text style={{ color: "#FFC11E" }}>
                {!selectMode ? "Select" : "Cancel"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searhBar}>
          <TextInput
            style={{ color: "#939598", fontWeight: "400" }}
            placeholder="Search Notes"
            onChangeText={setSearchedText}
            value={searchedText}
          />
        </View>
        <View
          style={{
            borderBottomWidth: 0.3,
            borderBottomColor: "#BCBEC0",
            marginBottom: 8,
          }}
        />
        <View style={styles.filter}>
          <TouchableOpacity
            style={styles.activeTabTitle}
            onPress={() => setNotesTabActive(true)}
          >
            <Icon
              name="note"
              type="material-community"
              style={
                notesTabActive && {
                  borderBottomWidth: 1,
                  borderBottomColor: "#939598",
                }
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.activeTabTitle}
            onPress={() => setNotesTabActive(false)}
          >
            <Icon
              name="pin"
              type="material-community"
              style={
                !notesTabActive && {
                  borderBottomWidth: 1,
                  borderBottomColor: "#939598",
                }
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.cardContainer}>
          {filteredNotes.length > 0 ? (
            <FlatList
              data={filteredNotes}
              renderItem={renderItem}
              keyExtractor={(item, index) => index}
              style={styles.flatList}
            />
          ) : (
            <Text style={{ color: "#6D6E71", paddingLeft: 15 }}>
              {notesTabActive ? "No notes to show" : "Nothing pinned yet"}
            </Text>
          )}
          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={() =>
              navigation.navigate("CreateNote", {
                action: "Create",
                title: "Untitled",
                category:
                  route.params === undefined ? "None" : route.params.category,
                label: "Label",
                content: "",
                fromHome: route.params === undefined ? true : false, //If this
                //parameter is true, that means navigation occured from home.
              })
            }
          >
            <Icon
              name="plus"
              type="material-community"
              size={25}
              color="#FFF"
            />
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
    backgroundColor: "#fff",
  },

  topContainer: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  cardContainer: {
    height: "78%",
  },

  flatList: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  header: {
    flexDirection: "row",
    paddingBottom: 30,
  },

  navTab: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  backgroundView: {
    flexDirection: "row",
    padding: 6,
    justifyContent: "space-between",
    borderRadius: 20,
    backgroundColor: "#F1F2F2",
    width: "50%",
    height: "83%",
  },

  filter: {
    flexDirection: "row",
    paddingBottom: 15,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "50%",
  },

  activeTabTitle: {
    justifyContent: "center",
    paddingLeft: 5,
    paddingRight: 5,
    marginRight: 10,
  },

  homeImage: {
    width: 35,
    height: 35,
  },

  headerIcon: {
    height: "100%",
    width: "117%",
    justifyContent: "center",
  },

  headerTitle: {
    flexDirection: "row",
  },

  titleText: {
    fontSize: 21,
    fontFamily: "LatoBold",
    width: "70%",
  },

  title: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcons: {
    width: "10%",
    justifyContent: "center",
    alignItems: "flex-end",
  },

  addNoteButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    borderRadius: 50,
    backgroundColor: "#000",
    position: "absolute",
    bottom: "10%",
    left: "80%",
  },

  searhBar: {
    marginBottom: 5,
    backgroundColor: "#F1F2F2",
    borderRadius: 5,
    height: 30,
    justifyContent: "center",
    paddingLeft: 10,
  },
});
