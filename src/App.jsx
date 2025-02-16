import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EntriesPage from "./pages/EntriesPage";
import EntryForm from "./sections/EntryForm"; // ✅ Import EntryForm
import Navbar from "./sections/Navbar";
import "./App.css";
import firebaseApp from "./firebase/firebaseConfig";

console.log("Firebase Initialized:", firebaseApp);

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/create-entry" element={<EntryForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
