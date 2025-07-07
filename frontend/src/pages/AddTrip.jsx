import React, { useState } from 'react';
import './AddTrip.css';
import { useNavigate } from 'react-router-dom';

function AddTrip() {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTrip = {
      title,
      destination,
      tags: tags.split(',').map((tag) => tag.trim()),
    };
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Kullanıcı girişi yapmadınız!');
      return;
    }

    fetch('http://127.0.0.1:8081/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Id': userId },
      body: JSON.stringify(newTrip),
    })
      .then((response) => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Rota eklenemedi: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Rota eklendi:', data); 
        alert('Rota başarıyla eklendi!');
        setTitle('');
        setDestination('');
        setTags('');
        navigate('/trips');
      })
      .catch((error) => {
        console.error('Rota eklenirken hata:', error);
        setError('Rota eklenirken hata oluştu: ' + error.message);
      });
  };

  return (
    <div className="add-trip-container">
      <h2>Yeni Seyahat Ekle</h2>
      {error && <p className="error">{error}</p>}
      <form className="add-trip-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Seyahat"
          required
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Plan"
          required
        />
        <textarea
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Etkinlikler"
        />
        <button type="submit">Rota Ekle</button>
      </form>
    </div>
  );
}

export default AddTrip;