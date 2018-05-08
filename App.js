import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Map from './Map';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <Map />
    </View>
  );
}

