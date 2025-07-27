import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACB8nTPq0HM-yUnmA6s0R6T8u3rmPQdiY",
  authDomain: "surfaced-app.firebaseapp.com",
  databaseURL: "https://surfaced-app-default-rtdb.firebaseio.com",
  projectId: "surfaced-app",
  storageBucket: "surfaced-app.firebasestorage.app",
  messagingSenderId: "875835514420",
  appId: "1:875835514420:web:eb86d46e3d564901a03461",
  measurementId: "G-VEX069K4BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

console.log('Firebase initialized with project:', firebaseConfig.projectId); 