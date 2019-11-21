import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  YellowBox,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Fab, Container, Content, Button, Header, Left, Body, Icon, Right } from 'native-base';
import { Formik } from 'formik';
import axios from 'axios';

export default class Register extends Component {
    state = {
        isLoading: false,
        modalError: false,
        textWarnError: '',
        errorMessage: '',
        iconTypeFailed: ''
    }

    componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('Login');
        return true;
    }


    validateLogin(value) {
        const errors = {};
        if (!value.username) {
            errors.username = 'Required';
        }
        if (!value.password) {
            errors.password = 'Required';
        }
        if (!value.MSISDN) {
            errors.MSISDN = 'Required';
        }
        return errors;
    }

    login(value, navigation) {
          const { username, password, MSISDN } = value;

          Keyboard.dismiss();

          this.setState({ isLoading: true });

          axios.request({
            method: 'POST',
            url: `https://telkomsel-ho-fit.herokuapp.com/users`,
            data: {
              name: username,
              password: password,
              msisdn: MSISDN
            },
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
            timeout: 10000 // Timeout after 10 seconds
          }).then((res) => {
            this.setState({ isLoading: false });
            Alert.alert('User created', 'You can go back to the login page.');
          }).catch((err) => {
            this.setState({ isLoading: false });
            const errArr = err.toString().split('\n');
            const status = errArr[0];

            Alert.alert('Error', err.toString());
          });
    }

    render() {
        const { navigation } = this.props;
        const { isLoading, modalError, errorMessage, textWarnError = 'Login Failed', iconTypeFailed } = this.state;

        return (
            <KeyboardAwareScrollView
                enableOnAndroid
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps={'handled'}
                extraHeight={180}
            >
            { isLoading ? <ActivityIndicator size="large" color="#00ff00" /> : null }
            <Header
              transparent style={[styles.viewStyle, styles.headerStyledStyle]}
              androidStatusBarColor={'#E4322F'}
              iosBarStyle={'dark-content'}
            >
              <Left style={{ flex: 1 }}>
                <Button transparent onPress={() => this.props.navigation.navigate('Login')}>
                  <Icon name="ios-arrow-back" style={{ color: 'white' }} />
                </Button>
              </Left>
              <Body style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.headerStyledText]}>Registration</Text>
              </Body>
              <Right style={{ flex: 1 }} />
            </Header>

            <View style={styles.container}>
                <Formik
                initialValues={{
                    username: '',
                    password: '',
                    MSISDN: '',
                }}
                validate={this.validateLogin}
                onSubmit={value => this.login(value, navigation)}
                >
                {
                    props => (
                        <View style={{ marginTop: 50, flex: 0, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: 300 }}>
                                <TextInput
                                    autoCapitalize="none"
                                    placeholder={'Username'}
                                    onChangeText={props.handleChange('username')}
                                    onBlur={props.handleBlur('username')}
                                    returnKeyType={'next'}
                                    onSubmitEditing={() => { this.inputPassword.focus(); }}
                                    blurOnSubmit={false}
                                />
                                {props.errors.username && props.touched.username && <Text style={[styles.errorLabel]}>{props.errors.username}</Text>}
                            </View>
                            <View style={{ width: 300 }}>
                                <TextInput
                                    placeholder={'Password'}
                                    secureTextEntry
                                    onChangeText={props.handleChange('password')}
                                    onBlur={props.handleBlur('password')}
                                    onSubmitEditing={() => { this.inputPassword.focus(); }}
                                    returnKeyType={'done'}
                                    onSubmitEditing={props.handleSubmit}
                                    blurOnSubmit={false}
                                    inputRef={(input) => { this.inputPassword = input; }}
                                />
                                {props.errors.password && props.touched.password && <Text style={[styles.errorLabel]}>{props.errors.password}</Text>}
                            </View>
                            <View style={{ width: 300 }}>
                                <TextInput
                                  autoCapitalize="none"
                                  placeholder={'MSISDN'}
                                  onChangeText={props.handleChange('MSISDN')}
                                  onBlur={props.handleBlur('MSISDN')}
                                  returnKeyType={'next'}
                                  onSubmitEditing={() => { this.inputPassword.focus(); }}
                                  blurOnSubmit={false}
                                />
                                {props.errors.MSISDN && props.touched.MSISDN && <Text style={[styles.errorLabel]}>{props.errors.MSISDN}</Text>}
                            </View>


                            <Button success buttonStyle={styles.buttonSubmit} onPress={props.handleSubmit}>
                              <Text style={[styles.textBasic, {alignSelf: 'center', color: 'white'}]}>Register</Text>
                            </Button>
                        </View>
                    )
                }
                </Formik>
                {isLoading ? <ActivityIndicator size="large" color="#00ff00" /> : null}
            </View>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    tselImage: {
        width: 150,
        height: 46,
        marginTop: 30
    },
    textLabel: {
        width: 300,
        marginTop: 20,
        fontFamily: 'Montserrat-Bold',
        fontSize: 30,
        textAlign: 'center'
    },
    errorLabel: {
        width: 300,
        marginBottom: 10,
        marginLeft: 10,
        fontFamily: 'Montserrat-Light',
        fontSize: 12,
        color: 'red'
    },
    bgImage: {
        width: 300,
        height: 199,
        marginTop: 20,
        marginBottom: 20
    },
    buttonSubmit: {
        // backgroundColor: '#dc1f1b',
        width: 300,
        height: 60,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textBasic: {
        width: 300,
        marginTop: 20,
        marginBottom: 30,
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        textAlign: 'center'
    },
    forgotPassword: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        textAlign: 'right',
        color: '#dc1f1b',
    },
    unlockAccount: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        textAlign: 'left',
        color: '#dc1f1b',
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
    headerStyledStyle: {
  		backgroundColor: '#E4322F',
  	},
    headerStyledText: {
      color: 'white',
    },
});
