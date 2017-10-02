import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Image, Animated, Button, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { Constant, BarCodeScanner, Permissions } from 'expo';
import axios from 'axios';
import Swiper from 'react-native-swiper';

import params from './keys';
import Snack from './Snack';
import Login from './Login';
import Stats from './Stats';
import Eaten from './Eaten';

let Window = Dimensions.get('window');

export default class App extends Component {
  state = {
    hasCameraPermission: null,
    sent: false,
    currentSnackName: null,
    currentSnackCalories: null,
    currentSnackImg: null,
    currentBarcode: null,
    snackBox: [],
    dropZoneValues: null,
    eaten: [],
    login: false,
    currentUser: '',
    weight: 0,
    calPerStep: 0,
    swipe: false,
    sync: 0,
    hungry: false,
    fontLoaded: false,
    specificSnack: null
  };

  async componentDidMount() {
    await Expo.Font.loadAsync({
      Rale: require('./assets/fonts/Raleway-ExtraBold.ttf'),
      Mono: require('./assets/fonts/Monofett.ttf')
    });
    this.setState({ fontLoaded: true });
  }


  _sync = (steps) => {
    this.setState({
      sync: steps
    })
  }

  _requestCameraPermission = async () => {
    if (this.state.hasCameraPermission === null) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({
        hasCameraPermission: status === 'granted'
      });
    } else {
      this._closeCamera();
    }
  };

  _handleBarCodeRead = data => {
    console.log('handlebar read', this.state.dropZoneValues)
    // invokes each time camera picks up barcode
    let barcode = data.data
    // state.sent is used to limit barcode scans
    if (!this.state.sent) {
      this._checkDatabase(barcode);
    }
  }

  _checkDatabase = (barcode) => {
    console.log('first time checkin...', barcode)

    // first check the database to see if we have the items ...
    axios.get('https://burn-my-junk.herokuapp.com/food')
      .then(databaseList => {
        for (let i = 0; i < databaseList.data.length; i++) {
          // console.log(i)
          data = databaseList.data[i];
          if (data.barcode === barcode) {
            this.setState({
              sent: true,
              currentSnackImg: data.img,
              currentSnackName: data.food,
              currentSnackCalories: data.calories
            });

            snack = {
              food: data.food,
              img: data.img,
              cal: data.calories
            }

            let exists = this.state.snackBox.some(snack => snack.food === data.food)
            !exists ? this.state.snackBox.push(snack) : null;
            // console.log(this.state.snackBox)
            break;
          }
        }
      })
      .then(() => this._checkAPI(barcode))
      .catch(err => console.log('error', err));
  }

  _checkAPI = (barcode) => {
    let food, calories, img;
    if (!this.state.sent) {
      axios.get(`https://trackapi.nutritionix.com/v2/search/item?upc=${barcode}`, {
        params: params
      })
      .then(res => {
        console.log('api send');
        this.setState({
          sent: true,
          currentSnackImg: res.data.foods[0].photo.thumb,
          currentSnackName: res.data.food,
          currentSnackCalories: res.data.calories
        });
        food = res.data.foods[0].brand_name + ' ' + res.data.foods[0].food_name;
        calories = res.data.foods[0].nf_calories;
        img = res.data.foods[0].photo.thumb;

        snack = {
          food: food,
          img: img,
          cal: calories
        }

        let exists = this.state.snackBox.some(snack => snack.food === food)
        !exists ? this.state.snackBox.push(snack) : null

      })
      .then(() => this._postData(food, calories, img, barcode))
      .catch(err => console.log('error', err));
    }

    setTimeout(this._reset, 1500);
  }

  _postData = (food, calories, img, barcode) => {
    axios.post('https://burn-my-junk.herokuapp.com/food', {
      food: food,
      calories: calories,
      img: img,
      barcode: barcode
    })
    .then(() => console.log('should posted', this.state))
    .catch(() => console.log(err))
  }

  _reset = () => {
    this.setState({
      sent: false
    })
  }

  _closeCamera = () => {
    this.setState({
      hasCameraPermission: null
    })
  }


  _setDropZoneValues = (event) => {      //Step 1
    this.setState({
      dropZoneValues : event.nativeEvent.layout
    });
  }

  _eat = (snack, stepsNeeded) => {
    let idx = this.state.snackBox.indexOf(snack);
    this.state.snackBox.splice(idx, 1);
    snack.steps = stepsNeeded;
    this.state.eaten.push(snack)
    console.log('snackbox,', this.state.snackBox)
    console.log('snack,', this.state.eaten)
  }

  _login = (username, weight) => {
    let calPerStepList = {
      100: 0.028,
      120: 0.033,
      140: 0.038,
      160: 0.044,
      180: 0.049,
      200: 0.055,
      220: 0.060,
      250: 0.069,
      275: 0.075
    }

    for (let key in calPerStepList) {
      if (weight <= key) {
        x = calPerStepList[key];
        break;
      }
    }

    this.setState({
      login: true,
      currentUser: username,
      weight: weight,
      calPerStep: x
    })
  }

  _swipe = () => {
    this.setState({
      swipe: !this.state.swipe
    })
    console.log(this.state.swipe)
  }

  _hungry = (value) => {
    this.setState({
      hungry: value
    })
  }

  _specificStats = (snack) => {
    this.setState({
      specificSnack: snack
    })
  }


  render() {

    let hungry = (this.state.hungry) ? <Image style={styles.avatar} source = {require('./assets/cat/cathungry.gif')}/> : <Image style={styles.avatar} source = {require('./assets/cat/catnodding.gif')}/>


    if (!this.state.login) {
      return (
        <Login log={this._login}/>
      )
    } else {
      return (
        <View style={styles.container}>
          {this.state.hasCameraPermission === null && this.state.fontLoaded ?
            <Text style={{fontFamily: 'Rale', fontSize: 40, backgroundColor: 'lightblue', textAlign: 'center', height: 100, top: 20}}>
              FEED THE CAT
            </Text> :
            <BarCodeScanner
              onBarCodeRead={this._handleBarCodeRead}
              style={{ height: 100, width: 400}}
            />
          }
          {this.state.swipe ? (
          <View style={styles.contentContainer}>
            <Stats consumed={this.state.eaten} calPerStep={this.state.calPerStep} sync={this._sync} specific={this.state.specificSnack}/>
          </View> ) : (
          <View style={styles.contentContainer}>
            {this.state.snackBox.map((snack, key) => {
              return (
                <Snack
                  snack={snack}
                  dropZone={this.state.dropZoneValues}
                  eaten={this._eat}
                  calPerStep={this.state.calPerStep}
                  key={key}
                  // style={styles.snackWrapper}
                  hungry={this._hungry}
                />
              )
            })}
          </View>
        )}
          <Swiper style={styles.slide} onLayout={this._setDropZoneValues.bind(this)} onIndexChanged={this._swipe} showsPagination={false}>
            <View style={styles.test}>
              <TouchableOpacity onPress={this._requestCameraPermission} style={{top: -15, left: 90}}>
                {hungry}
              </TouchableOpacity>
            </View>
            <View style={styles.eatenContainer}>
              {
                this.state.eaten.map((item, key) => {
                  return (
                    <Eaten item={item} key={key} stats={this._specificStats}/>
                  )
                })
              }
            </View>
          </Swiper>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1 ,
    backgroundColor: 'lightblue'
  },
  avatar: {
    width: 180,
    height: 180
  },
  contentContainer: {
    flex: 3,
    backgroundColor: 'lightblue',
    zIndex: 0
  },
  slide: {
    flex: 1,
    bottom: 0,
    borderTopWidth: 2,
    borderColor: 'grey',
    backgroundColor: 'lightblue'
  },
  eatenContainer: {
    backgroundColor: 'lightblue',
    flex: 1,
    flexWrap: 'nowrap',
    flexDirection: 'row',
    zIndex: 1,
    height: Window.height
  }
});
