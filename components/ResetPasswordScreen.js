import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Icon } from "react-native-elements";
import UserService from "../services/UserService";
import { globalStyles } from "../styles/global";

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailIsError, setEmailIsError] = useState(false);
  const validator = require("email-validator");

  const handleNavigateToVerify = () => {
    if (validator.validate(email)) {
      UserService.resendVerification(email, () => {
        navigation.navigate("VerifyEmail", {
          source: "ResetPassword",
          email: email,
        });
      });
    } else {
      setEmailIsError(true);
    }
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
          <Text style={styles.headerTitle}>Reset password</Text>
          <Text style={styles.headerText}>
            Enter the email associated with your account and we'll send an email
            with a verification code that will be required to reset your
            password.
          </Text>
        </View>
        <View style={styles.emailInputContainer}>
          <Text style={styles.headerText}>Email address</Text>
          <TextInput
            style={styles.emailInput}
            autoCapitalize="none"
            placeholder="Email"
            value={email}
            onChangeText={(e) => {
              setEmailIsError(false);
              setEmail(e);
            }}
          />
          {emailIsError && (
            <Text style={styles.errorText}>Please enter a valid email</Text>
          )}
          <TouchableOpacity
            style={globalStyles.yellowButton}
            onPress={handleNavigateToVerify}
          >
            <Text style={globalStyles.buttonText}>Send Verification</Text>
          </TouchableOpacity>
        </View>
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

  backButtonText: {
    marginLeft: 5,
    fontWeight: "500",
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

  emailInput: {
    borderWidth: 0.5,
    borderColor: "#BCBEC0",
    height: 40,
    marginTop: 8,
    borderRadius: 7,
    paddingLeft: 15,
  },

  errorText: {
    fontSize: 12,
    color: "red",
  },
});

export default ResetPasswordScreen;
