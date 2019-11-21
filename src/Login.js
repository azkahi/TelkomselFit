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
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Button } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

export default class Login extends Component {
    state = {
        isLoading: false,
        modalError: false,
        textWarnError: '',
        errorMessage: '',
        iconTypeFailed: ''
    }

    validateLogin(value) {
        const errors = {};
        if (!value.username) {
            errors.username = 'Required';
        }
        if (!value.password) {
            errors.password = 'Required';
        }
        return errors;
    }

    login(value, navigation) {
        const { username, password } = value;

        Keyboard.dismiss();

        this.setState({ isLoading: true });

        axios.request({
          method: 'POST',
          url: `https://telkomsel-ho-fit.herokuapp.com/login`,
          data: {
            name: username,
            password: password,
          },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
          timeout: 10000 // Timeout after 10 seconds
        }).then((res) => {
          this.setState({ isLoading: false });
          if (res.data) {
            console.log(res.data[0].id);
            AsyncStorage.setItem('userId', res.data[0].id.toString());
            this.props.navigation.navigate('Main');
          }
        }).catch((err) => {
          this.setState({ isLoading: false });
          const errArr = err.toString().split('\n');
          const status = errArr[0];

          Alert.alert('Error', err.toString());
        });
    }

    goToRegisterPage = () => {
      this.props.navigation.navigate('Register');
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
            <View style={styles.container}>
                <Image source={require('../assets/images/logo_steptoo.png')} style={[styles.image, {marginTop: 60, resizeMode: 'center'}]}/>
                <Formik
                initialValues={{
                    username: '',
                    password: ''
                }}
                validate={this.validateLogin}
                onSubmit={value => this.login(value, navigation)}
                >
                {
                    props => (
                        <View style={{ marginTop: 50, flex: 0, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={styles.textInput}>
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
                            <View style={styles.textInput}>
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


                            <Button success buttonStyle={styles.buttonSubmit} onPress={props.handleSubmit}>
                              <Text style={[styles.textBasic, {alignSelf: 'center', color: 'white', marginBottom: 20}]}>Login</Text>
                            </Button>
                            <TouchableOpacity onPress={this.goToRegisterPage}>
                                <Text style={styles.textBasic}>Tap here to Register</Text>
                            </TouchableOpacity>
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
        borderRadius: 5,
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
    image: {
      height: 150,
    },
    textInput: {
      width: 300,
      borderWidth: 0.75,
      borderRadius: 5,
      marginBottom: 15,
      paddingHorizontal: 5
    }
});
