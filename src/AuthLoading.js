import React, { Component } from 'react';
import {
    ActivityIndicator,
    StatusBar,
    StyleSheet,
    View,
    Alert,
    Platform,
    Image,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class AuthLoading extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {
        const userId = await AsyncStorage.getItem('userId');

        console.log(userId);
        
        this.props.navigation.navigate(userId ? 'Main' : 'Login');
    };

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00ff00" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gifImage: {
      resizeMode: 'center',
    },
});
