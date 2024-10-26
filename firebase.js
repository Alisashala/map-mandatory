// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBs0PWw_PZCUc6iwQadiwcwC36kDLvZsbQ",
  authDomain: "map-mandatory-99993.firebaseapp.com",
  projectId: "map-mandatory-99993",
  storageBucket: "map-mandatory-99993.appspot.com",
  messagingSenderId: "422536156892",
  appId: "1:422536156892:web:0e52cf37b9c312b1c94619",
  measurementId: "G-MQP72DJWRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore (app)
export { app, database }