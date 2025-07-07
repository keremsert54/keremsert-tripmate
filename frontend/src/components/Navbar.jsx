import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('user');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  console.log('User from localStorage:', JSON.stringify(user, null, 2)); 
  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-logo">
        <i className="fas fa-map-marker-alt"></i>
        <span>Trip Mate</span>
      </Link>
      <ul className="navbar-links">
        <li>
          <Link
            to="/home"
            className={`navbar-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            Ana Sayfa
          </Link>
        </li>
        <li>
          <Link
            to="/trips"
            className={`navbar-link ${location.pathname === '/trips' ? 'active' : ''}`}
          >
            Seyahatler
          </Link>
        </li>
        {isLoggedIn && (
          <>
            <li>
              <Link
                to="/favorites"
                className={`navbar-link ${location.pathname === '/favorites' ? 'active' : ''}`}
              >
                Popüler Seyahatler
              </Link>
            </li>
            <li>
              <Link
                to="/add-trip"
                className={`navbar-link ${location.pathname === '/add-trip' ? 'active' : ''}`}
              >
                Seyahat Ekle 
              </Link>
            </li>
            <li>
              <span className="navbar-user">Hoş geldin, {user.username || 'Kullanıcı'}!</span>
            </li>
            <li>
              <button onClick={handleLogout} className="navbar-button">
                Çıkış Yap
              </button>
            </li>
          </>
        )}
        {!isLoggedIn && (
          <>
            <li>
              <Link
                to="/signin"
                className={`navbar-link ${location.pathname === '/signin' ? 'active' : ''}`}
              >
                Giriş Yap
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={`navbar-link ${location.pathname === '/signup' ? 'active' : ''}`}
              >
                Kayıt Ol
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;