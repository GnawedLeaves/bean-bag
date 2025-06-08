// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALLvgbSUg37uZSIafG9YDJDcLHorSgEa4",
  authDomain: "pushy-tushy.firebaseapp.com",
  projectId: "pushy-tushy",
  storageBucket: "pushy-tushy.appspot.com",
  messagingSenderId: "442449621900",
  appId: "1:442449621900:web:b87ce9887439fe98bedca9",
  measurementId: "G-65H8PP6NXQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // firebase.firestore(); if do the other way
