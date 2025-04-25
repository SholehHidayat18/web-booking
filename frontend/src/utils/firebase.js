import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3LCRlD3urIeMs7B7s5xGm96Q_vuSEtZo",
  authDomain: "diklat-bkpp.firebaseapp.com",
  projectId: "diklat-bkpp",
  storageBucket: "diklat-bkpp.appspot.com",
  messagingSenderId: "768379679225",
  appId: "1:768379679225:web:5bb7cd8daf2efb3de9cd28"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithPhoneNumber, RecaptchaVerifier };
