/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';

import AuthLoading from './src/AuthLoading';
import Login from './src/Login';
import Main from './src/Main';
import Register from './src/Register';
import QRScanner from './src/QRScanner';

import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

const RootStack = createSwitchNavigator(
  {
    AuthLoading,
    Login,
    Register,
    Main,
    QRScanner
  },
  {
    initialRouteName: 'AuthLoading'
  }
)

const App = createAppContainer(RootStack);
export default App;
