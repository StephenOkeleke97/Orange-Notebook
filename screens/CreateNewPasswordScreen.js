import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
} from "react-native";
import { Icon } from "react-native-elements";
import UserService from "../services/UserService";
import { globalStyles } from "../styles/global";
import Loading from "../components/Loading";

const CreateNewPasswordScreen = ({ navigation, route }) => {
  const { email, code } = route.params;
  const verifyPassword =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notMatch, setNotMatch] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreatePassword = () => {
    if (!verifyPassword.test(password)) {
      setInvalidPassword(true);
    } else if (confirmPassword !== password) {
      setNotMatch(true);
    } else {
      setLoading(true);
      UserService.resetPassword(
        email,
        password,
        code,
        resetSuccessful,
        failure
      );
    }
  };

  const resetSuccessful = () => {
    setLoading(false);
    Alert.alert("Confirmation", "Your password has been reset");
    navigation.navigate("Login");
  };

  const failure = (
    message = `Something went wrong. 
  Please try again later`
  ) => {
    setLoading(false);
    Alert.alert("Reset Password Failed", message);
  };

  return (
    <TouchableWithoutFeedback
      style={globalStyles.container}
      onPress={() => Keyboard.dismiss()}
    >
      <View style={styles.container}>
        <View style={styles.navTab}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Icon type="material-community" name="keyboard-backspace" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Create new password</Text>
          <Text style={styles.headerText}>
            Password must be at least 8 characters and contain at least one of
            the following: Uppercase letter, lowercase letter, number and
            special character
          </Text>
        </View>
        <View style={styles.passwordInputContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.headerText}>Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.passwordInputBox}
                textContentType={"password"}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={(e) => {
                  setInvalidPassword(false);
                  setPassword(e);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  setPasswordVisible(!passwordVisible);
                }}
              >
                <Icon
                  type="entypo"
                  name={passwordVisible ? "eye-with-line" : "eye"}
                  size={20}
                  color="#939598"
                />
              </TouchableOpacity>
            </View>
            {invalidPassword && (
              <Text style={styles.errorText}>
                Password must meet required specifications
              </Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.headerText}>Confirm Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.passwordInputBox}
                textContentType={"password"}
                secureTextEntry={!confirmPasswordVisible}
                value={confirmPassword}
                onChangeText={(e) => {
                  setNotMatch(false);
                  setConfirmPassword(e);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  setConfirmPasswordVisible(!confirmPasswordVisible);
                }}
              >
                <Icon
                  type="entypo"
                  name={confirmPasswordVisible ? "eye-with-line" : "eye"}
                  size={20}
                  color="#939598"
                />
              </TouchableOpacity>
            </View>

            {notMatch && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>
          <TouchableOpacity
            style={globalStyles.yellowButton}
            onPress={handleCreatePassword}
          >
            <Text style={globalStyles.buttonText}>Create Password</Text>
          </TouchableOpacity>
        </View>
        {loading && <Loading />}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 60,
  },

  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  headerContainer: {
    paddingTop: 25,
    paddingBottom: 25,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 15,
  },

  headerText: {
    color: "#6D6E71",
  },

  passwordInput: {
    borderWidth: 0.5,
    borderColor: "#BCBEC0",
    height: 40,
    marginTop: 8,
    borderRadius: 7,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInputBox: {
    height: 30,
    flexGrow: 1,
    paddingRight: 15,
  },

  errorText: {
    fontSize: 12,
    color: "red",
  },

  inputContainer: {
    marginBottom: 12,
  },
});

export default CreateNewPasswordScreen;
