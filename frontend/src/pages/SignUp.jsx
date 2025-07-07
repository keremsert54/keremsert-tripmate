import React, { useState } from 'react';
import './SignUp.css';
import { useNavigate } from 'react-router-dom'; // Yönlendirme için

function SignUp() {
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

    fetch('http://127.0.0.1:8081/register', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Kayıt başarısız!');
        return response.json();
      })
      .then((data) => {
        console.log('Register response:', data); 
        if (data.id && data.username) {
          localStorage.setItem('userId', data.id); 
          localStorage.setItem('user', JSON.stringify(data)); 
          console.log('Kayıt yapıldı, userId:', data.id, 'username:', data.username);
          alert('Kayıt başarılı! Giriş yaptınız.');
          navigate('/home'); 
        } else {
          throw new Error('Kullanıcı verisi eksik!');
        }
      })
      .catch((error) => {
        console.error('Kayıt hatası:', error);
        setError('Kayıt sırasında hata: ' + error.message);
      });
  };

  return (
    <div className="auth-container">
      <h2>Kayıt Ol</h2>
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
        <button type="submit">Kayıt Ol</button>
      </form>
      <p>
        Zaten hesabın var mı? <a href="/signin">Giriş Yap</a>
      </p>
    </div>
  );
}

export default SignUp;