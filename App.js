import React from 'react';
import { StyleSheet, Text, View, Button} from 'react-native';
import Map from "./Map"
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

function LoginPage({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Main App"
        onPress={() => navigation.navigate('MainApp')}
      />
    </View>
  );
}

function MainScreen() {
  return (
    <Map />
  );
}

const stack = createNativeStackNavigator();

export default class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <stack.Navigator initialRouteName='Login' screenOptions={{
          headerShown: false
        }}>
          <stack.Screen name="Login" component={LoginPage}/>
          <stack.Screen name="MainApp" component={MainScreen} />
        </stack.Navigator>
      </NavigationContainer>
    )
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
