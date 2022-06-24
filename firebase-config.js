// Import the functions you need from the SDKs you need
import { getFirestore } from "@firebase/firestore"
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import key from './apiKey.json'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = key.key

// Initialize Firebase
const app = initializeApp(firebaseConfig);
try{
    const analytics = getAnalytics(app);
}
catch(err){}

export const db = getFirestore(app);