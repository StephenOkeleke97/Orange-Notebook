import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { useEffect, useState } from "react";
import React from "react";
import { Icon } from "react-native-elements";
import Category from "../components/Category.js";
import { useFocusEffect } from "@react-navigation/native";
import CreateCategory from "../components/CreateCategory.js";
import { deleteCategory, updateCategoryList } from "../db/queries.js";

/**
 * Screen for displaying categories.
 *
 * @param {Object} navigation navigation object
 * @returns CategoriesScreen component
 */
export default function CategoriesScreen({ navigation }) {
  /**
   * Array representing filtered categories.
   * Filtered when user types into the search box.
   */
  const [filteredCategories, setFilteredCategories] = useState([]);
  /**
   * Text that filteres category list.
   */
  const [searchedText, setSearchedText] = useState("");
  /**
   * Show edit/ filter category modal.
   */
  const [modalVisible, setModalVisible] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  /**
   * Indicates select mode. When active multiple categories,
   * can be selected.
   */
  const [selectMode, setSelectMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  /**
   * Changing this triggers a rerender to reflect an
   * updated component.
   */
  const [reRenderOnSelect, setReRenderOnSelect] = useState(false);
  /**
   * Indicates whether or not a category is selected.
   */
  const [selected, setSelected] = useState(false);
  /**
   * Select all categories.
   */
  const [triggerSelectAll, setTriggerSelectAll] = useState(false);

  const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

  /**
   * Reset variables on focus.
   */
  useFocusEffect(
    React.useCallback(() => {
      setSearchedText("");
      updateCategoryList(updateCategoryListCallback);
      setSelected(false);
      setSelectMode(false);
      setSelectedCategories([]);
    }, [])
  );

  /**
   * Get category list to reflect
   * searched category.
   */
  useEffect(() => {
    updateCategoryList(updateCategoryListCallback);
  }, [searchedText, modalVisible]);

  /**
   * Callback to handle result of database
   * query.
   *
   * @param {array} array filtered category
   */
  const updateCategoryListCallback = (array) => {
    setFilteredCategories(
      array.filter((categories) =>
        categories.CategoryName.toLowerCase().includes(
          searchedText.toLowerCase()
        )
      )
    );
  };

  /**
   * Add category to selected categories.
   *
   * @param {string} categoryName name of category to be added
   */
  const addToSelectedCategories = (categoryName) => {
    selectedCategories.push(categoryName);
    setReRenderOnSelect(!reRenderOnSelect);
  };

  /**
   * Remove category to selected categories.
   *
   * @param {string} categoryName name of category to be removed
   */
  const removeFromSelectedCategories = (categoryName) => {
    const index = selectedCategories.indexOf(categoryName);
    if (index > -1) {
      selectedCategories.splice(index, 1);
    }
    setReRenderOnSelect(!reRenderOnSelect);
  };

  /**
   * Delete selected categories.
   */
  const deleteSelectedCategories = () => {
    if (selectedCategories.length > 0) {
      deleteCategory(selectedCategories, () => {
        updateCategoryList(updateCategoryListCallback);
      });
    }
    setSelectMode(!selectMode);
    setSelectedCategories([]);
  };

  /**
   * Edit category. Only one can be edited
   * at a time.
   */
  const handleEdit = () => {
    if (selectedCategories.length !== 1) {
      alert("Please select exactly one category");
    } else {
      setCreateMode(false);
      setModalVisible(!modalVisible);
    }
  };

  const setModal = (modalVisible) => {
    setModalVisible(modalVisible);
  };

  const clearSelection = () => {
    setSelectedCategories([]);
    setSelectMode(false);
  };

  const getSelectMode = () => {
    return selectMode;
  };

  const triggerSelectMode = () => {
    setSelectedCategories([]);
    setSelected(false);
    setSelectMode(!selectMode);
  };

  /**
   * Select all categories.
   */
  const selectAll = () => {
    setSelected(true);
    setTriggerSelectAll(!triggerSelectAll);
    setSelectedCategories(
      filteredCategories.map((category) => category.CategoryName)
    );
    setReRenderOnSelect(!reRenderOnSelect);
  };

  const getSelected = () => {
    return selected;
  };

  /**
   * Render category component in flatlist.
   *
   * @param {Object} item category
   * @returns
   */
  const renderItem = ({ item }) => (
    <Category
      name={item.CategoryName}
      noteCount={item.NumOfNotes}
      redColor={item.RedColor}
      greenColor={item.GreenColor}
      blueColor={item.BlueColor}
      getSelectMode={getSelectMode}
      setSelectMode={triggerSelectMode}
      addToSelectedCategories={addToSelectedCategories}
      removeFromSelectedCategories={removeFromSelectedCategories}
      getSelected={getSelected}
      triggerSelectAll={triggerSelectAll}
      navigation={navigation}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View>
          <View style={styles.topSection}>
            <View style={styles.mainContainer}>
              <View style={styles.header}>
                <Text style={styles.titleText}>Categories</Text>
                <View style={styles.headerContent}>
                  {selectMode && selectedCategories.length > 0 && (
                    <TouchableOpacity
                      style={styles.headerIcons}
                      onPress={() => handleEdit()}
                    >
                      <Icon name="edit" type="feather" size={20} />
                    </TouchableOpacity>
                  )}
                  {selectMode && selectedCategories.length > 0 && (
                    <TouchableOpacity
                      style={styles.headerIcons}
                      onPress={() => deleteSelectedCategories()}
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
                    style={[styles.headerIcons, { width: "22%" }]}
                    onPress={() => triggerSelectMode()}
                  >
                    <Text style={{ color: "#FFC11E" }}>
                      {!selectMode ? "Select" : "Cancel"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerIcons}
                    onPress={() => {
                      setCreateMode(true);
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <Icon name="pluscircleo" type="antdesign" size={21} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.searhBar}>
                <TextInput
                  style={{ color: "#939598", fontWeight: "400" }}
                  placeholder="Search Categories"
                  onChangeText={setSearchedText}
                  value={searchedText}
                />
              </View>
            </View>

            <View style={styles.filter}>
              <View style={styles.activeTabTitle}>
                <Text style={{ fontSize: 15, fontWeight: "500" }}>
                  List Categories
                </Text>
              </View>
            </View>
          </View>

          {filteredCategories.length > 0 ? (
            <View style={styles.categoryFlatListContainer}>
              <FlatList
                data={filteredCategories}
                renderItem={renderItem}
                keyExtractor={(item, index) => index}
                numColumns={2}
                style={styles.categoryFlatList}
              />
            </View>
          ) : (
            <Text style={styles.categoryFlatList}>No categories to show</Text>
          )}
          <CreateCategory
            modalVisible={modalVisible}
            setModalVisible={setModal}
            filteredCategories={filteredCategories}
            createMode={createMode}
            oldCategory={selectedCategories}
            clearSelection={clearSelection}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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

  topSection: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  mainContainer: {
    borderBottomWidth: 0.3,
    borderBottomColor: "#BCBEC0",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 30,
  },

  headerContent: {
    width: "60%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  headerIcons: {
    width: "10%",
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },

  filter: {
    flexDirection: "row",
    paddingBottom: 15,
    paddingTop: 15,
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

  categoryFlatListContainer: {
    height: "80%",
  },

  categoryFlatList: {
    paddingLeft: 15,
    paddingRight: 15,
  },
});
