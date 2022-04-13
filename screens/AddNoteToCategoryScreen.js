import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from "react-native";
import CreateCategory from "../components/CreateCategory";
import React from "react";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { selectCategories, updateNoteCategories } from "../db/queries";

/**
 * Add selected notes to a category. They can be
 * added to an existing category or a new category.
 *
 * @param {Object} route route object
 * @param {Object} navigation navigation object
 * @returns
 */
export default function AddNoteToCategoryScreen({ route, navigation }) {
  /**
   * boolean to trigger create category modal.
   */
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);

  const { selectedNotes } = route.params;

  /**
   * Get categories on focus.
   */
  useFocusEffect(
    React.useCallback(() => {
      selectCategories(selectCategoriesCallback);
    }, [])
  );

  /**
   * Process categories after retrieving from database.
   * The "none" category is removed from the category list
   * because it is fixed at its position and not rendered
   * dynamically.
   *
   * @param {array} array
   */
  const selectCategoriesCallback = (array) => {
    array.forEach((item, index) => {
      if (item.CategoryName === "None") {
        array.splice(index, 1);
        array.unshift(item);
      }
    });
    setCategories(array);
  };

  const setModal = (modalVisible) => {
    setModalVisible(modalVisible);
  };

  /**
   * Component to list categories.
   *
   * @param {string} categoryName name of category
   * @returns CategoryCard component
   */
  const CategoryCard = ({ categoryName }) => {
    /**
     * Save notes to category and navigate back to home.
     */
    const add = () => {
      updateNoteCategories(
        selectedNotes,
        categoryName,
        () => {
          navigation.navigate("HomeLoggedIn");
        },
        3
      );
    };

    return (
      <TouchableOpacity style={styles.categoriesCard} onPress={() => add()}>
        <Text
          style={{ fontSize: 15, fontWeight: "400", color: "#000" }}
          numberOfLines={1}
        >
          {categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <CategoryCard categoryName={item.CategoryName} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.button}></TouchableOpacity>
          <Text style={styles.headerText}>Select a category</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("HomeLoggedIn")}
          >
            <Text style={{ color: "#FFC11E", fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={styles.description}
        >{`${selectedNotes.length} note(s)`}</Text>
      </View>
      <View style={styles.categoriesCard}>
        <Text style={{ color: "#939598" }}>CATEGORIES</Text>
      </View>
      <TouchableOpacity
        style={styles.categoriesCard}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 15, fontWeight: "500", color: "#FFC11E" }}>
          New Category
        </Text>
      </TouchableOpacity>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index}
      />
      <CreateCategory
        modalVisible={modalVisible}
        setModalVisible={setModal}
        filteredCategories={categories}
        notes={selectedNotes}
        createMode={true}
        oldCategory={[]}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerSection: {
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: "rgba(241, 242, 242, 0.4)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    fontSize: 17,
    fontWeight: "500",
  },

  button: {
    width: 50,
  },

  description: {
    color: "#939598",
    paddingLeft: 10,
  },

  categoriesCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F2",
    padding: 12,
  },
});
