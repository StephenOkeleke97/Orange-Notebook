import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from "react-native";
import CreateCategory from "./CreateCategory";
import React from "react";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import CurrentUser from "../services/CurrentUser";
import { selectCategories, updateNoteCategories } from "./queries";

export default function AddNoteToCategoryScreen({ route, navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      selectCategories(CurrentUser.prototype.getUser(), (array) => {
        array.forEach((item, index) => {
          if (item.CategoryName === "None") {
            array.splice(index, 1);
            array.unshift(item);
          }
        });
        setCategories(array);
      });
    }, [])
  );

  const setModal = (modalVisible) => {
    setModalVisible(modalVisible);
  };

  const CategoryCard = ({ categoryName }) => {
    const add = () => {
      updateNoteCategories(
        route.params.selectedNotes,
        categoryName,
        CurrentUser.prototype.getUser(),
        () => {
          navigation.navigate("HomeLoggedIn");
        }
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
        >{`${route.params.selectedNotes.length} note(s)`}</Text>
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
        notes={route.params.selectedNotes}
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
