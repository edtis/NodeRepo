var firebase = require("firebase");

firebase.initializeApp({
  apiKey: "AIzaSyB4Hu2z8-p11HxRjt4y4QL_IbOTnGaCWTQ",
  authDomain: "goodbookbible-82b24.firebaseapp.com",
  databaseURL: "https://goodbookbible-82b24.firebaseio.com",
  projectId: "goodbookbible-82b24",
  storageBucket: "goodbookbible-82b24.appspot.com",
  messagingSenderId: "915101073542"
});
var database = firebase.database();
module.exports = database;
