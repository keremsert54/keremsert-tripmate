import React, { useState, useEffect } from 'react';
import './Favorites.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');


  useEffect(() => {
    fetch(`/favorites/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Favoriler alınamadı.');
        return response.json();
      })
      .then((data) => setFavorites(data))
      .catch((error) => {
        console.error('Favoriler alınırken hata:', error);
        setError('Favoriler alınırken hata oluştu.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveFavorite = (tripId) => {
  fetch('/favorites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: Number(userId),
      trip_id: Number(tripId),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Favori kaldırılamadı: ${text}`);
        });
      }
      return response.json();
    })
    .then(() => {
      setFavorites(favorites.filter((trip) => trip.id !== tripId));
      alert('Favori başarıyla kaldırıldı!');
    })
    .catch((error) => {
      console.error('Favori kaldırma hatası:', error);
      setError(error.message);
    });
};


  return (
    <div className="favorites-container">
      <h2>Popüler Seyahatler</h2>
      {loading ? (
        <p className="loading-message">Yükleniyor...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : favorites.length === 0 ? (
        <p className="no-favorites-message">Henüz favori rotanız yok.</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((trip) => (
            <li key={trip.id} className="favorite-item">
              <div className="favorite-details">
                {trip.title} - {trip.destination} (Etkinlikler: {trip.tags.join(', ')})
              </div>
              <button
                onClick={() => handleRemoveFavorite(trip.id)}
                className="remove-button"
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Favorites;