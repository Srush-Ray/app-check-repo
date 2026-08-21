import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/userSlice';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import constants from '../../../constants.json';

export default function Home() {
  const user = useSelector(selectUser);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email,
        name: prev.name || user.displayName || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const targetUid = user?.uid || `user-${Date.now()}`;
    const payload = {
      uid: targetUid,
      username: formData.name.trim(),
      email: formData.email.trim(),
      phonenumber: formData.phone.trim(),
    };

    let success = false;

    // 1. Try Backend POST /add route
    try {
      const res = await fetch(`${constants.BACKEND_URL}/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Firebase-AppCheck': constants.APP_CHECK_DEMO_TOKEN
        },
        body: JSON.stringify(payload),
      });



      if (res.ok) {
        success = true;
      }
    } catch (err) {
      console.warn("Backend POST /add failed, attempting direct Firestore write:", err.message);
    }

    // 2. Fallback to direct Firestore write if backend POST failed
    if (!success) {
      try {
        const timestamp = Date.now().toString();
        const userDocRef = doc(db, 'details', targetUid);
        await setDoc(userDocRef, {
          [timestamp]: {
            username: payload.username,
            email: payload.email,
            phonenumber: payload.phonenumber,
          }
        }, { merge: true });
        success = true;
      } catch (firestoreErr) {
        console.error("Direct Firestore write error:", firestoreErr);
        setError("Failed to save data: " + firestoreErr.message);
      }
    }

    setLoading(false);

    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm border-0" style={{ background: 'var(--surface-color)' }}>
        <div className="card-body p-4 p-md-5">
          <h2 className="text-center mb-4" style={{ color: 'var(--text-primary)' }}>Contact Information</h2>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {submitted ? (
            <div className="alert alert-success text-center py-3">
              <h5 className="alert-heading fw-bold">Success!</h5>
              <p className="mb-0">Your information has been successfully updated to Firebase!</p>
              <button 
                className="btn btn-sm btn-outline-success mt-3" 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: user?.email || '', phone: '' });
                }}
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-medium" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label fw-medium" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>

              <div>
                <label className="form-label fw-medium" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                {loading ? 'Updating Firebase...' : 'Submit to Firebase'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


