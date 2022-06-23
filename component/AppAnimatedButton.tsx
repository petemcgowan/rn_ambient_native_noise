import React from 'react';
import { View, PixelRatio, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';

const radius = PixelRatio.roundToNearestPixel(130);
const STROKE_WIDTH = 30;
const strokeWidth = 85;
const innerRadius = radius - strokeWidth / 2;
const circumfrence = 2 * Math.PI * innerRadius;
const FADE_DELAY = 1500;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default () => {
  const randomNumber = useSharedValue(100);

  const style = useAnimatedStyle(() => {
    return {
      width: withSpring(randomNumber.value),
      height: withSpring(randomNumber.value, { stiffness: 10 }),
    };
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#7CA1B4',
      }}
    >
      <TouchableOpacity
        onPress={() => {
          randomNumber.value = Math.random() * 350;
        }}
      >
        <Animated.Image
          source={require('./rns.png')}
          resizeMode="contain"
          style={style}
        />
              <Svg  style={StyleSheet.absoluteFill}>

          <Circle
            // animatedProps={animatedProps}
            cx={radius}
            cy={radius}
            fill={'transparent'}
            r={innerRadius}
            stroke={"#f93986"}
            strokeDasharray={`${circumfrence} ${circumfrence}`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};