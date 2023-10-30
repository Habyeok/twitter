// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs_fXqE5QW32oLqxbcxisoVUGXYQw2_kI",
  authDomain: "twitter-a93a2.firebaseapp.com",
  projectId: "twitter-a93a2",
  storageBucket: "twitter-a93a2.appspot.com",
  messagingSenderId: "1043361094797",
  appId: "1:1043361094797:web:446fabd557aba8a7b496c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);