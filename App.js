import React from 'react';
import Map from "./Map"
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './Login';

function LoginPage({navigation}) {
  return LoginScreen(navigation);
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
