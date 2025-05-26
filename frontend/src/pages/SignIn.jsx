import React, { useState } from 'react';
import './SignIn.css';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için

function SignIn() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Yönlendirme için

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Tüm alanlar doldurulmalıdır!');
      return;
    }
    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi giriniz!');
      return;
    }
    setError('');

    fetch('http://127.0.0.1:8081/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Giriş başarısız!');
        return response.json();
      })
      .then((data) => {
        console.log('Login response:', data); // Yanıtı kontrol et
        if (data.user && data.user.id && data.user.username) {
          localStorage.setItem('userId', data.user.id); // userId'yi ayrı kaydet
          localStorage.setItem('user', JSON.stringify(data.user)); // User nesnesini de sakla
          console.log('Giriş yapıldı, userId:', data.user.id, 'username:', data.user.username);
          navigate('/home'); // Programatik yönlendirme
        } else {
          throw new Error('Kullanıcı verisi eksik!');
        }
      })
      .catch((error) => {
        console.error('Giriş hatası:', error);
        setError('Giriş sırasında hata: ' + error.message);
      });
  };

  return (
    <div className="auth-container">
      <h2>Giriş Yap</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Kullanıcı Adı"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          required
        />
        <button type="submit">Giriş Yap</button>
      </form>
      <p>
        Hesabın yok mu? <a href="/signup">Kayıt Ol</a>
      </p>
    </div>
  );
}

export default SignIn;