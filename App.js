import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';
import { app } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore"; // Ensure Firestore is imported

export default function App() {
  const [markers, setMarkers] = useState([]);

  const [region, setRegion] = useState({
    latitude: 56.2639,
    longitude: 9.5018,
    latitudeDelta: 5,
    longitudeDelta: 5
  });

  // Firestore reference
  const database = getFirestore(app); // Initialize Firestore
  console.log('Firestore initialized:', database); // Check if Firestore is initialized correctly

  // Function to add a new marker on the map
  function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: data.timeStamp,
      title: "Great place!"
    };
    setMarkers([...markers, newMarker]);
    console.log('Marker added:', newMarker); // Log marker details
  }

  // Function to handle marker press and save data to Firestore
  async function onMarkerPressed(marker) {
    const { latitude, longitude } = marker.coordinate;
    const imageId = "some_image_id"; // Placeholder for image ID (replace this later)

    console.log('Marker pressed:', marker); // Log marker press
    console.log(`Saving to Firestore: Latitude: ${latitude}, Longitude: ${longitude}`);

    try {
      // Store the location and image ID in Firestore
      await addDoc(collection(database, "locations"), {
        location: { latitude, longitude },
        image: imageId // Placeholder for image ID
      });
      console.log('Location successfully added to Firestore!'); 
      alert("Location added to Firestore!");
    } catch (err) {
      console.log("Error saving to Firestore:", err); 
      alert("Error saving to Firestore: " + err.message);
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={addMarker} 
      >
        {
          markers.map(marker => (
            <Marker
              coordinate={marker.coordinate}
              key={marker.key}
              title={marker.title}
              onPress={() => onMarkerPressed(marker)} 
            />
          ))
        }
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%'
  }
});
