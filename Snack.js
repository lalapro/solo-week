import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Image, Animated, Button, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
let Window = Dimensions.get('window');

export default class Snack extends Component {
  constructor(props){
    super(props);
    this.state = {
      showDraggable: true,
      dropZoneValues: this.props.dropZone,
      pan: new Animated.ValueXY(),
      calStep: this.props.calPerStep,
      fontLoaded: false
    };

    this.panResponder = PanResponder.create({    //Step 2
      onStartShouldSetPanResponder : () => true,
      onPanResponderMove: (e, gesture) => {

        if(gesture.moveY > Window.height - this.state.dropZoneValues.height - 133) {
          this.props.hungry(true);
        } else {
          this.props.hungry(false);
        }

        Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }])(e, gesture); // <<--- INVOKING HERE!
      },
      onPanResponderRelease: (e, gesture) => {  //Step 4
        if(this.isDropZone(gesture)){ //Step 1
          this.eatSnack(this.props.snack, this._stepsNeeded(this.props.snack.cal));
          this.setState({
            showDraggable : false //Step 3
          });
        } else {
          Animated.spring(
            this.state.pan,
            {toValue:{x:0,y:0}}
          ).start();
          this.props.hungry(false);
        }
      }
    });

    this.isDropZone = (gesture) => {     //Step 2
      var dz = this.state.dropZoneValues;
      return gesture.moveY > Window.height - dz.height;
    }

    this.randomCute = () => {
      let randomImages = [
        require('./assets/food/apple.png'),
        require('./assets/food/bread.png'),
        require('./assets/food/burger.png'),
        require('./assets/food/choco.png'),
        require('./assets/food/drink.png'),
        require('./assets/food/fries.png')
      ]

      let idx = Math.floor(Math.random() * (randomImages.length - 0 + 1));
      return randomImages[idx];
    }

    this.eatSnack = (snack, stepsNeeded) => {
      snack.cuteImg = this.randomCute();
      this.props.eaten(snack, stepsNeeded)
      this.props.hungry(false);
    }
  }

  _stepsNeeded = (num) => {
    let x = num/this.state.calStep
    x = x.toString();
    if (x.includes('.')) {
      let idx = x.indexOf('.');
      return x.slice(0, idx)
    } else {
      return x
    }
  }

  async componentDidMount() {
    await Expo.Font.loadAsync({
      Raleway: require('./assets/fonts/Raleway-ExtraBold.ttf'),
    });
    this.setState({ fontLoaded: true });
  }


  render() {
    if (this.state.showDraggable) {
      return this.state.fontLoaded ?(
        <View style={styles.snackWrapper}>
          <Animated.Image
            {...this.panResponder.panHandlers}
            style={[this.state.pan.getLayout(), styles.snackImg]}
            source={{uri: this.props.snack.img}}
          />
          <Text style={styles.snack}>{this.props.snack.food}</Text>
          <Text style={styles.cal}> {this.props.snack.cal} </Text>
          <Text style={styles.cal}> {this._stepsNeeded(this.props.snack.cal)} </Text>
        </View>
      ) : null
    } else {
      return (
        <Text>Ate!</Text>
      )
    }
  }
}

const styles = StyleSheet.create({
  snackImg: {
    width: 80,
    height: 80,
    flex: 2,
    zIndex: 2,
    position: 'relative'
  },
  snack: {
    textAlign: 'center',
    maxWidth: 200,
    flex: 5,
    fontFamily: 'Raleway',
    color: 'white'
  },
  cal: {
    textAlign: 'right',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    maxWidth: 50,
    flex: 1,
    fontFamily: 'Raleway',
    color: 'white'
  },
  snackWrapper: {
    display: 'flex',
    flex: 1,
    flexWrap: 'nowrap',
    alignItems: 'center',
    flexDirection:'row'
  }
});
