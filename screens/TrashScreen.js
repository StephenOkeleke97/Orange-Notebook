import { View, FlatList, Text, StyleSheet, TextInput } from "react-native";
import React from "react";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import NoteCardSlim from "../components/NoteCardSlim.js";
import {
  permanentDelete,
  restoreDeletedNotes,
  selectAllNotes,
} from "../db/queries.js";

/**
 * Recently deleted screen.
 *
 * @returns TrashScreen
 */
export default function TrashScreen() {
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchedText, setSearchedText] = useState("");
  const [reRenderOnSelect, setReRenderOnSelect] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(false);
  const [triggerSelectAll, setTriggerSelectAll] = useState(false);

  /**
   * Get deleted notes on focus.
   */
  useFocusEffect(
    React.useCallback(() => {
      setSearchedText("");
      selectAllNotes("true", "false", onSelectAllNotes);
      setSelectMode(false);
      setSelected(false);
    }, [])
  );

  /**
   * Select deleted notes to reflect
   * searched text.
   */
  useEffect(() => {
    selectAllNotes("true", "false", onSelectAllNotes);
  }, [searchedText]);

  /**
   * Callback to filtered notes with result
   * from database.
   *
   * @param {array} array deleted notes from database
   */
  const onSelectAllNotes = (array) => {
    setFilteredNotes(
      array.filter((note) =>
        note.Content.toLowerCase().includes(searchedText.toLowerCase())
      )
    );
  };

  const getSelectMode = () => {
    return selectMode;
  };
  const triggerSelectMode = () => {
    setSelectedNotes([]);
    setSelected(false);
    setSelectMode(!selectMode);
  };

  /**
   * Add noteID to selected notes list.
   *
   * @param {int} noteID note id to be added
   */
  const addToSelectedNotes = (noteID) => {
    selectedNotes.push(noteID);
    setReRenderOnSelect(!reRenderOnSelect);
  };

  /**
   * Remove noteID from selected notes list.
   *
   * @param {int} noteID note id to be removed
   */
  const removeFromSelectedNotes = (noteID) => {
    const index = selectedNotes.indexOf(noteID);
    if (index > -1) {
      selectedNotes.splice(index, 1);
    }
    setReRenderOnSelect(!reRenderOnSelect);
  };

  /**
   * Permanently deleted selected notes from
   * database.
   */
  const deleteSelectedNotes = () => {
    if (selectedNotes.length > 0) {
      permanentDelete(selectedNotes);
      selectAllNotes("true", "false", onSelectAllNotes);
    }
    setSelectMode(!selectMode);
  };

  /**
   * Restore selected notes.
   */
  const restoreSelectedNotes = () => {
    if (selectedNotes.length > 0) {
      restoreDeletedNotes(selectedNotes);
      selectAllNotes("true", "false", onSelectAllNotes);
    }
    setSelectMode(!selectMode);
  };

  /**
   * Select all notes.
   */
  const selectAll = () => {
    setSelected(true);
    setTriggerSelectAll(!triggerSelectAll);
    setSelectedNotes(filteredNotes.map((note) => note.NotesID));
    setReRenderOnSelect(!reRenderOnSelect);
  };

  const getSelected = () => {
    return selected;
  };

  /**
   * Render NoteCardSlim in flastlist.
   *
   * @param {Object} item note object
   * @returns NoteCardSlim component
   */
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Recently Deleted</Text>
            <View style={styles.headerIcons}>
              {selectMode && selectedNotes.length > 0 && (
                <TouchableOpacity
                  style={styles.headerIconComponents}
                  onPress={() => restoreSelectedNotes()}
                >
                  <Icon name="restore" type="material-community" size={21} />
                </TouchableOpacity>
              )}
              {selectMode && selectedNotes.length > 0 && (
                <TouchableOpacity
                  style={styles.headerIconComponents}
                  onPress={() => deleteSelectedNotes()}
                >
                  <Icon
                    name="delete-outline"
                    type="material-community"
                    size={21}
                  />
                </TouchableOpacity>
              )}
              {selectMode && (
                <TouchableOpacity
                  style={styles.headerIconComponents}
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
                style={styles.headerIconComponents}
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
        </View>
      </View>

      <View style={styles.filter}>
        <View style={styles.activeTabTitle}>
          <Text style={{ fontSize: 15, fontWeight: "500" }}>Deleted Notes</Text>
        </View>
      </View>
      <View style={styles.cardContainer}>
        {filteredNotes.length > 0 ? (
          <FlatList
            data={filteredNotes}
            renderItem={renderItem}
            keyExtractor={(item, index) => index}
            style={styles.deletedNotes}
          />
        ) : (
          <Text style={styles.emptyNoteText}>No notes deleted</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
  },

  titleText: {
    fontSize: 20,
    fontFamily: "LatoBold",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "red",
    paddingBottom: 30,
  },

  mainContainer: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  headerContainer: {
    paddingBottom: 2,
    borderBottomWidth: 0.3,
    borderBottomColor: "#BCBEC0",
  },

  headerIcons: {
    justifyContent: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },

  headerIconComponents: {
    marginLeft: 10,
  },

  filter: {
    flexDirection: "row",
    paddingBottom: 15,
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },

  activeTabTitle: {
    width: "50%",
    justifyContent: "center",
  },

  searhBar: {
    marginBottom: 5,
    backgroundColor: "#F1F2F2",
    borderRadius: 5,
    height: 30,
    justifyContent: "center",
    paddingLeft: 10,
  },

  deletedNotes: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  cardContainer: {
    height: "78%",
  },

  emptyNoteText: {
    color: "#939598",
    paddingLeft: 15,
    paddingRight: 15,
  },
});
