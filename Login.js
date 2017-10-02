import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Image, Animated, Button, TouchableOpacity, PanResponder, Dimensions, Constants, TextInput } from 'react-native';


export default class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      weight: 0,
      fontLoaded: false
    };
  }

  async componentDidMount() {
    await Expo.Font.loadAsync({
      Rancho: require('./assets/fonts/Ranchers-Regular.ttf'),
      Mono: require('./assets/fonts/Monofett.ttf')
    });
    this.setState({ fontLoaded: true });
  }


  _handleUserChange = (input) => {
    this.setState({
      username: input
    })
  }

  _handleWeightChange = (weight) => {
    this.setState({
      weight: weight
    })
  }

  _handleLoginButton = () => {
    this.props.log(this.state.username, this.state.weight);
    this.setState({
      username: '',
      weight: 0
    })
  }

  render() {
    return this.state.fontLoaded ? (
      <View style={styles.container}>
        <Text style={{fontFamily: 'Mono', fontSize: 50}}>
          FATCAT
        </Text>
        <Image
          source = {require('./assets/cat/catnodding.gif')}
          style = {{width: 150, height: 150}}
        />
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontFamily: 'Rancho'}}>
            Username:
          </Text>
            <TextInput
              style={styles.inputForm}
              onChangeText={this._handleUserChange}
            />
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontFamily: 'Rancho'}}>
            Weight:
          </Text>
          <TextInput
            keyboardType="numeric"
            style={styles.weightForm}
            onChangeText={this._handleWeightChange}
          />
        </View>
        <Button
          onPress={this._handleLoginButton}
          title="Login"
        />
      </View>
    ) : null
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue'
  },
  inputForm: {
    backgroundColor: 'lightblue',
    width: 75,
    height: 25,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  weightForm: {
    backgroundColor: 'lightblue',
    width: 35,
    height: 25,
    justifyContent: 'center'
  }
})
