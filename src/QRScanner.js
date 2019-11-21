import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

const ASCEND_CALORIES = 3;
const DESCEND_CALORIES = 2;

const LEVELS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export default class QRScanner extends Component {
  constructor(props) {
      super(props);
      this.state = {
        userId: 0,
        loading: true,
        start: true,
        lastLevel: 0,
      };
  }

  getUser(userId) {
    axios.request({
      method: 'GET',
      url: `https://telkomsel-ho-fit.herokuapp.com/users/${this.state.userId}`,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then((res) => {
      console.log({ data: res.data });
      this.setState({ loading: false });
      this.setState({
        start: res.data.start,
        lastLevel: res.data.last_level ? res.data.last_level : 0,
      });
    }).catch((err) => {
      this.setState({ loading: false  });

      Alert.alert('Error', err.toString());
    });
  }

  componentDidMount = async () => {
    const userId = await AsyncStorage.getItem('userId');

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    this.setState({ userId });

    this.getUser(userId);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
      this.props.navigation.navigate('Main');
      return true;
  }

  calculateCalorieQR = (floorStartQR, floorEndQR) => {
    console.log({floorStartQR, floorEndQR});

    let floorDiff = floorEndQR - floorStartQR;

    let calories = 0;
    if (floorDiff >= 0) {
      calories = Math.abs(ASCEND_CALORIES * floorDiff);
    } else {
      calories = Math.abs(DESCEND_CALORIES * floorDiff);
    }

    return calories;
  }

  setLevel = async (levelNumber) => {
    console.log(`https://telkomsel-ho-fit.herokuapp.com/users/${this.state.userId}`);
    await axios.request({
      method: 'PUT',
      url: `https://telkomsel-ho-fit.herokuapp.com/users/${this.state.userId}`,
      data: {
        last_level: levelNumber,
        start: true,
      },
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then((res) => {
      console.log("SET LEVEL");
      this.setState({ loading: false });
    }).catch((err) => {
      this.setState({ loading: false });
      console.log(err);
      Alert.alert('Error', err.toString());
    });
  }

  endLevel = async (levelNumber) => {
    let levelStart = 1;

    await axios.request({
      method: 'PUT',
      url: `https://telkomsel-ho-fit.herokuapp.com/users/${this.state.userId}`,
      data: {
        start: false,
      },
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then((res) => {
      levelStart = res.data.last_level;

      console.log("END LEVEL");
    }).catch((err) => {
      Alert.alert('Error', err.toString());
    });

    const idxStart = LEVELS.indexOf(levelStart);
    const idxEnd = LEVELS.indexOf(levelNumber);
    const diffLevel = Math.abs(idxStart - idxEnd);

    const calories = this.calculateCalorieQR(idxStart, idxEnd);

    await axios.request({
      method: 'PUT',
      url: `https://telkomsel-ho-fit.herokuapp.com/high_scores/${this.state.userId}`,
      data: {
        high_score: {
      		score: calories
      	},
      	level: diffLevel
      },
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then((res) => {
      this.setState({ loading: false });
    }).catch((err) => {
      this.setState({ loading: false });

      Alert.alert('Error', err.toString());
    });
  }

  onSuccess = async (e) => {
    console.log(e);

    const levelNumber = parseInt(e.data);

    this.setState({ loading: true });

    if (this.state.start) {
      await this.endLevel(levelNumber);
    } else {
      await this.setLevel(levelNumber);
    }

    this.props.navigation.navigate('Main');
  }

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <ActivityIndicator size="large" color="#00ff00" />
      );
    } else {
      return (
        <QRCodeScanner
          onRead={this.onSuccess}
          topContent={
            <View style={styles.containerTopContent}>
              <Text style={styles.centerText}>
                Go to the staircase and scan the QR code.
              </Text>
            </View>
          }
          bottomContent={
            <View style={styles.containerTopContent}/>
          }
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  centerText: {
    fontSize: 18,
    textAlign: 'center'
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  containerTopContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
