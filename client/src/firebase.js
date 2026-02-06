import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getConfig } from "./configLoader";

let app;
let auth;

export const initializeFirebase = () => {
  const config = getConfig();

  const firebaseConfig = {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  return { app, auth };
};

export const getAuthInstance = () => {
  if (!auth) {
    throw new Error(
      "Firebase not initialized. Call initializeFirebase() first.",
    );
  }
  return auth;
};

export { auth };
