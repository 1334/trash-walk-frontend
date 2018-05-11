import React from 'react';
import { connect } from 'react-redux';
import { Text, View, StyleSheet, Button } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

class EventConfirmation extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>EventConfirmation Screen</Text>
        <Text>Well Done!</Text>
        <Button title='Cool!' onPress={() => this.props.navigation.navigate('Home')} />
      </View>
    );
  }
}


const mapStateToProps = state => ({
  user: state.events.User.updatedUser,
});

export default connect(mapStateToProps, null)(EventConfirmation);

/*
GET (userId, eventId): result of walk.
If Badge: badge to state. (updatedUser)

STATE (Redux Store):
User: {
  updatedUser.
}
*/
