var admin = require("firebase-admin");
var firebase = require("firebase");
var serviceAccount = require("./goodbookbible-82b24-firebase-adminsdk-60wy4-5a07332837.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://goodbookbible-82b24.firebaseio.com",
});
module.exports = admin;

firebase.initializeApp({
  apiKey: "AIzaSyB4Hu2z8-p11HxRjt4y4QL_IbOTnGaCWTQ",
  authDomain: "goodbookbible-82b24.firebaseapp.com",
  databaseURL: "https://goodbookbible-82b24.firebaseio.com",
  projectId: "goodbookbible-82b24",
  storageBucket: "goodbookbible-82b24.appspot.com",
  messagingSenderId: "915101073542",
});

const database = firebase.database();
module.exports = database;
