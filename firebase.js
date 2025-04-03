// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzhnLCmad-FClk038BMTel0veqq8jbWgg",
  authDomain: "mychatapp-d3daf.firebaseapp.com",
  databaseURL:"https://mychatapp-d3daf-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "mychatapp-d3daf",
  storageBucket: "mychatapp-d3daf.firebasestorage.app",
  messagingSenderId: "645308376399",
  appId: "1:645308376399:web:66d80f5b91ea8da248913a",
  measurementId: "G-RHV94WR4XE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app)
const database = getDatabase(app)

export { auth, app, db, storage, database };
