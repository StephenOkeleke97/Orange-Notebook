import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { globalStyles } from "../styles/global";

/**
 * Application home screen.
 * @param {Object} navigation navigation object 
 * @returns 
 */
export default function HomeScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <View style={styles.logoView}>
        <Image
          source={require("../assets/images/homeImage1.png")}
          style={styles.homeImage}
        />
      </View>
      <View style={styles.welcomeView}>
        <Text style={globalStyles.headerText}>Welcome to Orange Notebook!</Text>
        <Text style={styles.welcomeBodyText}>
          Easily Manage Your Notes On Your Phone & You Can Have Infinite Notes Too
        </Text>
        <TouchableOpacity
          style={globalStyles.yellowButton}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={globalStyles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={styles.alreadyRegisteredText}
            onPress={() => navigation.navigate("Login")}
          >
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoView: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  homeImage: {
    width: 300,
    height: 300,
    marginTop: 30,
  },

  welcomeView: {
    flex: 0.4,
    paddingLeft: 30,
    paddingRight: 30,
  },

  welcomeBodyText: {
    paddingTop: 30,
    paddingBottom: 20,
    textAlign: "center",
    color: "#808285",
    fontWeight: "500",
    fontFamily: "LatoRegular",
    fontSize: 14,
  },

  alreadyRegisteredText: {
    textAlign: "center",
    fontWeight: "500",
  },
});
