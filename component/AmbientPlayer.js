import React, {useEffect, useRef, useState} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {SafeAreaView, View, Text, StyleSheet, Dimensions} from 'react-native';

import TrackPlayer, {
  useProgress,
  Capability,
  Event,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import songs from '../model/data';
import {Animated} from 'react-native';
import {TimePicker, ValueMap} from 'react-native-simple-time-picker';
import PowerButton from './PowerButton';

import {useDerivedValue, useSharedValue} from 'react-native-reanimated';

const {width, height} = Dimensions.get('window');

const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();
  // TODO: Apparently this isn't working but will work in future version of React Native Track Player
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
  });
  await TrackPlayer.add(songs);
};

const togglePlayback = async playbackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack();

  if (currentTrack !== null) {
    if (playbackState == State.Paused) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const AmbientPlayer = () => {
  const theta = useSharedValue(2 * Math.PI * 1.001);
  const animateTo = useDerivedValue(() => 2 * Math.PI * invertedCompletion);
  const textOpacity = useSharedValue(0);
  const percentageComplete = 85;
  const invertedCompletion = (100 - percentageComplete) / 100;
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const [hours, setHours] = React.useState(0);
  const [minutes, setMinutes] = React.useState(0);
  const handleChange = (value: {hours: number, minutes: number}) => {
    setHours(value.hours);
    setMinutes(value.minutes);
  };
  const handleReset = () => {
    setHours(0);
    setMinutes(0);
  };

  const testOutput = () => {
    console.log('hours:' + hours);
    console.log('minutes' + minutes);
  };

  // const [value, setValue] =
  //   useState <
  //   ValueMap >
  //   {
  //     hours: 1,
  //     minutes: 0,
  //     seconds: 0,
  //   };

  const [trackArtwork, setTrackArtwork] = useState();
  const [trackArtist, setTrackArtist] = useState();
  const [trackTitle, setTrackTitle] = useState();

  const scrollX = useRef(new Animated.Value(0)).current;
  const [songIndex, setSongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState('off');

  const songSlider = useRef(null);
  // const [selectedHours, setSelectedHours] = useState(0);
  // const [selectedMinutes, setSelectedMinutes] = useState(0);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, artwork, artist} = track;
      setTrackTitle(title);
      setTrackArtwork(artwork);
      setTrackArtist(artist);
    }
  });

  Ionicons.loadFont();
  MaterialCommunityIcons.loadFont();

  // const repeatIcon = () => {
  //   if (repeatMode == 'off') {
  //     return 'repeat-off';
  //   }
  //   if (repeatMode == 'track') {
  //     return 'repeat-once';
  //   }
  //   if (repeatMode == 'repeat') {
  //     return 'repeat';
  //   }
  // };

  // const changeRepeatMode = () => {
  //   if (repeatMode == 'off') {
  //     TrackPlayer.setRepeatMode(RepeatMode.Track);
  //     setRepeatMode('track');
  //   }
  //   if (repeatMode == 'track') {
  //     TrackPlayer.setRepeatMode(RepeatMode.Queue);
  //     setRepeatMode('repeat');
  //   }
  //   if (repeatMode == 'repeat') {
  //     TrackPlayer.setRepeatMode(RepeatMode.Off);
  //     setRepeatMode('off');
  //   }
  // };

  // const handleChange = (newValue: ValueMap) => {
  //   setValue(newValue);
  // };

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    setupPlayer();
    scrollX.addListener(({value}) => {
      const index = Math.round(value / width);
      skipTo(index);
      setSongIndex(index);
    });

    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };

  const skipToPrevious = () => {
    // Note that without getNode added, it's undefined
    // songSlider.current.getNode().scrollToOffset({
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };

  const renderSongs = ({index, item}) => {
    return (
      <Animated.View
        style={{
          width: width,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={styles.artworkWrapper}>
          <Image source={trackArtwork} style={styles.artworkImg} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={{width: width}}>
          <Animated.FlatList
            ref={songSlider}
            data={songs}
            renderItem={renderSongs}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {x: scrollX},
                  },
                },
              ],
              {useNativeDriver: true},
            )}
          />
        </View>

        <View style={styles.musicControls}>
          {/* <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons
              name="play-skip-back-outline"
              size={35}
              color="#FFD369"
              style={{marginTop: 25}}
            />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
            {/* <Ionicons
              name={
                playbackState === State.Playing
                  ? 'ios-pause-circle'
                  : 'ios-play-circle'
              }
              size={75}
              color="#FFD369"
            /> */}
            <PowerButton
              theta={theta}
              animateTo={animateTo}
              textOpacity={textOpacity}
              invertedCompletion={invertedCompletion}
              percentageComplete={percentageComplete}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color="#FFD369"
              style={{marginTop: 25}}
            />
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={() => {
            if (!textOpacity.value) {
              theta.value = animateTo.value;
              textOpacity.value = 1;
            } else {
              theta.value = 2 * Math.PI * 1.001;
              textOpacity.value = 0;
            }
          }}>
          <Ionicons
            name="play-skip-back-outline"
            size={35}
            color="#FFD369"
            style={{marginTop: 25}}
          />
        </TouchableOpacity>

        <TimePicker
          textColor={'white'}
          value={{hours, minutes}}
          onChange={handleChange}
        />
        {/* <Text style={styles.title}>
          React Native Time Picker – To Pick the Time using Native Time Picker
        </Text>
        <Text>
          Selected Time: {selectedHours}:{selectedMinutes}
        </Text> */}
        {/* <TimePicker value={value} onChange={handleChange} /> */}
        {/* <View style={styles.bottomControls}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color={repeatMode !== 'off' ? '#FFD369' : '#777777'}
              // color="#777777"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="share-outline" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#777777" />
          </TouchableOpacity>
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default AmbientPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkWrapper: {
    width: 300,
    height: 340,
    marginBottom: 25,
    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  artworkImg: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#EEEEEE',
  },
  progressContainer: {
    height: 40,
    width: 350,
    marginTop: 25,
    flexDirection: 'row',
  },
  progressLabelContainer: {
    width: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelTxt: {
    color: '#fff',
  },
  musicControls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: 15,
  },
  artist: {
    fontSize: 16,
    fontWeight: '200',
    textAlign: 'center',
    color: '#EEEEEE',
  },
  bottomContainer: {
    borderTopColor: '#393E46',
    borderTopWidth: 1,
    width: width,
    color: 'white',
    alignItems: 'center',
    paddingVertical: 15,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});
