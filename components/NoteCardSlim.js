import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { useState, useEffect } from "react";

/**
 * A component representing a slim card summary of notes.
 * Rendered when detailed view is disabled.
 * Shows a less detailed display of notes than
 * the NoteCard component.
 *
 * @param {int} id note id
 * note item shows more information than the rest
 * @param {string} title title of note
 * @param {string} content note content
 * @param {string} category note category
 * @param {string} label note label
 * @param {date} date date of creation or last edit
 * @param {boolean} getSelectMode select mode active
 * @param {boolean} setSelectMode trigger select mode. This is useful
 * in this component because a long press of a component triggers select mode
 * @param {int} redColor red component of rgb color of category
 * @param {int} greenColor green component of rgb color of category
 * @param {int} blueColor blue component of rgb color of category
 * @param {function} addToSelectedNotes add note to selected notes
 * @param {function} removeFromSelectedNotes remove note from selected notes
 * @param {function} getSelected get selected flag from parent. Useful to indicate
 * when all notes are selected
 * @param {boolean} triggerSelectAll boolean attribute that changes everytime
 * the select all variable from parent if triggered
 * @param {Object} navigate navigation object
 * @returns
 */
export default function NoteCardSlim({
  id,
  title,
  content,
  category,
  label,
  date,
  getSelectMode,
  setSelectMode,
  redColor,
  greenColor,
  blueColor,
  addToSelectedNotes,
  removeFromSelectedNotes,
  getSelected,
  triggerSelectAll,
  navigate,
}) {
  /**
   * Indicates whether or not a note is selected.
   */
  const [selected, setSelected] = useState(false);

  /**
   * Called everytime select mode or select all variable from
   * parent is changed.
   */
  useEffect(() => {
    if (getSelectMode() === false) {
      setSelected(false);
    } else {
      setSelected(getSelected());
    }
  }, [triggerSelectAll, getSelectMode()]);

  /**
   * Add or remove note from selected notes if
   * select mode is enabled. If not enabled,
   * go to CreateNotesScreen to view/ edit note.
   */
  const noteClick = () => {
    if (getSelectMode()) {
      if (!selected) {
        addToSelectedNotes(id);
      } else {
        removeFromSelectedNotes(id);
      }
      setSelected(!selected);
    } else {
      if (navigate != null) {
        navigate("Edit", title, category, label, content, id);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            backgroundColor: `rgba(${redColor}, ${greenColor}, ${blueColor}, 0.2)`,
          },
        ]}
        onPress={() => noteClick()}
        activeOpacity={0.6}
        onLongPress={() => setSelectMode()}
      >
        <Text style={styles.noteText} numberOfLines={1}>
          {content}
        </Text>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{date}</Text>
          {getSelectMode() && (
            <View>
              {!selected ? (
                <Icon
                  name="ellipse"
                  type="ionicon"
                  size={15}
                  style={{ marginRight: 10 }}
                  color="#FFF"
                />
              ) : (
                <Icon
                  name="checkmark-circle"
                  type="ionicon"
                  size={18}
                  style={{ marginRight: 10 }}
                  color="#1771F1"
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  cardContainer: {
    height: 60,
    paddingTop: 10,
    paddingLeft: 10,
    borderRadius: 10,
    backgroundColor: "#F1F2F2",
    marginBottom: 3,
  },

  noteText: {
    marginBottom: 5,
    fontSize: 15,
    fontWeight: "500",
  },

  dateText: {
    color: "#939598",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
