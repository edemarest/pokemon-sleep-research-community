import React from "react";
import HomePage from "./pages/HomePage"; // Import the new homepage
import "./App.css";
import firebaseApp from "./firebase/firebaseConfig";
console.log("Firebase Initialized:", firebaseApp);

const App = () => {
  return (
    <div className="App">
      <HomePage />
    </div>
  );
};

export default App;
