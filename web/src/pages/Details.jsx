import React, { useState, useEffect } from 'react';
import constants from '../../../constants.json';

export default function Details() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBackendDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${constants.BACKEND_URL}/details`, {
        headers: {
          'X-Firebase-AppCheck': constants.APP_CHECK_DEMO_TOKEN
        }
      });


      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      }

      const json = await response.json();

      if (json.success && json.data) {
        const parsed = [];
        Object.entries(json.data).forEach(([uid, timestamps]) => {
          if (typeof timestamps === 'object' && timestamps !== null) {
            Object.entries(timestamps).forEach(([ts, detail]) => {
              parsed.push({
                uid,
                timestamp: ts,
                username: detail?.username || 'N/A',
                email: detail?.email || 'N/A',
                phonenumber: detail?.phonenumber || 'N/A',
              });
            });
          }
        });

        // Sort entries by timestamp descending (newest first)
        parsed.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        setEntries(parsed);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error("Failed to fetch details from backend:", err);
      setError(err.message || 'Failed to fetch data from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendDetails();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.uid.toLowerCase().includes(query) ||
      entry.username.toLowerCase().includes(query) ||
      entry.email.toLowerCase().includes(query) ||
      entry.phonenumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '900px' }}>
      <div className="card shadow-sm border-0" style={{ background: 'var(--surface-color)' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="m-0" style={{ color: 'var(--text-primary)' }}>
                Firebase Details Entries
              </h2>
              <p className="text-muted mb-0 small">
                Data fetched live from backend (<code>http://localhost:5001/details</code>)
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary fs-6">
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </span>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={fetchBackendDetails}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
              <div>
                <strong>Error connecting to backend:</strong> {error}
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={fetchBackendDetails}>
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by UID, Name, Email, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Fetching entries from backend...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <h5>No entries found</h5>
                  <p className="mb-0">
                    {searchQuery ? 'No entries match your search query.' : 'No entries exist in the `details` collection yet.'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>User ID (UID)</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry, index) => {
                        const dateStr = !isNaN(Number(entry.timestamp))
                          ? new Date(Number(entry.timestamp)).toLocaleString()
                          : entry.timestamp;

                        return (
                          <tr key={`${entry.uid}-${entry.timestamp}-${index}`}>
                            <td>{index + 1}</td>
                            <td>
                              <code className="text-primary fw-bold">{entry.uid}</code>
                            </td>
                            <td className="fw-medium">{entry.username}</td>
                            <td>{entry.email}</td>
                            <td>{entry.phonenumber}</td>
                            <td>
                              <small className="text-muted">{dateStr}</small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
