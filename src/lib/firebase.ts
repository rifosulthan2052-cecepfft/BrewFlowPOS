
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDI0zK7GwIY3N1cIy191Sfq-RWYAkxjg6E",
  authDomain: "6000-firebase-studio-1753700681526.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev",
  projectId: "brew-flow",
  storageBucket: "brew-flow.appspot.com",
  messagingSenderId: "436443450780",
  appId: "1:436443450780:web:a1bd5f8ef317a5229d0c59",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);


export { app, auth };
