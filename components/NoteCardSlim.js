import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { useState, useEffect } from "react";

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
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (getSelectMode() === false) {
      setSelected(false);
    } else {
      setSelected(getSelected());
    }
  }, [triggerSelectAll, getSelectMode()]);

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
