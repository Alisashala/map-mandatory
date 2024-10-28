import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, Image, Modal, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import { app } from './firebase';
import { collection, addDoc, getDocs, getFirestore } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function App() {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [region] = useState({
    latitude: 56.2639, 
    longitude: 9.5018,
    latitudeDelta: 5, 
    longitudeDelta: 5
  });

  const db = getFirestore(app);
  const storage = getStorage(app);

  // Fetch markers from Firestore when the app loads
  useEffect(() => {
    fetchMarkersFromFirestore();
  }, []);

  // Function to fetch all markers from Firestore
  async function fetchMarkersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "locations"));
      const fetchedMarkers = [];

      querySnapshot.forEach((doc) => {
        const markerData = doc.data();
        fetchedMarkers.push({
          coordinate: markerData.location,
          key: doc.id,
          title: "Great place!",
          image: markerData.image
        });
      });

      setMarkers(fetchedMarkers);
      console.log("Markers fetched from Firestore:", fetchedMarkers);
    } catch (error) {
      console.error("Error fetching markers: ", error);
      Alert.alert("Error", "Failed to fetch markers from Firestore.");
    }
  }

  // Adds a new marker and triggers image selection
  function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: Date.now().toString(),
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

  // Handles image selection and updates marker with image URL
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
      const docRef = await addDoc(collection(db, "locations"), {
        location: { ...coordinate },
        image: imageUrl
      });
      console.log("Marker saved with ID: ", docRef.id);
      Alert.alert('Success', 'Location and image saved!');
    } catch (err) {
      Alert.alert("Error", "Failed to save data.");
    }
  }

  // Modal component to display marker details
  const MarkerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Location Details</Text>
          
          {selectedMarker?.image && (
            <Image
              source={{ uri: selectedMarker.image }}
              style={styles.modalImage}
              resizeMode="cover"
            />
          )}
          
          <Text style={styles.locationText}>
            Latitude: {selectedMarker?.coordinate.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {selectedMarker?.coordinate.longitude.toFixed(6)}
          </Text>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
            description={marker.image ? 'Tap to view image' : 'No image attached'}
            onPress={() => {
              setSelectedMarker(marker);
              setModalVisible(true);
            }}
          />
        ))}
      </MapView>
      <MarkerModal />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
    marginTop: 15
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
