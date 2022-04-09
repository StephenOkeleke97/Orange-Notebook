import { View, StyleSheet, ActivityIndicator } from "react-native";
import React from "react";

/**
 * Loading screen that overlays elements 
 * to prevent touch action during loading.
 * Uses an activity monitor to indicate loading.
 * 
 * @returns Loading component
 */
export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={"#000"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
