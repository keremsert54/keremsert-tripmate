import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Trip Mate ile Seyahatinizi Planlayın!</h1>
          <p>Rotanızı oluşturun, popüler seyahatleri keşfedin ve unutulmaz anılar biriktirin.</p>
          <Link to="/trips">
            <button className="explore-button">Hemen Keşfet</button>
          </Link>
        </div>
      </header>

      <section className="about-section">
        <h2>Trip Mate Nedir?</h2>
        <p>
          Trip Mate, seyahat tutkunları için tasarlanmış bir platformdur. Kendi rotalarınızı
          oluşturabilir, diğer kullanıcıların rotalarını keşfedebilir ve seyahat planlarınızı
          kolayca yönetebilirsiniz. Amacımız, seyahat etmeyi daha keyifli ve organize hale
          getirmek!
        </p>
      </section>

      <section className="features-section">
        <h2>Neler Yapabilirsiniz?</h2>
        <div className="features-grid">
          <div className="feature-group">
            <Link to="/add-trip">
              <button className="feature-button">Rota Oluştur</button>
            </Link>
            <Link to="/trips">
              <button className="feature-button">Seyahatleri Keşfet</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;