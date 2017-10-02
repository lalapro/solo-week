import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Image, Animated, Button, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
let Window = Dimensions.get('window');

export default class Eaten extends Component {
  constructor(props){
    super(props);
    this.state = {
      showDraggable: true,
      // dropZoneValues: this.props.dropZone,
      pan: new Animated.ValueXY()
    };

    this.panResponder = PanResponder.create({    //Step 2
      onStartShouldSetPanResponder : () => true,
      onPanResponderMove: (e, gesture) => {
        this.props.stats(this.props.item);
        Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }])(e, gesture); // <<--- INVOKING HERE!
      },
      onPanResponderRelease: (e, gesture) => {  //Step 4
        this.props.stats(null);
        Animated.spring(
          this.state.pan,
          {toValue:{x:0,y:0}}
        ).start();
      }
    });
  }





  render() {
    return(
      <Animated.Image
        {...this.panResponder.panHandlers}
        style= {[this.state.pan.getLayout(), {width: 50, height: 50, zIndex: 2, position: 'relative'}]}
        source={this.props.item.cuteImg}
      />
    )
  }
}

const styles = StyleSheet.create({
  eaten: {
    backgroundColor: 'lightblue'
  }
});
