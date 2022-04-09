import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { Icon } from "react-native-elements";
import {
  getDetailedDisplay,
  toggleDetailedDisplay,
  getTwoFactor,
  toggleTwoFactor,
  deleteUser,
} from "../settings/settings.js";
import { useFocusEffect } from "@react-navigation/native";
import UserService from "../services/UserService.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import Loading from "../components/Loading.js";

export default function SettingsScreen({ navigation }) {
  const netInfo = useNetInfo();
  const [isDetailedEnabled, setIsDetailedEnabled] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  let isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      getDetailedDisplay(setDetailEnabledCallBack);
      getTwoFactor(setTwoFactorCallBack);
    })
  );

  useEffect(() => {
    getUser().then((user) => {
      setUserEmail(user);
    });
  }, [userEmail]);

  const getUser = async () => {
    let user;
    try {
      user = await AsyncStorage.getItem("email");
    } catch (error) {
      console.log(error);
    }
    return user;
  };

  const setDetailEnabledCallBack = (bool) => {
    if (isMounted.current)
      setIsDetailedEnabled(bool);
  };

  const setTwoFactorCallBack = (bool) => {
    if (isMounted.current)
      setTwoFactor(bool);
  };

  const handleNavigateToBackupSettings = () => {
    navigation.navigate("Backup");
  };

  const toggleDetailedEnabled = () => {
    toggleDetailedDisplay(setDetailEnabledCallBack);
  };

  const toggleTwoFactorEnabled = () => {
    if (netInfo.isConnected)
      toggleTwoFactor(setTwoFactorCallBack, syncWithServerCallBack);
    else
      Alert.alert(
        "No Internet",
        "Internet connectivity is required to perform this action"
      );
  };

  const syncWithServerCallBack = (bool) => {
    UserService.enableTwoFactor(userEmail, bool, enableTwoFactorError);
  };

  const enableTwoFactorError = () => {
    const action = twoFactor ? "Disable" : "Enable";
    Alert.alert(
      `Failed to ${action} 2FA`,
      "Something went wrong. Please try again later"
    );
    //Revert
    toggleTwoFactor(setTwoFactorCallBack, () => {});
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account? " +
        "This action cannot be done",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setLoading(true);
            UserService.delete(deleteSuccessful, deleteFailure);
          },
        },
      ]
    );
  };

  const deleteSuccessful = () => {
    //Delete Local
    deleteUser(() => {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    });
  };

  const deleteFailure = (
    message = `Something went wrong. Please try again later`
  ) => {
    setLoading(false);
    Alert.alert("Delete Account Failed", message);
  };

  const openPrivacyPolicy = () => {
    navigation.navigate("Privacy");
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Settings</Text>
        </View>
      </View>
      <View style={styles.settingsComponents}>
        <Text style={{ color: "#58595B", fontSize: 15, marginBottom: 10 }}>
          Preferences
        </Text>
        <TouchableOpacity style={styles.settingsComponent} activeOpacity={0.8}>
          <Text style={styles.settingsText}>Detailed View</Text>
          <Switch
            trackColor={{ false: "#F1F2F2", true: "#00DC7D" }}
            thumbColor={"#fff"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleDetailedEnabled}
            value={isDetailedEnabled}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsComponent} activeOpacity={0.8}>
          <Text style={styles.settingsText}>Two-Factor Authentication</Text>
          <Switch
            trackColor={{ false: "#F1F2F2", true: "#00DC7D" }}
            thumbColor={"#fff"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTwoFactorEnabled}
            value={twoFactor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsComponent}
          activeOpacity={0.5}
          onPress={() => handleNavigateToBackupSettings()}
        >
          <Text style={styles.settingsText}>Backup</Text>
          <Icon name="chevron-right" type="material-community" color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsComponents}>
        <Text style={{ color: "#58595B", fontSize: 15, marginBottom: 10 }}>
          Account
        </Text>
        <TouchableOpacity
          style={styles.settingsComponent}
          activeOpacity={0.5}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.settingsText, { color: "red" }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsComponent} activeOpacity={0.5}
        onPress={openPrivacyPolicy}>
          <Text style={styles.settingsText}>Privacy Policy</Text>
          <Icon name="chevron-right" type="material-community" color="#000" />
        </TouchableOpacity>
      </View>
      {loading && <Loading />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 30,
    backgroundColor: "#F2F2F2",
  },

  titleText: {
    fontSize: 20,
    fontFamily: "LatoBold",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  mainContainer: {
    flex: 0.3,
    paddingBottom: 2,
    borderBottomWidth: 0.3,
    borderBottomColor: "#BCBEC0",
  },

  settingsComponents: {
    paddingTop: 30,
  },

  settingsComponent: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingLeft: 10,
    borderBottomColor: "#D1D3D4",
    borderBottomWidth: 0.4,
  },

  settingsText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
});
