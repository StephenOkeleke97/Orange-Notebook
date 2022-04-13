import { View, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-elements";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { TouchableWithoutFeedback } from "react-native";

/**
 * Render a category component
 *
 * @param {string} name Category name
 * @param {int} noteCount number of notes in category
 * @param {int} redColor red component of rgb color
 * @param {int} greenColor green component of rgb color
 * @param {int} blueColor blue component of rgb color
 * @param {boolean} getSelectMode get select mode
 * @param {function} setSelectMode set select mode
 * @param {function} addToSelectedCategories add category to selected categories
 * @param {function} removeFromSelectedCategories remove category from selected categories
 * @param {boolean} getSelected boolean indicator of select status of current category
 * @param {boolean} triggerSelectAll boolean to indicate a change when all
 * categories are selected
 * @param {Object} navigation navigation object
 * @returns Category component
 */
export default function Category({
  name,
  noteCount,
  redColor,
  greenColor,
  blueColor,
  getSelectMode,
  setSelectMode,
  addToSelectedCategories,
  removeFromSelectedCategories,
  getSelected,
  triggerSelectAll,
  navigation,
}) {
  /**
   * Indicates the select status of this category.
   */
  const [selected, setSelected] = useState(false);

  /**
   * Takes two dependencies. select all status and
   * select mode status from parent component.
   */
  useEffect(() => {
    if (getSelectMode() === false) {
      setSelected(false);
    } else {
      setSelected(getSelected());
    }
  }, [triggerSelectAll, getSelectMode()]);

  /**
   * Handle click on category. If select mode
   * is active, add or remove from category else
   * view notes of this category.
   */
  const categoryClick = () => {
    if (getSelectMode()) {
      if (!selected) {
        addToSelectedCategories(name);
      } else {
        removeFromSelectedCategories(name);
      }
      setSelected(!selected);
    } else {
      navigation.navigate("NotesScreen", {
        category: name,
      });
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => categoryClick()}
      onLongPress={() => setSelectMode()}
    >
      <View
        style={[
          styles.categoryCard,
          {
            backgroundColor: `rgba(${redColor}, ${greenColor}, ${blueColor}, 0.15)`,
          },
        ]}
      >
        {getSelectMode() && (
          <View style={{ position: "absolute", left: "80%", top: "8%" }}>
            {!selected ? (
              <Icon name="ellipse" type="ionicon" color="#fff" size={17} />
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
        <View style={styles.iconView}>
          <Icon
            name="md-folder-open"
            type="ionicon"
            size={65}
            color={`rgba(${redColor}, ${greenColor}, ${blueColor}, 1)`}
          />
        </View>
        <View style={styles.contentView}>
          <Text style={styles.labelText} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View style={styles.contentView}>
          <Text style={styles.contentText}>{`${noteCount} Notes`}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    height: 180,
    width: "47%",
    borderRadius: 25,
    marginBottom: 20,
    marginRight: 20,
  },

  iconView: {
    flex: 0.5,
    justifyContent: "center",
  },

  contentView: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
  },

  labelText: {
    fontSize: 16,
    fontWeight: "500",
  },

  contentText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#939598",
  },
});
