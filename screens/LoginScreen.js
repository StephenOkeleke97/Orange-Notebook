import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { Icon } from "react-native-elements";
import { globalStyles } from "../styles/global.js";
import { HideKeyboard } from "../components/HideKeyboard.js";
import UserService from "../services/UserService.js";
import {
  addTokenToAsyncStorage,
  addUserEmailToAsyncStorage,
  setUser,
} from "../services/CurrentUser.js";
import Loading from "../components/Loading.js";

/**
 * Screen to handle login interaction.
 *
 * @param {Object} navigation navigation object
 * @returns
 */
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const validator = require("email-validator");
  const [passwordVisible, setPasswordVisible] = useState(false);
  /**
   * Indicates when there is an error in the email
   * format.
   */
  const [emailIsError, setEmailIsError] = useState(false);
  /**
   * Indicates when the password is empty.
   */
  const [passwordIsError, setPasswordIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Check if Multi Factor Authentication is enabled.
   */
  const onSubmit = () => {
    if (!validator.validate(email.trim())) {
      setEmailIsError(true);
    } else if (password === "") {
      setPasswordIsError(true);
    } else {
      setLoading(true);
      UserService.getTwoFactor(email.trim(), checkMfaSuccess, failure);
    }
  };

  /**
   * MFA check callback. If MFA is enabled,
   * navigate to the verify email screen. Otherwise,
   * Login User.
   *
   * @param {boolean} enabled true if mfa enabled or false otherwise
   */
  const checkMfaSuccess = (enabled) => {
    if (enabled) {
      setLoading(false);
      navigation.navigate("VerifyEmail", {
        source: "Login",
        email: email.trim(),
        password: password,
      });
    } else {
      UserService.login(email.trim(), password, null, loginSuccess, failure);
    }
  };

  /**
   * Handle successful login. Store usercredentials
   * and authentication token.
   *
   * @param {Object} data object containing jwt token
   */
  const loginSuccess = async (data) => {
    try {
      await addUserEmailToAsyncStorage(email.trim());
      await addTokenToAsyncStorage(data.token);
    } catch (error) {
      return failure();
    }
    setUser(email.trim(), onSetUser);
  };

  const failure = (
    message = `Something went wrong. 
  Please try again later`
  ) => {
    setLoading(false);
    Alert.alert("Login Failed", message);
  };

  /**
   * Callback called after the user credentials
   * are stored successfully. Navigate to the
   * HomeLoggedIn screen.
   */
  const onSetUser = () => {
    setLoading(false);
    navigation.navigate("HomeLoggedIn");
  };

  const handleResetPassword = () => {
    navigation.navigate("ResetPassword");
  };

  return (
    <HideKeyboard>
      <View style={globalStyles.container}>
        <View style={styles.loginTopBar}>
          <TouchableOpacity>
            <Icon
              size={20}
              style={styles.closeIcon}
              name="x"
              type="feather"
              color="#808285"
              onPress={() => navigation.navigate("Home")}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.loginPageHeader}>
          <Text style={styles.loginPageHeaderText}>Log in</Text>
        </View>
        <View style={styles.inputView}>
          <View style={styles.textInputContainer}>
            <View style={styles.textInput}>
              <TextInput
                style={[styles.inputViewComponents, { width: "100%" }]}
                placeholder="Email Address"
                onChangeText={(e) => {
                  setEmail(e);
                  setEmailIsError(false);
                }}
                autoCapitalize="none"
              />
            </View>
            {emailIsError && (
              <Text style={styles.errorText}>
                Please enter a valid email address
              </Text>
            )}
          </View>

          <View style={styles.textInputContainer}>
            <View style={styles.textInput}>
              <TextInput
                style={styles.inputViewComponents}
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                onChangeText={(e) => {
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
            {passwordIsError && (
              <Text style={styles.errorText}>Password cannot be empty</Text>
            )}
          </View>
          <TouchableOpacity
            style={globalStyles.yellowButton}
            onPress={() => onSubmit()}
          >
            <Text style={globalStyles.buttonText}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetPassword}>
            <Text style={styles.alreadyRegisteredText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateAccount")}
          >
            <Text style={styles.alreadyRegisteredText}>
              Don't have an account yet? Create Account
            </Text>
          </TouchableOpacity>
          <View style={styles.separator} />
        </View>
        <StatusBar style="auto" />
        {loading && <Loading />}
      </View>
    </HideKeyboard>
  );
}

const styles = StyleSheet.create({
  loginTopBar: {
    flex: 0.05,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },

  closeIcon: {
    paddingLeft: 20,
  },

  loginPageHeader: {
    flex: 0.1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  loginPageHeaderText: {
    fontSize: 25,
    fontFamily: "LatoBold",
    fontWeight: "700",
  },

  inputView: {
    flex: 0.43,
    padding: 20,
  },

  textInputContainer: {
    marginBottom: 20,
  },

  textInput: {
    backgroundColor: "#fff",
    paddingLeft: 15,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
  },

  inputViewComponents: {
    height: 45,
    width: "90%",
  },

  alreadyRegisteredText: {
    textAlign: "center",
    color: "#808285",
    fontWeight: "500",
    fontFamily: "LatoRegular",
    fontSize: 12,
    marginBottom: 15,
  },

  separator: {
    borderBottomWidth: 0.2,
    borderBottomColor: "#BCBEC0",
  },

  errorText: {
    fontSize: 10,
    color: "red",
    marginBottom: 7,
  },
});
