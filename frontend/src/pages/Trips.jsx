import React, { useState, useEffect, useMemo } from 'react';
import './Trips.css';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('user'); // Giriş kontrolü

  const suggestedTrips = useMemo(() => [
    {
      id: 'suggestion-1',
      title: 'Kış Tatili - Uludağ',
      destination: 'Bursa',
      username: 'Trip Mate Ekibi',
      tags: ['kış', 'kayak', 'doğa'],
      activities: ['Kayak yap', 'Termal kaplıcalara git', 'Doğa yürüyüşü'],
    },
    {
      id: 'suggestion-2',
      title: 'Kültürel Tur - Kapadokya',
      destination: 'Nevşehir',
      username: 'Trip Mate Ekibi',
      tags: ['kültür', 'tarih', 'balon'],
      activities: ['Balon turu', 'Peri bacalarını gez', 'Yeraltı şehirlerini keşfet'],
    },
    {
      id: 'suggestion-3',
      title: 'Deniz Keyfi - Antalya',
      destination: 'Antalya',
      username: 'Trip Mate Ekibi',
      tags: ['deniz', 'plaj', 'yaz'],
      activities: ['Plajda güneşlen', 'Tekne turu', 'Su sporları'],
    },
    {
      id: 'suggestion-4',
      title: 'Tarihi Keşif - Trabzon',
      destination: 'Trabzon',
      username: 'Trip Mate Ekibi',
      tags: ['tarih', 'doğa', 'deniz'],
      activities: ['Sümela Manastırı’nı ziyaret et', 'Uzungöl’de yürüyüş yap', 'Deniz kenarında vakit geçir'],
    },
    {
      id: 'suggestion-5',
      title: 'Doğa Macerası - Muğla',
      destination: 'Muğla',
      username: 'Trip Mate Ekibi',
      tags: ['doğa', 'plaj', 'kamp'],
      activities: ['Ölüdeniz’de yamaç paraşütü', 'Kamp kur', 'Saklıkent Kanyonu’nu keşfet'],
    },
    {
      id: 'suggestion-6',
      title: 'Şehir Turu - Gaziantep',
      destination: 'Gaziantep',
      username: 'Trip Mate Ekibi',
      tags: ['kültür', 'yemek', 'tarih'],
      activities: ['Zeugma Mozaik Müzesi’ni gez', 'Baklava tadımı yap', 'Kale’yi ziyaret et'],
    },
  ], []);

  const fetchTrips = () => {
    setLoading(true);
    console.log('fetchTrips started');
    fetch('http://127.0.0.1:8081/trips', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Sunucudan geçerli yanıt alınamadı: ${text} (Status: ${response.status})`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Rotalar başarıyla alındı:', data);
        if (Array.isArray(data)) {
          console.log('Setting trips:', data);
          setTrips(data);
        } else {
          console.error('Beklenen veri formatı dizi değil:', data);
          setError('Rotalar alınırken beklenmeyen veri formatı: ' + JSON.stringify(data));
          setTrips([]);
        }
      })
      .catch((error) => {
        console.error('Rotalar alınırken hata:', error);
        setError('Rotalar alınırken hata oluştu: ' + error.message);
        setTrips([]);
      })
      .finally(() => {
        console.log('fetchTrips finished, setting loading to false');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8081/trips/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Rota silinemedi: ${text}`);
          });
        }
        return response.json();
      })
      .then(() => {
        alert('Rota başarıyla silindi!');
        fetchTrips();
      })
      .catch((error) => {
        console.error('Silme hatası:', error);
        setError(error.message);
      });
  };

  const handleAddFavorite = (tripId) => {
    console.log('handleAddFavorite called with tripId:', tripId, 'isLoggedIn:', isLoggedIn);
    if (!isLoggedIn) {
      setError('Henüz giriş yapmadınız, lütfen kayıt olunuz veya giriş yapınız.');
      return;
    }

    const userId = localStorage.getItem('userId') || 1;
    console.log('Favori ekleme denemesi:', { userId, tripId });
    fetch('http://127.0.0.1:8081/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: parseInt(userId), trip_id: tripId }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Favorilere eklenemedi: ${text} (Status: ${response.status})`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Favori ekleme yanıtı:', data);
        alert('Favorilere eklendi!');
      })
      .catch((error) => {
        console.error('Favori ekleme hatası:', error);
        setError(error.message);
      });
  };

  return (
    <div className="trips-container">
      <h2>Önerilen Seyahat Planları</h2>
      {suggestedTrips.length === 0 ? (
        <p className="no-trips-message">Önerilen plan bulunamadı.</p>
      ) : (
        <div className="trips-grid">
          {suggestedTrips.map((trip) => (
            <div key={trip.id} className="trip-card suggestion-card">
              <div className="trip-card-content">
                <h3>{trip.title}</h3>
                <p><strong>Hedef:</strong> {trip.destination}</p>
                <p><strong>Etiketler:</strong> {trip.tags.join(', ')}</p>
                <p><strong>Oluşturan:</strong> {trip.username}</p>
                <p><strong>Etkinlikler:</strong> {trip.activities.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}

      <h2>Kullanıcıların Tercih Ettiği Seyahatler</h2>
      {loading ? (
        <p className="loading-message">Yükleniyor...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : trips.length === 0 ? (
        <p className="no-trips-message">Henüz rota eklenmemiş.</p>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-content">
                <h3>{trip.title}</h3>
                <p><strong>Hedef:</strong> {trip.destination}</p>
                <p><strong>Etkinlikler:</strong> {trip.tags.join(', ')}</p>
                <p><strong>Oluşturan:</strong> {trip.username || 'Bilinmeyen Kullanıcı'}</p>
              </div>
              <div className="trip-actions">
                <button
                  onClick={() => handleAddFavorite(trip.id)}
                  className="favorite-button"
                >
                  Favorilere Ekle
                </button>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="delete-button"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trips;