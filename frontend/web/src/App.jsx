import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMockCurrentUser, mockLogout } from './data/mockData';
import { login, logout, selectUser } from './redux/userSlice';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const userAuth = getMockCurrentUser();
    if (userAuth) {
      dispatch(
        login({
          email: userAuth.email,
          uid: userAuth.uid,
          displayName: userAuth.displayName,
        })
      );
    } else {
      dispatch(logout());
    }
  }, [dispatch]);

  const handleLogout = () => {
    mockLogout();
    dispatch(logout());
  };

  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to="/">Home</Link>

        <div style={{ flexGrow: 1 }}></div>

        {user ? (
          <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
            Logout ({user.email})
          </button>
        ) : (
          <Link to="/login" className="btn btn-sm btn-primary">Login</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

