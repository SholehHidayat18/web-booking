import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "./firebase";

const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: (response) => {
      console.log("Recaptcha solved", response);
    },
    "expired-callback": () => {
      console.log("Recaptcha expired");
    },
  });
};

export default setupRecaptcha;
