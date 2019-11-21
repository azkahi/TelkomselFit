import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    Picker,
    FlatList,
    Alert,
    ActivityIndicator,
    BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Fab, Container, Content, Button, Header, Left, Body, Icon, Right } from 'native-base';
import TopBarNav from 'top-bar-nav';
import axios from 'axios';

const QUOTES = ['Good job bro/sis, let’s try another 100 steps to make your day', 'Reducing carbo intake will improve your blood sugar level', 'Avocado contain a very good nutrient for your heart', 'Drink 4 litre a day will help you to focus', 'Sleep at least 7 hour to have fresh start for the day']

const ASCEND_CALORIES = 3;
const DESCEND_CALORIES = 2;

const LEVELS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const AVG_ELEVATOR_WAIT_TIME = 300; // seconds
const AVG_ELEVATOR_WAIT_TIME_PER_LEVEL = 3; // seconds
const AVG_STAIR_CLIMB_TIME_PER_LEVEL = 25; //seconds

const uniqueID = [];

const makeID = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }

  if (uniqueID.includes(text)) {
    return makeID(length);
  }
    uniqueID.push(text);
    return text;
};

const isObjectEmpty = (a) => Object.keys(a).length === 0 && a.constructor === Object;

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: 0,
            quoteIdx: Math.floor(Math.random() * 5),
            currentLevel: { value: 1, idx: 0 },
            targetLevel: { value: 1, idx: 0 },
            calories: 0,
            floorDiff: 0,
            elevatorTime: 0,
            stairTime: 0,
            modeStart: false,
            endJourney: false,
            calorieQR: 0,
            floorStartQR: -1,
            floorEndQR: 0,
            name: '',
            listParticipant: [],
            highScores: [],
        };
    }

    getHighScores() {
      axios.request({
        method: 'GET',
        url: `https://telkomsel-ho-fit.herokuapp.com/high_scores`,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        this.setState({ isLoading: this.state.isLoading + 1 });
        this.setState({
          highScores: res.data,
        });
      }).catch((err) => {
        this.setState({ isLoading: this.state.isLoading + 1  });
        console.log(err);
        Alert.alert('Error', err.toString());
      });
    }

    getUser(userId) {
      axios.request({
        method: 'GET',
        url: `https://telkomsel-ho-fit.herokuapp.com/users/${userId}`,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        console.log({ data: res.data });
          this.setState({ isLoading: this.state.isLoading + 1 });
        this.setState({
          modeStart: res.data.start,
          floorStartQR: res.data.last_level
        });
      }).catch((err) => {
        this.setState({ isLoading: this.state.isLoading + 1 });

        console.log(err);
        Alert.alert('Error', err.toString());
      });
    }

    getScore(userId) {

      axios.request({
        method: 'POST',
        url: `https://telkomsel-ho-fit.herokuapp.com/get_score`,
        data: {
          id: userId,
        },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        timeout: 10000 // Timeout after 10 seconds
      }).then((res) => {
        this.setState({ isLoading: this.state.isLoading + 1 });
        this.setState({
          calorieQR: res.data.score,
          name: res.data.name,
        });
      }).catch((err) => {
        this.setState({ isLoading: this.state.isLoading + 1  });
        console.log(err);
        Alert.alert('Error', err.toString());
      });
    }

    componentDidMount = async () => {
      const { navigation } = this.props;
      const userId = await AsyncStorage.getItem('userId');

      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

      console.log(userId);

      this.getUser(userId);
      this.getScore(userId);
      this.getHighScores();
    }

    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('Login');
        return true;
    }

    ROUTESTACK = [
      {
        element:
          <View style={styles.containerTopBarNav}>
            <Image source={require('../assets/images/stairs.png')} style={styles.imageTopBarNav}/>
            <Text style={styles.titleTab}>Mobility</Text>
          </View>,
        title: 'mobility',
      },
      {
        element:
          <View style={styles.containerTopBarNav}>
            <Image source={require('../assets/images/mobility.png')} style={styles.imageTopBarNav}/>
            <Text style={styles.titleTab}>GO</Text>
          </View>,
        title: 'go',
      },
      {
        element:
          <View style={styles.containerTopBarNav}>
            <Image source={require('../assets/images/leaderboard.png')} style={styles.imageTopBarNav}/>
            <Text style={styles.titleTab}>Leaderboard</Text>
          </View>,
          title: 'leaderboard',
      },
    ];

    populateLevels = (level) => {
      return <Picker.Item key={makeID(5)} label={`Floor #${level}`} value={`${level}`} />
    }

    calculateLevelTimeCalorie = () => {
      const { targetLevel, currentLevel } = this.state;

      let floorDiff = targetLevel.idx - currentLevel.idx;

      let calories = 0;
      if (floorDiff >= 0) {
        calories = Math.abs(ASCEND_CALORIES * floorDiff);
      } else {
        calories = Math.abs(DESCEND_CALORIES * floorDiff);
      }

      let elevatorTime = AVG_ELEVATOR_WAIT_TIME + Math.abs(floorDiff) * AVG_ELEVATOR_WAIT_TIME_PER_LEVEL;

      let stairTime = AVG_STAIR_CLIMB_TIME_PER_LEVEL * Math.abs(floorDiff);

      this.setState({
        calories,
        floorDiff,
        stairTime,
        elevatorTime
      });
    }

    onSelectedLevelPickerChange = (value, idx, strType) => {
      let resVal = { value, idx };
      this.setState({ [strType]: resVal },
      () => this.calculateLevelTimeCalorie() );
    }

    renderMobilityTab = () => {
      return (
        <View style={styles.tabContentContainer}>
          <Text style={styles.centeredTextBold}>Where are you?</Text>
          <View style={styles.dropDownPicker}>
            <Picker
              mode="dropdown"
              selectedValue={this.state.currentLevel.value}
              onValueChange={(value, idx) => this.onSelectedLevelPickerChange(value, idx, 'currentLevel') }
            >
              { LEVELS.map((level) => this.populateLevels(level)) }
            </Picker>
          </View>

          <Text style={styles.centeredTextBold}>Where are you headed?</Text>
          <View style={styles.dropDownPicker}>
            <Picker
              mode="dropdown"
              selectedValue={this.state.targetLevel.value}
              onValueChange={(value, idx) => this.onSelectedLevelPickerChange(value, idx, 'targetLevel') }
            >
              { LEVELS.map((level) => this.populateLevels(level)) }
            </Picker>
          </View>

          { this.state.floorDiff >= 0 ? <Text style={styles.centeredTextRegular}>You'll climb <Text style={{ fontFamily: 'Montserrat-Bold'}}>{this.state.floorDiff}</Text> level of stairs.</Text> : <Text style={styles.centeredTextRegular}>You'll descend <Text style={{ fontFamily: 'Montserrat-Bold'}}>{Math.abs(this.state.floorDiff)}</Text> level of stairs.</Text> }

          <Text style={styles.centeredTextRegular}> You'll burn about <Text style={{ fontFamily: 'Montserrat-Bold'}}>{this.state.calories}</Text> { this.state.calories > 1 ? 'calories' : 'calorie' }</Text>

          <Text style={styles.centeredTextRegular}> Going with elevator will take about <Text style={{ fontFamily: 'Montserrat-Bold'}}>{this.state.elevatorTime}</Text> { this.state.calories > 1 ? 'seconds' : 'second' }</Text>

          <Text style={styles.centeredTextRegular}> Going with stairs will take about <Text style={{ fontFamily: 'Montserrat-Bold'}}>{this.state.stairTime}</Text> { this.state.calories > 1 ? 'seconds' : 'second' }</Text>

          <View style={styles.footerMobility}>
            <View style={styles.textBox}>
              <Text style={styles.footerText}>
                {`${QUOTES[this.state.quoteIdx]}\n`} - Doc Jim
              </Text>
            </View>
          </View>
        </View>
      );
    }

    calculateCalorieQR = (floorEndQR) => {
      const { floorStartQR } = this.state;

      console.log({floorStartQR, floorEndQR});

      let floorDiff = floorEndQR - floorStartQR;

      let calories = 0;
      if (floorDiff >= 0) {
        calories = Math.abs(ASCEND_CALORIES * floorDiff);
      } else {
        calories = Math.abs(DESCEND_CALORIES * floorDiff);
      }

      console.log({calories});

      this.setState({
        calorieQR: this.state.calorieQR + calories
      });
    }

    setLevelQR = (level) => {
      const { modeStart } = this.state;
      console.log({level});
      const idx = LEVELS.indexOf(level);

      console.log(idx);
      console.log(modeStart);

      if (modeStart) {
        this.setState({
          floorStartQR: idx,
          endJourney: false,
        },
        console.log(this.state.floorStartQR));
      } else {
        this.setState({
          endJourney: true,
        },
        this.calculateCalorieQR(idx));
      }
    }

    goToScanQR = () => {
      const { modeStart} = this.state;

      this.props.navigation.navigate('QRScanner');
    }

    displayJourney = () => {
      const { modeStart, floorStartQR } = this.state
      const width = Dimensions.get('window').width;

      if (modeStart) {
        return (
          <View style={styles.calorieCounterContainer}>
            <Text style={[styles.centeredTextBold, {fontSize: 20}]}>I started at floor #{floorStartQR}</Text>
            <Image source={require('../assets/images/heartbeat.gif')} style={{marginHorizontal: 50, height: 200, resizeMode: 'stretch'}}/>
          </View>
        );
      }
    }

    renderGoTab = () => {
      return (
        <View style={[styles.tabContentContainer, { justifyContent: 'center', alignItems: 'center'}]}>
          <View style={styles.calorieCounterContainer}>
            <Text style={[styles.centeredTextBold, {fontSize: 20}]}>Hi, {this.state.name}! </Text>
            <Text style={[styles.centeredTextBold, {fontSize: 20, marginBottom: 10}]}>You have burned {this.state.calorieQR} Cal.</Text>
          </View>
          { this.displayJourney() }
          <TouchableOpacity style={styles.buttonScanQR} onPress={() => this.goToScanQR()}>
            <Image source={require('../assets/images/qr_code.png')} style={styles.imageScanQR}/>
            <Text style={[styles.centeredTextBold, { fontSize: 20 }]}>{ this.state.modeStart ? 'End Journey' : 'Start Journey'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    renderItemLeaderboard = (item) => {
      return (
        <>
          { item.name == this.state.name ?
            <View style={[styles.profileGroup, {backgroundColor: 'yellow'}]}>
                <Text style={styles.profileLable}>Username: {item.name}</Text>
                <Text selectable style={[styles.profileText, {alignSelf: 'flex-end'}]}>Score: {item.score}</Text>
            </View>
            :
            <View style={styles.profileGroup}>
                <Text style={styles.profileLable}>Username: {item.name}</Text>
                <Text selectable style={[styles.profileText, {alignSelf: 'flex-end'}]}>Score: {item.score}</Text>
            </View>
          }
        </>
      )
    }

    renderLeaderboardTab = () => {

      return (
        <FlatList
        data={this.state.highScores}
        renderItem={({ item }) => ( this.renderItemLeaderboard(item) )}
        keyExtractor={item => makeID(5)}
      />
      );
    }

    renderBarContent(route) {
      const { navigation, user, token } = this.props;

      switch (route.title) {
        case 'mobility':
          return ( this.renderMobilityTab() );
          break;
        case 'go':
          return ( this.renderGoTab() );
        case 'leaderboard':
          return ( this.renderLeaderboardTab() );
        default:
          break;
      }
    }

    renderTopBarContent(route) {
      return (
        <View style={[styles.profileDesc]}>
            { this.renderBarContent(route) }
        </View>
      );
    }

    render() {
        const { navigation, user, token } = this.props;
        const { isLoading, modalError, textWarnError, errorMessage, modalConfirm, titleConfirm, infoConfirm, laterActionConfirm, closeActionConfirm } = this.state;

        return (
            <Container style={styles.container}>
            <Header
              transparent style={[styles.viewStyle, styles.headerStyledStyle]}
              androidStatusBarColor={'#E4322F'}
              iosBarStyle={'dark-content'}
            >
              <Left style={{ flex: 1 }}>
                <Button transparent onPress={() => this.props.navigation.goBack()}>
                  <Icon name="ios-arrow-back" style={{ color: 'white' }} />
                </Button>
              </Left>
              <Body style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.headerStyledText]}>Mobility</Text>
              </Body>
              <Right style={{ flex: 1 }} />
            </Header>

                <View style={styles.containerInner}>


                  <TopBarNav
                    // routeStack and renderScene are required props
                    routeStack={this.ROUTESTACK}
                    renderScene={(route, i) => {
                      // This is a lot like the now deprecated Navigator component
                      return this.renderTopBarContent(route);
                    }}
                    // Below are optional props
                    headerStyle={[styles.headerStyle]} // probably want to add paddingTop if using TopBarNav for the  entire height of screen to account for notches/status bars
                    labelStyle={styles.labelStyle}
                    underlineStyle={styles.underlineStyle}
                    imageStyle={styles.imageStyle}
                    sidePadding={40} // Can't set sidePadding in headerStyle because it's needed to calculate the width of the tabs
                    inactiveOpacity={1}
                    fadeLabels={true}
                  />
                </View>

                {isLoading < 3 ? <View style={styles.loading}><ActivityIndicator size="large" color="#00ff00" /></View> : null}

            </Container>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5E5E5',
        position: 'relative'
    },
    containerInner: {
        flex: 1,
        position: 'relative'
    },
    profileName: {
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        width: '75%',
        paddingBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
    },
    profileNameText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Montserrat-SemiBold',
        textAlign: 'center'
    },
    profileDescWrapper: {
        marginTop: 30,
    },
    profileDesc: {
        flex: 1,
        backgroundColor: '#fff',
        marginBottom: 10
    },
    profileDescScroll: {
      flex: 1,
    },
    boxedContainer: {
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'black',
      margin: 10,
    },
    profileGroup: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileLable: {
        color: '#434343',
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
        margin: 10
    },
    titleTab: {
      fontFamily: 'Montserrat-Bold',
      color: 'white',
      fontSize: 10,
      textAlign: 'center'
    },
    titleLabel: {
        color: '#434343',
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        marginTop: 10,
    },
    profileText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#000',
        textAlign: 'right',
        margin: 10
    },
    boxWrapper: {
        backgroundColor: '#fff',
        marginBottom: 10,
        paddingBottom: 10
    },
    featuRed: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#434343',
    },
    navItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    navText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 13,
        color: '#303030'
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    footerButtonInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#00B894',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 4
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        paddingRight: 5
    },
    iconHelp: {
        width: 27,
        height: 31
    },
    version: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
        color: '#787878'
    },
    buttonEditPic: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: '#ddd',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconPencil: {
        color: '#787878',
        fontSize: 14
    },
    headerStyle: {
  		backgroundColor: '#E4322F',
  	},
    labelStyle: {
      fontFamily: 'Montserrat-Bold',
  		fontSize: 15,
  		color: 'white'
  	},
  	imageStyle: {
  		height: 20,
  		width: 20,
  		tintColor: '#e6faff'
  	},
    underlineStyle: {
  		height: 3.6,
  		backgroundColor: 'white',
  		width: 100
  	},
    containerTopBarNav: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageTopBarNav: {
      width: 24,
      height: 24,
      margin: 5
    },
    buttonMoreInfo: {
      flex: 1,
      marginVertical: 10,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: '#E30613',
    },
    textMoreInfo: {
      fontFamily: 'Montserrat-Bold',
      fontSize: 14,
      color: 'white',
      textAlign: 'center'
    },
    headerStyledStyle: {
  		backgroundColor: '#E4322F',
  	},
    headerStyledText: {
      color: 'white',
    },
    dropDownPicker: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#BFBFBF',
      width: 300,
      marginVertical: 5,
      alignSelf: 'center'
    },
    tabContentContainer: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    centeredTextBold: {
      marginTop: 20,
      fontFamily: 'Montserrat-Bold',
      fontSize: 12,
      textAlign: 'center'
    },
    centeredTextRegular: {
      marginTop: 20,
      fontFamily: 'Montserrat-Regular',
      fontSize: 12,
      textAlign: 'center'
    },
    imageScanQR: {

    },
    imageCalorie: {
      width: 10,
      height: 10,
      resizeMode: 'contain'
    },
    calorieCounterContainer: {
      flexDirection: 'column'
    },
    buttonScanQR: {
      borderRadius: 6,
      borderWidth: 1,
      padding: 10
    },
    footerMobility: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    textBox: {
      margin: 20,
      padding: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#E30613',
    },
    footerText: {
      fontFamily: 'Montserrat-Regular',
      fontSize: 20,
      textAlign: 'center'
    },
    viewStyle: {
      flexDirection: 'row',
      borderBottomWidth: 0
    },
    textContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 2
    },
    textStyle: {
      fontSize: 15,
      color: 'black',
      fontFamily: 'Montserrat-Bold',
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center'
    }
});
