import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { globalStyles } from "../styles/global";
import { Icon } from "react-native-elements";
import { useState } from "react";
import UserService from "../services/UserService";
import {
  addTokenToAsyncStorage,
  addUserEmailToAsyncStorage,
  setUser,
} from "../services/CurrentUser";
import Loading from "../components/Loading";

/**
 * Verify Email Screen. This Screen is
 * utilized by 3 components. Login, Register and
 * Reset password. As such, a source parameter is required.
 *
 * @param {Object} navigation navigation object
 * @param {Object} route route object
 * @returns VerifyEmailScreen
 */
export default function VerifyEmailScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const { email, password } = route.params;
  const numList = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [num3, setNum3] = useState("");
  const [num4, setNum4] = useState("");
  const verificationCode = `${num1}` + `${num2}` + `${num3}` + `${num4}`;
  const [currentNum, setCurrentNum] = useState(1);
  const [nextNum, setNextNum] = useState(1);
  const [errorText, setErrorText] = useState("");

  /**
   * Write to custom keypad.
   *
   * @param {int} next next key pad box
   * @param {int} num number to write
   */
  const setNum = (next, num) => {
    if (next === 1) {
      setNum1(num);
      setCurrentNum(1);
      setNextNum(nextNum + 1);
    } else if (next === 2) {
      setNum2(num);
      setCurrentNum(2);
      setNextNum(nextNum + 1);
    } else if (next === 3) {
      setNum3(num);
      setCurrentNum(3);
      setNextNum(nextNum + 1);
    } else if (next === 4) {
      setNum4(num);
      setCurrentNum(4);
      setNextNum(nextNum + 1);
    }
  };

  /**
   * Delete from custom keybad
   */
  const deleteNum = () => {
    if (currentNum === 1) {
      setNum1("");
      setNextNum(currentNum);
    } else if (currentNum === 2) {
      setNum2("");
      setCurrentNum(currentNum - 1);
      setNextNum(nextNum - 1);
    } else if (currentNum === 3) {
      setNum3("");
      setCurrentNum(currentNum - 1);
      setNextNum(nextNum - 1);
    } else if (currentNum === 4) {
      setNum4("");
      setCurrentNum(currentNum - 1);
      setNextNum(nextNum - 1);
    }
  };

  const onSubmit = () => {
    if (verificationCode.length < 4) {
      setErrorText("Code must have 4 digits");
    } else {
      setLoading(true);
      handleSubmit();
    }
  };

  /**
   * Handle submit action based on source.
   */
  const handleSubmit = () => {
    const source = route.params.source;

    if (source.toLowerCase() === "login") {
      verifyFunctionWrapper.login.onSubmit();
    } else if (source.toLowerCase() === "reset") {
      verifyFunctionWrapper.reset.onSubmit();
    } else {
      verifyFunctionWrapper.register.onSubmit();
    }
  };

  /**
   * Object holding functions to handle actions
   * of the 3 sources: login, register and reset password.
   */
  const verifyFunctionWrapper = {
    login: {
      onSubmit: function () {
        UserService.login(
          email,
          password,
          verificationCode,
          this.onSuccess.bind(this),
          this.onFailure.bind(this)
        );
      },

      onSuccess: async function (data) {
        try {
          await addUserEmailToAsyncStorage(email.trim());
          await addTokenToAsyncStorage(data.token);
        } catch (error) {
          return this.onFailure();
        }
        setUser(email.trim(), this.onSetUser.bind(this));
      },

      onSetUser: function () {
        setLoading(false);
        navigation.navigate("HomeLoggedIn");
      },

      onFailure: function (
        message = `Something went wrong. 
      Please try again later`
      ) {
        setLoading(false);
        Alert.alert("Login Failed", message);
      },
    },

    reset: {
      onSubmit: function () {
        setLoading(false);
        navigation.navigate("CreatePassword", {
          email: email,
          code: verificationCode,
        });
      },
    },

    register: {
      onSubmit: function () {
        UserService.enableAccount(
          email,
          verificationCode,
          this.onSuccess,
          this.onFailure
        );
      },

      onSuccess: function () {
        setLoading(false);
        Alert.alert(
          "Account Created",
          "Log in to your account with your email and password"
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      },

      onFailure: function (
        message = `Something went wrong. 
      Please try again later`
      ) {
        setLoading(false);
        Alert.alert("Create Account Failed", message);
      },
    },
  };

  /**
   * Request new verification code.
   */
  const handleRequestCode = () => {
    setLoading(true);
    UserService.requestCode(email, tokenRequestSuccessful, failure);
  };

  const tokenRequestSuccessful = () => {
    setLoading(false);
    Alert.alert("Code Sent");
  };

  const failure = (
    message = `Something went wrong. 
  Please try again later`
  ) => {
    setLoading(false);
    Alert.alert("Code Request Failed", message);
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: "#FFF", flex: 0.13 }} />
      <View style={styles.headerView}>
        <View style={styles.icon}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              type="material-community"
              name="keyboard-backspace"
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Verify</Text>
        <View style={styles.rightContainer}></View>
      </View>
      <View style={styles.inputView}>
        <Text style={styles.inputViewText1}>
          Code sent to {route.params.email}
        </Text>
        <View style={styles.input}>
          <View style={styles.inputBoxes}>
            <Text style={styles.inputBoxText}>{num1}</Text>
          </View>
          <View style={styles.inputBoxes}>
            <Text style={styles.inputBoxText}>{num2}</Text>
          </View>
          <View style={styles.inputBoxes}>
            <Text style={styles.inputBoxText}>{num3}</Text>
          </View>
          <View style={styles.inputBoxes}>
            <Text style={styles.inputBoxText}>{num4}</Text>
          </View>
        </View>
        <Text style={styles.errorText}>{errorText}</Text>
        <TouchableOpacity onPress={handleRequestCode}>
          <Text style={styles.inputViewText1}>
            Didn't receive code? Request again
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          paddingLeft: 40,
          paddingRight: 40,
          backgroundColor: "#FFF",
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        <TouchableOpacity
          style={styles.yellowButton}
          onPress={() => onSubmit()}
        >
          <Text style={globalStyles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keyboardView}>
        {numList.map((section, index) => {
          return (
            <View key={index} style={styles.keyboardRow}>
              {section.map((num, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.keyboardKey}
                    onPress={() => {
                      setNum(nextNum, num);
                      setErrorText("");
                    }}
                  >
                    <Text style={styles.keypadText}>{num}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <View style={styles.keyboardRow}>
          <TouchableOpacity style={styles.keyboardKey}>
            <Text style={styles.keypadText}></Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keyboardKey}
            onPress={() => setNum(nextNum, 0)}
          >
            <Text style={styles.keypadText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keyboardKey}
            onPress={() => deleteNum()}
          >
            <Text style={styles.keypadText}>
              <Icon size={20} name="delete" type="feather" color="#000" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && <Loading />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F2F2",
  },

  headerView: {
    flex: 0.05,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
  },

  rightContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  icon: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "row",
  },

  headerText: {
    fontSize: 23,
    fontWeight: "700",
  },

  backIcon: {
    paddingLeft: 20,
  },

  inputView: {
    flex: 0.4,
    padding: 25,
    paddingLeft: 40,
    paddingRight: 40,
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  inputViewText1: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "LatoRegular",
    fontWeight: "300",
    color: "#808285",
    marginBottom: 45,
  },

  input: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: 235,
    height: 50,
    marginBottom: 10,
  },

  errorText: {
    marginBottom: 45,
    color: "red",
    fontSize: 13,
  },

  inputBoxes: {
    width: 50,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  inputBoxText: {
    fontSize: 20,
  },

  keyboardView: {
    flex: 0.6,
    paddingTop: 50,
  },

  yellowButton: {
    backgroundColor: "#FED876",
    padding: 13,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 30,
  },

  keyboardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  keyboardKey: {
    flex: 0.2,
    marginBottom: 20,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  keypadText: {
    fontSize: 20,
    fontFamily: "LatoBold",
    fontWeight: "300",
  },
});
