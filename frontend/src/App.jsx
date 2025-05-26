import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AddTrip from './pages/AddTrip';
import Home from './pages/Home';
import Trips from './pages/Trips';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Favorites from './pages/Favorites'; // Favoriler sayfasını import et
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Home />} /> {/* Varsayılan sayfa Home olarak ayarlandı */}
        <Route path="/home" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/add-trip" element={<AddTrip />} />
        <Route path="/favorites" element={<Favorites />} /> {/* Yeni rota */}
      </Routes>
    </Router>
  );
}

export default App;

