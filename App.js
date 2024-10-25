import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
      >
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width:'50%',
    height:'50%'
  },
});

