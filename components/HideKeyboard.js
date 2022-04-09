import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

/**
 * Component to dismiss keyboard on press.
 * 
 * @param {array} children children to be rendered within component
 * @returns HideKeyboard component
 */
export const HideKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);
