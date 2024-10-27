import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';
import { app } from './firebase';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function App() {
  const [markers, setMarkers] = useState([]);
  const [region] = useState({
    latitude: 56.2639, longitude: 9.5018,
    latitudeDelta: 5, longitudeDelta: 5
  });

  const db = getFirestore(app);
  const storage = getStorage(app);

  // Creates a new marker and triggers image selection
  function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: data.timeStamp,
      title: "Great place!",
      image: null
    };
    setMarkers(prev => [...prev, newMarker]);
    handleImageSelection(newMarker);
  }

  // Uploads selected image to Firebase Storage and returns download URL
  async function uploadImage(uri, imageId) {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `images/${imageId}`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  }

  // Handles image selection process and updates marker with image URL
  async function handleImageSelection(marker) {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return Alert.alert("Permission to access camera roll is required!");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUrl = await uploadImage(result.assets[0].uri, marker.key.toString());
        setMarkers(prev => prev.map(m => 
          m.key === marker.key ? { ...m, image: imageUrl } : m
        ));
        await saveToFirestore(marker.coordinate, imageUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image: ' + error.message);
    }
  }

  // Saves marker location and image URL to Firestore
  async function saveToFirestore(coordinate, imageUrl) {
    try {
      await addDoc(collection(db, "locations"), {
        location: { ...coordinate },
        image: imageUrl
      });
      Alert.alert('Success', 'Location and image saved!');
    } catch (err) {
      Alert.alert("Error", "Failed to save data.");
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={addMarker}
      >
        {markers.map(marker => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.image ? 'Image attached' : 'No image attached'}
            onPress={() => Alert.alert(
              "Marker Details",
              marker.image ? `Image URL: ${marker.image}` : marker.title
            )}
          />
        ))}
      </MapView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' }
});