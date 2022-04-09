import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { createNewNote, editNote } from "../db/queries.js";

/**
 * Screen to create or edit notes.
 *
 * @param {Object} navigation navigation object
 * @param {Object} route route object
 * @returns CreateNotesScreen component
 */
export default function CreateNotesScreen({ navigation, route }) {
  const { title, label, content, action, fromHome, category, id } =
    route.params;
  const d = new Date();
  const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  const [titleText, setTitleText] = useState(title);
  const [labelText, setLabelText] = useState(label);
  const [contentText, setContentText] = useState(content);
  const keyboardVerticalOffset = Platform.OS === "ios" ? 10 : 0;

  const createNote = () => {
    if (action === "Edit") {
      editNote(titleText, labelText, contentText, date, id);
    } else {
      createNewNote(
        titleText,
        category,
        labelText,
        contentText,
        date,
        d.getTime()
      );
    }
    goBack();
  };

  const goBack = () => {
    fromHome
      ? navigation.navigate("HomeLoggedIn")
      : navigation.navigate("NotesScreen", {
          category: category,
        });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.subContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.headerIcons, { alignItems: "flex-start" }]}
                onPress={() => goBack()}
              >
                <Icon name="closecircleo" type="antdesign" size={23} />
              </TouchableOpacity>
              <Text style={styles.headerText}>{`${action} Note`}</Text>
              <TouchableOpacity
                style={styles.headerIcons}
                onPress={() => createNote()}
              >
                <Icon name="checkcircleo" type="antdesign" size={23} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.description}>
            <View style={styles.title}>
              <TextInput
                style={styles.titleText}
                placeholder="Untitled"
                multiline={true}
                value={titleText}
                onChangeText={setTitleText}
              />
            </View>
            <View style={styles.details}>
              <View style={styles.categoryPlaceHolder}>
                <Text style={styles.labelText} numberOfLines={1}>
                  {category}
                </Text>
              </View>
              <View style={styles.label}>
                <TextInput
                  style={styles.labelText}
                  placeholder="Label"
                  value={labelText}
                  onChangeText={setLabelText}
                />
              </View>
            </View>
          </View>
          <View style={styles.editor}>
            <TextInput
              style={styles.editorTextInput}
              multiline={true}
              value={contentText}
              onChangeText={setContentText}
              selectionColor={"#FFE9A0"}
            />
          </View>
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
    overflow: "hidden",
  },

  subContainer: {
    flex: 1,
  },

  headerContainer: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  headerText: {
    fontSize: 20,
    fontFamily: "LatoBold",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.3,
    borderBottomColor: "#BCBEC0",
    paddingBottom: 30,
  },

  headerIcons: {
    width: "20%",
    justifyContent: "center",
    alignItems: "flex-end",
  },

  title: {
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },

  titleText: {
    fontSize: 17,
    fontFamily: "LatoBold",
  },

  description: {
    paddingLeft: 15,
    paddingRight: 15,
  },

  details: {
    borderBottomWidth: 0.3,
    borderBottomColor: "#BCBEC0",
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },

  label: {
    width: "85%",
    paddingLeft: 10,
  },

  categoryPlaceHolder: {
    borderRightWidth: 0.2,
    borderRightColor: "#939598",
    width: "15%",
    height: 18,
  },

  labelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#58595B",
  },

  editor: {
    paddingTop: 10,
    flex: 1,
  },

  editorTextInput: {
    flexGrow: 1,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 15,
  },
});
