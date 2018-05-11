import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import MapView, { Polyline } from 'react-native-maps';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addEventDataToCurrentEvent } from '../actions/events';
import { SERVER_BASE_URL } from '../middlewares/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;

class ActiveEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showUserLocation: false,
    };
  }

  componentDidMount() {
    BackgroundGeolocation.configure({
      desiredAccuracy: 0,
      desiredOdometerAccuracy: 20,
      distanceFilter: 10,
      url: `${SERVER_BASE_URL}/event/update`,
      extras: { userId: this.props.userId, eventId: this.props.eventId },
      autoSync: true,
      stopOnTerminate: true,
      startOnBoot: false,
      httpRootProperty: '.',
      locationTemplate: '{ "lat":<%= latitude %>, "lng":<%= longitude %>, "timestamp":"<%= timestamp %>" }',
      // #### FOR DEVELOPMENT ####
      reset: true,
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      // #### END: FOR DEVELOPMENT ####
    });
    BackgroundGeolocation.resetOdometer();
    BackgroundGeolocation.on('location', this.onLocation);
    BackgroundGeolocation.start(() => {
      this.setState({ showUserLocation: true });
    });
  }

  onLocation = ({ coords: { latitude, longitude }, odometer }) => {
    this.setCenter({ latitude, longitude });
    this.props.addEventDataToCurrentEvent({ latitude, longitude }, odometer);
  }

  setCenter({ latitude, longitude }) {
    if (!this.mapRef) { return; }

    this.mapRef.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  }

  stopEvent = async () => {
    await BackgroundGeolocation.stop();
    await BackgroundGeolocation.removeAllListeners();
    this.props.navigation.navigate('FinishedEventToConfirm');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <MapView
            ref={(c) => { this.mapRef = c; }}
            style={{ flex: 1 }}
            showsUserLocation={this.state.showUserLocation}
            followsUserLocation={false}
            scrollEnabled
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
            showsScale={false}
            showsTraffic={false}
            toolbarEnabled={false}
          >
            <Polyline
              coordinates={this.props.currentEvent.path}
              strokeWidth={26}
              geodesic
              strokeColor="rgba(0,179,253, 0.6)"
              zIndex={0}
            />
          </MapView>
        </View>
        <View style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
          <Button title="Stop Event" onPress={this.stopEvent} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  currentEvent: state.events.currentEvent,
  eventId: state.events.currentEvent.id,
  userId: state.user.id,
});

const mapDispatchToProps = dispatch => ({
  addEventDataToCurrentEvent:
    (location, distance) => dispatch(addEventDataToCurrentEvent(location, distance)),
});

ActiveEvent.propTypes = {
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  currentEvent: PropTypes.objectOf(PropTypes.any).isRequired,
  navigation: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.any),
  ])).isRequired,
  addEventDataToCurrentEvent: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActiveEvent);
