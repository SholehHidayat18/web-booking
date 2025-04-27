import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYQaMacuzIjBWt-NDZl_mYdahSWYnzMig",
  authDomain: "bkpp-3c5ec.firebaseapp.com",
  projectId: "bkpp-3c5ec",
  storageBucket: "bkpp-3c5ec.firebasestorage.app",
  messagingSenderId: "52091797683",
  appId: "1:52091797683:web:9fc68759d0065005d370c6",
  measurementId: "G-9H2D777TW3"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Firebase connected:", app.name);

export { auth, signInWithPhoneNumber };
