import { View, StyleSheet, Text } from "react-native";
import { Icon } from "react-native-elements";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { TouchableWithoutFeedback } from "react-native";

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
  const [loaded] = useFonts({
    Overpass: require("../assets/fonts/Overpass-Regular.ttf"),
    OverpassBold: require("../assets/fonts/Overpass-SemiBold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => noteClick()}
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
