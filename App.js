import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import Map from "./Map"

export default class App extends React.Component {
  render() {
    return (
      <ActionSheetProvider>
        <Map />
      </ActionSheetProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
