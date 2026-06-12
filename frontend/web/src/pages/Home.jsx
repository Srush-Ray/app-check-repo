import React, { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm border-0" style={{ background: 'var(--surface-color)' }}>
        <div className="card-body p-4 p-md-5">
          <h2 className="text-center mb-4" style={{ color: 'var(--text-primary)' }}>Contact Information</h2>

          {submitted ? (
            <div className="alert alert-success text-center py-3">
              <h5 className="alert-heading fw-bold">Thank you!</h5>
              <p className="mb-0">Your information has been successfully submitted.</p>
              <button 
                className="btn btn-sm btn-outline-success mt-3" 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '' });
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

              <button type="submit" className="btn btn-primary w-100 mt-2">
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
