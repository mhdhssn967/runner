// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLz2iGImfFW39784a5Iom3uAh2MYSh72c",
  authDomain: "web-game-65f1e.firebaseapp.com",
  projectId: "web-game-65f1e",
  storageBucket: "web-game-65f1e.firebasestorage.app",
  messagingSenderId: "404386653936",
  appId: "1:404386653936:web:7078add51765fba0818435",
  measurementId: "G-KCNQ4BHHEX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);