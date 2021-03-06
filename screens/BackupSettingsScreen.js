import React, { useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Switch,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getBackupFrequency,
  getLastBackUpDate,
  getLastBackUpSize,
  setLastBackupDate,
  setLastBackupSize,
  getBackupEnabled,
  toggleBackupEnabled,
  parseDate,
} from "../settings/settings.js";
import { Icon } from "react-native-elements";
import { globalStyles } from "../styles/global";
import UserService from "../services/UserService.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Screen for handling Backup interactions.
 *
 * @param {Object} navigation navigation object
 * @returns BackupSettingsScreen component
 */
const BackupSettingsScreen = ({ navigation }) => {
  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  /**
   * Boolean to indicate when a backup action (backup, restore and delete)
   * is in progress. Useful for animating the progress icon.
   */
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupFrequencyLabel, setBackupFrequencyLabel] = useState("Daily");
  /**
   * Variable to hold the date of last Backup
   */
  const [lastDate, setLastDate] = useState("");
  /**
   * Variable to hold the size of last Backup
   */
  const [lastSize, setLastSize] = useState(0);
  /**
   * Indicate the progress when uploading or downloading a backup.
   */
  const [progressPercent, setProgressPercent] = useState(0 + " %");
  /**
   * Used by switch component to indicate whether
   * or not auto backup is enabled.
   */
  const [backupEnabled, setBackupEnabled] = useState(false);

  const [userEmail, setUserEmail] = useState("");

  /**
   * Grey out button to BackupSettingsFrequency screen
   * if auto backup is disabled.
   */
  const backupFrequencyActiveOpacity = backupEnabled ? 0.3 : 1;
  let isMounted = useRef(true);

  /**
   * Keep track of component mount status to prevent
   * updating an unmounted component.
   */
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Get user email from AsyncStorage when component
   * is loaded.
   */
  useEffect(() => {
    getUser().then((user) => {
      setUserEmail(user);
    });
  }, [userEmail]);

  /**
   * Get last back up date and size on focus.
   */
  useFocusEffect(
    React.useCallback(() => {
      getBackupEnabled(setBackupEnabledCallBack);
      getBackupFrequency((frequency) => setBackupFrequencyLabel(frequency));

      getLastBackUpDate((date) => {
        if (date === null) setLastDate("None");
        else setLastDate(date);
      });
      getLastBackUpSize((size) => {
        if (size === null) setLastSize(0);
        else setLastSize(size);
      });
    })
  );

  /**
   * Start or stop animation when backup status
   * changes.
   */
  useEffect(() => {
    if (backupInProgress) startImageRotateFunction();
    else rotateAnimation.stopAnimation();
  }, [backupInProgress]);

  /**
   * Get user email.
   *
   * @returns promise that returns user when fulfilled
   */
  const getUser = async () => {
    let user;
    try {
      user = await AsyncStorage.getItem("email");
    } catch (error) {
      console.log(error);
    }
    return user;
  };

  /**
   * Callback to trigger switch when backup is
   * successfully enabled.
   *
   * @param {boolean} bool true if backup is enabled or false otherwise
   */
  const setBackupEnabledCallBack = (bool) => {
    setBackupEnabled(bool);
  };

  /**
   * Toggle backup setting in database.
   */
  const toggleBackUp = () => {
    toggleBackupEnabled(setBackupEnabledCallBack);
  };

  /**
   * Update progress of backup download or upload
   * to server.
   *
   * @param {int} percent percent completed
   */
  const updateProgress = (percent) => {
    if (isMounted.current) setProgressPercent(percent);
  };

  /**
   * Action refers to one of Back Up,
   * Restore and Delete.
   */
  const actionSuccessful = (action) => {
    setBackupInProgress(false);
    Alert.alert("", `${action} Successful`);
  };

  /**
   * Action refers to one of Back Up,
   * Restore and Delete.
   */
  const actionFailed = (
    action,
    message = "Something went wrong. Please try again later"
  ) => {
    setBackupInProgress(false);
    Alert.alert(`${action} Failed`, message);
  };

  /**
   * Backup database to server.
   * Triggers a confirmation.
   */
  const handleBackUpToServer = () => {
    Alert.alert(
      "Back Up Notes",
      "Are you sure you want to back up notes now? Completing this" +
        " action will overwrite any old backups.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Back Up",
          onPress: () => {
            setProgressPercent(0);
            setBackupInProgress(true);
            UserService.backUp(
              userEmail,
              actionSuccessful,
              actionFailed,
              updateProgress
            );
          },
        },
      ]
    );
  };

  /**
   * Restore backup from server. Action runs
   * in the background.
   * Triggers confirmation.
   */
  const handleRestoreFromServer = () => {
    Alert.alert(
      "Restore Backup",
      "Are you sure you want to restore backup? Completing this " +
        "action will overwrite all notes on this device. This action will be " +
        "completed in the background.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
          onPress: () => {
            setProgressPercent(0);
            setBackupInProgress(true);
            UserService.restoreBackup(
              actionSuccessful,
              actionFailed,
              updateProgress,
            );
          },
        },
      ]
    );
  };

  /**
   * Delete backup from server.
   * Triggers confirmation.
   */
  const handleDeleteFromServer = () => {
    Alert.alert(
      "Delete Backup",
      "Are you sure you want to delete backup? Once deleted, " +
        "back up files can never be recovered.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setProgressPercent("deleting...");
            setBackupInProgress(true);

            UserService.deleteBackup(actionSuccessful, actionFailed);
          },
        },
      ]
    );
  };

  const handleBackToSettings = () => {
    navigation.goBack();
  };

  /**
   * Navigate to BackupSettingsFrequency Screen.
   */
  const handleSelectFrequency = () => {
    if (backupEnabled) {
      navigation.navigate("BackupFrequency");
    }
  };

  /**
   * Start animation of backup progress icon.
   */
  const startImageRotateFunction = () => {
    rotateAnimation.setValue(0);
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start((animation) => {
      if (animation.finished) startImageRotateFunction();
    });
  };

  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const animatedStyle = {
    transform: [
      {
        rotate: interpolateRotating,
      },
    ],
    borderRadius: 50,
  };

  const backupFrequencyTextStyle = {
    color: backupEnabled ? "#000" : "#D1D3D4",
  };

  const backupFrequencyText = {
    fontSize: 15,
    color: backupEnabled ? "#939598" : "#D1D3D4",
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.navTab}>
          <TouchableOpacity
            style={styles.backNavContainer}
            onPress={() => handleBackToSettings()}
          >
            <View style={styles.backButtonContainer}>
              <Icon
                name="arrow-left"
                type="material-community"
                size={18}
                color="#1771F1"
              />
            </View>
            <Text style={styles.navTitleText}>Settings</Text>
          </TouchableOpacity>

          <View style={styles.navHeaderContainer}>
            <Text style={styles.navHeaderText}>Back Up</Text>
          </View>

          <View style={styles.backNavContainer} />
        </View>

        <View style={styles.backupStatusContainer}>
          <View style={styles.progressContainer}>
            <View style={styles.progress}>
              <Animated.View style={animatedStyle}>
                <Icon
                  type="material-community"
                  name="refresh"
                  size={35}
                  color="#BCBEC0"
                />
              </Animated.View>
            </View>
            <View style={styles.progressDescription}>
              <Text style={styles.progressDescriptionText}>
                Last Backup: {lastDate}
              </Text>
              <Text style={styles.progressDescriptionText}>
                Total Size: {lastSize} mb
              </Text>
              {backupInProgress && (
                <Text style={styles.progressDescriptionText}>
                  Progress: {progressPercent}
                </Text>
              )}
            </View>
          </View>
          <View>
            <Text>
              Back up your note history so if you lose your phone or switch to a
              new one, your note history is safe. You can restore your note
              history by pressing the Restore Backup button below.
            </Text>
          </View>
        </View>
        <View style={styles.backupFeaturesContainer}>
          <TouchableOpacity
            style={styles.backupFeatures}
            activeOpacity={0.5}
            onPress={() => handleBackUpToServer()}
          >
            <Text style={styles.settingsText}>Back Up Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backupFeatures}
            activeOpacity={0.5}
            onPress={() => handleRestoreFromServer()}
          >
            <Text style={styles.settingsText}>Restore Backup</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backupFeatures}
            activeOpacity={0.5}
            onPress={() => handleDeleteFromServer()}
          >
            <Text style={[styles.settingsText, { color: "red" }]}>
              Delete Backup
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[styles.backupFeatures, styles.autoBackup]}
            activeOpacity={0.8}
          >
            <Text style={[styles.settingsText, { color: "#000" }]}>
              Auto Backup
            </Text>
            <Switch
              trackColor={{ false: "#F1F2F2", true: "#00DC7D" }}
              thumbColor={"#fff"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleBackUp}
              value={backupEnabled}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backupFeatures, styles.autoBackup]}
            activeOpacity={backupFrequencyActiveOpacity}
            onPress={() => handleSelectFrequency()}
          >
            <Text style={backupFrequencyTextStyle}>Backup Frequency</Text>
            <View style={styles.backupFrequencyContainer}>
              <Text style={backupFrequencyText}>{backupFrequencyLabel}</Text>
              <Icon
                name="chevron-right"
                type="material-community"
                color={backupEnabled ? "#939598" : "#D1D3D4"}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 60,
  },

  navTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "35%",
  },

  navHeaderContainer: {
    alignItems: "center",
    width: "30%",
  },

  navHeaderText: {
    fontSize: 19,
    fontWeight: "600",
  },

  backButtonContainer: {
    marginRight: 3,
  },

  navTitleText: {
    fontSize: 14,
    color: "#1771F1",
  },

  backupStatusContainer: {
    paddingTop: 20,
    paddingBottom: 30,
  },

  progressContainer: {
    flexDirection: "row",
    padding: 12,
    paddingLeft: 0,
  },

  progress: {
    width: "23%",
    borderRadius: 12,
    backgroundColor: "#E6E7E8",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
  },

  progressDescription: {
    flex: 1,
    paddingLeft: 20,
  },

  progressDescriptionText: {
    color: "#808285",
  },

  backupFeaturesContainer: {
    paddingBottom: 30,
  },

  backupFeatures: {
    height: 50,
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingLeft: 10,
    borderBottomColor: "#D1D3D4",
    borderBottomWidth: 0.4,
  },

  settingsText: {
    fontWeight: "500",
    color: "#5199FF",
  },

  autoBackup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backupFrequencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default BackupSettingsScreen;
