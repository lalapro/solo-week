import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Image, Animated, Button, TouchableOpacity, PanResponder, Dimensions} from 'react-native';
import Expo from "expo";
import { Pedometer, Font } from 'expo';
import Pie from 'react-native-pie';
let Window = Dimensions.get('window');



export default class Stats extends Component {
  constructor(props){
    super(props);
    this.state = {
      isPedometerAvailable: "checking",
      pastStepCount: 0,
      currentStepCount: 0,
      caloriesBurnedPercentage: 0,
      fontLoaded: false
    };
  }



  async componentDidMount() {
    await Expo.Font.loadAsync({
      Lato: require('./assets/fonts/Lato-Bold.ttf'),
    });
    this.setState({ fontLoaded: true });
    this._subscribe();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  _subscribe = () => {
    this._subscription = Pedometer.watchStepCount(result => {
      this.setState({
        currentStepCount: result.steps,
        caloriesBurnedPercentage: result.steps += 2
      });
      this.props.sync(result.steps += 2);
    });

    Pedometer.isAvailableAsync().then(
      result => {
        this.setState({
          isPedometerAvailable: String(result)
        });
      },
      error => {
        this.setState({
          isPedometerAvailable: "Could not get isPedometerAvailable: " + error
        });
      }
    );

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 1);
    Pedometer.getStepCountAsync(start, end).then(
      result => {
        this.setState({ pastStepCount: result.steps });
      },
      error => {
        this.setState({
          pastStepCount: "Could not get stepCount: " + error
        });
      }
    );
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };


  _calories = () => {
    let cal = 0;
    this.props.consumed.forEach(item => {
      cal += item.cal
    });
    return cal;
  }

  _steps = () => {
    let steps = 0;
    this.props.consumed.forEach(item => {
      steps += Number(item.steps)
    });

    return steps === 0 ? 0 : steps - this.state.currentStepCount;
  }

  _caloriesBurned = () => {
    let x = this.state.currentStepCount
    return this._toPoint(x *= this.props.calPerStep);
  }

  _toPoint = (num) => {
    let x = num.toString();
    if (x.includes('.')) {
      let idx = x.indexOf('.');
      return x.slice(0, idx)
    } else {
      return x
    }
  }

  _caloriesBurnedPercentage = () => {
    return this.state.caloriesBurnedPercentage++;
  }

  render() {
    return (
      <View>
        <View style={styles.pie}>
          <Pie
            radius={90}
            innerRadius={85}
            series={[this.state.caloriesBurnedPercentage]}
            colors={['#f00']}
            backgroundColor='#ddd' />
          <View style={styles.gauge}>
            <Image
              source = {require('./assets/cat/fatcatnodding.gif')}
              style = {{width: 150, height: 150, position:'absolute', top: 10, left: 18}}
            />
          </View>
        </View>
          {
            this.state.fontLoaded ? (
              <View style={styles.stats}>
                <Text style={styles.text}>
                  Calories Consumed: {this._calories()}
                </Text>
                <Text style={styles.text}>
                  Steps Needed: {this._steps()}
                </Text>
                <Text style={styles.text}>
                  Calories Burned: {this._caloriesBurned()}
                </Text>
                <Text style={styles.text}>
                  Steps Taken: {this.state.currentStepCount}
                </Text>
              </View>
            ) : null
          }
          {
            this.state.fontLoaded && this.props.specific !== null ? (
              <View>
                <Image
                  source = {require('./assets/food/bubble.png')}
                  style={{width: 60, height: 60, left: 200, top: -20, zIndex: 0}}
                />
                <Image
                  source={this.props.specific.cuteImg}
                  style={{width: 30, height: 30, left: 216, top: -78, zIndex: 2}}
                />
                <Text style={{fontFamily: 'Lato', color:'white', fontSize: 16, textAlign: 'center', top: 70}}>
                  {this.props.specific.food}, {this.props.specific.cal} cal
                </Text>
              </View>
            ) : null
          }
      </View>
    )
  }
}



Expo.registerRootComponent(Stats);




const styles = StyleSheet.create({
  pie: {
    position: 'absolute',
    top: Window.height/10,
    left: Window.width/4
  },
  gauge: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeText: {
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: 24,
  },
  stats: {
    top: 300,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontFamily: 'Lato',
    color: 'white',
    fontSize: 20
  }
});
