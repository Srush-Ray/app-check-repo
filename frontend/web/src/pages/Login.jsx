import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { mockLogin, mockSignUp } from '../data/mockData';
import { login } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pushUserAndNavigate = (user) => {
    dispatch(login({
      email: user.email,
      uid: user.uid,
      displayName: user.displayName,
    }));
    navigate('/');
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email/Username and password cannot be empty.');
      return;
    }
    try {
      const user = mockSignUp(email, password);
      pushUserAndNavigate(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email/Username and password cannot be empty.');
      return;
    }
    try {
      const user = mockLogin(email, password);
      pushUserAndNavigate(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const loggedInUser = {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
      };
      // Persist the user state in local storage so page refreshes retain the session
      localStorage.setItem('mock_portfolio_user', JSON.stringify(loggedInUser));
      pushUserAndNavigate(loggedInUser);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: '400px' }}>
      <div className="card shadow-sm border-0" style={{ background: 'var(--surface-color)' }}>
        <div className="card-body p-4 p-md-5">
          <h2 className="text-center mb-4" style={{ color: 'var(--text-primary)' }}>Login</h2>

          {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}

          <form className="d-flex flex-column gap-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="form-label fw-medium" style={{ color: 'var(--text-secondary)' }}>Email or Username</label>
              <input
                type="text"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or username (e.g. test)"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div>
              <label className="form-label fw-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. Test@123)"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="d-flex gap-2 mt-2">
              <button type="button" className="btn btn-primary flex-grow-1" onClick={handleEmailSignIn}>Log In</button>
              <button type="button" className="btn btn-secondary flex-grow-1" onClick={handleEmailSignUp}>Sign Up</button>
            </div>

            <div className="d-flex align-items-center my-1">
              <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
              <span className="mx-2 text-muted" style={{ fontSize: '0.8rem' }}>or</span>
              <hr className="flex-grow-1" style={{ borderColor: 'var(--border-color)' }} />
            </div>

            <button
              type="button"
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleSignIn}
              style={{ transition: 'all 0.2s ease' }}
            >
              <FaGoogle /> Log in with Google
            </button>
          </form>

          <div className="text-center mt-4 text-muted" style={{ fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            Demo Admin Credentials:<br />
            Username: <strong>test</strong> | Password: <strong>Test@123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
