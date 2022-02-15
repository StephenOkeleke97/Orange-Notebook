import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f9",
  },

  yellowButton: {
    backgroundColor: "#FED876",
    padding: 13,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 35,
    flexDirection: "row",
  },

  buttonText: {
    color: "#000",
    fontWeight: "500",
  },

  headerText: {
    fontSize: 25,
    fontFamily: "LatoBold",
    fontWeight: "700",
    textAlign: "center",
  },
});
