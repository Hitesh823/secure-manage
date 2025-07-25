// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlO_XqnyY-78o5LHUdF7MGZpDF3whYznk",
  authDomain: "document-mangement-2.firebaseapp.com",
  projectId: "document-mangement-2",
  storageBucket: "document-mangement-2.firebasestorage.app",
  messagingSenderId: "603513418068",
  appId: "1:603513418068:web:e3c627506dad14f3bb98c1",
  measurementId: "G-1S7TG19ETZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Realtime Database and Storage
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
const database = getDatabase(app);
const storage = getStorage(app);
export { app, analytics, database, storage }; // Export the Firebase app, analytics, database
// Import the Firebase app, analytics, database, and storage
import { app, analytics, database, storage } from "./firebaseConfig.js";
// Reference messages collection
var messagesRef = firebase.database().ref("image");

// Listen for form submit

function uploadImage() {
  if (document.getElementById("file").value != "") {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Uploading...";
    var file = document.getElementById("file").files[0];
    var storageRef = firebase.storage().ref("images/" + file.name);
    var uploadTask = storageRef.put(file);
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2);
        console.log("Upload is " + progress + "% done");
        document.getElementById("upload").innerHTML = "Uploading"+" "+progress+"%...";
      },
      function (error) {
        console.log(error.message);
        document.getElementById("upload").innerHTML = "Upload Failed";
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          console.log("File available at", downloadURL);
          saveMessage(downloadURL);
        });
      }
    );
  } else {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Please select a file";
    // After 2 sec make it empty
    setTimeout(function () {
      document.getElementById("upload").innerHTML = uploadtext;
    }, 2000);
  }
}



// Save message to firebase
function saveMessage(downloadURL) {
  var newMessageRef = messagesRef.push();
  var unique = createUniquenumber();
  // Hidding recive file div
  var x = document.getElementById("downloadiv");
  x.style.display = "none";
  var showUnique = document.getElementById("ShowUniqueID");
  var shU = document.getElementById("showunique");
  shU.value = unique;
  showUnique.style.display = "block";
  // showUnique.value = unique;
  newMessageRef.set({
    url: downloadURL,
    number: unique,
  });
  document.getElementById("upload").innerHTML = "Upload Successful";
  //Make file input empty
  document.getElementById("file").value = "";
}

function createUniquenumber() {
  // Create a unique 5 digit number for each image which is not in the database field number yet
  var number = Math.floor(10000 + Math.random() * 90000);
  var ref = firebase.database().ref("image");
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == number) {
        createUniquenumber();
      }
    });
  });
  return number;
}

function showimage() {
  var uniqueId = document.getElementById("unique").value;
  if (uniqueId == "") {
    alert("Unique Id is empty\n Please enter a Unique Id");
    return;
  }
  var ref = firebase.database().ref("image");
  var flag = 0;
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == uniqueId) {
        flag = 1;
        window.open(childData.url, "_blank");
        // AFter this delete the image from the database
        ref.child(childSnapshot.key).remove();
        // Remove file from storage
        //Run this with 5sec delay
        setTimeout(function () {
          var storageRef = firebase.storage().refFromURL(childData.url);
          storageRef
            .delete()
            .then(function () {
              ref.child(childSnapshot.key).remove();
              // File deleted successfully
            })
            .catch(function (error) {});
        }, 15000);
      }
    });
  });
  // After some time if flag is still 0 then show alert
  // setTimeout(function(){

  // if(flag == 0){
  //     alert("File not found Check the Unique ID");
  // }
  // }, 5000);
}

function flesize() {
  var file = document.getElementById("file").files[0];
  // Dont allow file size greater than 100MB
  if (file.size > 100000000) {
    alert(
      "File size is greater than 100MB\n Please select a file less than 100MB"
    );
    document.getElementById("file").value = "";
  }
}

// Click on download button when enter is pressed
document.getElementById("unique").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("show").click();
  }
});
