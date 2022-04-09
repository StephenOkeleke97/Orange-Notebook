import { View, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-elements";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

/**
 * A component representing a card summary of notes.
 * Rendered when detailed view is enabled. 
 * Shows a more detailed display of notes than the
 * NoteCardSlim component.
 *
 * @param {int} id note id
 * @param {int} index index of note. Useful because the first
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
export default function NodeCard({
  id,
  index,
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
      navigate("Edit", title, category, label, content, id);
    }
  };

  //REVIEW
  const selectMode = getSelectMode();

  return (
    <TouchableOpacity
      onPress={() => noteClick()}
      onLongPress={() => setSelectMode()}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: `rgba(${redColor}, ${greenColor}, ${blueColor}, 0.2)`,
          },
        ]}
      >
        <View>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text numberOfLines={2} style={styles.headerText}>
                {title}
              </Text>
            </View>
            {selectMode && (
              <View style={styles.selected}>
                {selected ? (
                  <Icon
                    name="checkmark-circle"
                    type="ionicon"
                    color="#1771F1"
                    size={21}
                  />
                ) : (
                  <Icon name="ellipse" type="ionicon" color="#fff" size={20} />
                )}
              </View>
            )}
          </View>
          <View style={styles.body}>
            <Text numberOfLines={index === 0 ? 3 : 1} style={styles.bodyText}>
              {content}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.category}>
              <Text style={styles.footerText} numberOfLines={1}>
                {category}
              </Text>
            </View>
            <View style={styles.date}>
              <Text numberOfLines={1} style={styles.label}>
                {label}
              </Text>
              <Text style={styles.footerText}>{date}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },

  cardContainer: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
  },

  header: {
    flexDirection: "row",
  },

  headerText: {
    fontSize: 18,
    fontFamily: "OverpassBold",
  },

  headerTextContainer: {
    width: "90%",
  },

  selected: {
    width: "10%",
  },

  body: {
    paddingTop: 10,
  },

  bodyText: {
    fontSize: 15,
    fontFamily: "Overpass",
    color: "#808285",
  },

  footer: {
    flexDirection: "row",
    paddingTop: 25,
  },

  category: {
    borderRightWidth: 1,
    borderRightColor: "#D1D3D4",
    width: "25%",
    justifyContent: "center",
    paddingRight: 10,
  },

  date: {
    width: "75%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
  },

  label: {
    width: "40%",
    fontFamily: "OverpassBold",
    fontSize: 14,
    color: "#808285",
  },

  footerText: {
    fontFamily: "OverpassBold",
    fontSize: 14,
    color: "#808285",
  },
});
