import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendorIdForParts, setVendorIdForParts] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showVendorModal, setShowVendorModal] = useState(false);
  const emptyVendor = { vendor_name: '', vendor_code: '', address_line1: '', address_line2: '', country: '' };
  const [newVendor, setNewVendor] = useState(emptyVendor);
  const [editVendor, setEditVendor] = useState(null);

  const [newPart, setNewPart] = useState({
    vendor_id: '',
    part_number: '',
    description: '',
    description_eng: '',
    country_of_origin: '',
  });
  const [editPart, setEditPart] = useState(null);

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user',
  });

  function flash(msg, isErr = false) {
    setMessage(isErr ? '' : msg);
    setError(isErr ? msg : '');
    if (msg) {
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 4000);
    }
  }

  async function refreshVendors() {
    const { data } = await api.get('/vendors');
    setVendors(data);
  }

  async function refreshUsers() {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  }

  useEffect(() => {
    refreshVendors().catch(() => flash('Could not load vendors', true));
    refreshUsers().catch(() => flash('Could not load users', true));
  }, []);

  useEffect(() => {
    if (!vendorIdForParts) {
      setParts([]);
      return;
    }
    api
      .get(`/parts/${vendorIdForParts}`)
      .then((res) => setParts(res.data))
      .catch(() => flash('Could not load parts', true));
  }, [vendorIdForParts]);

  async function addVendor(e) {
    e.preventDefault();
    try {
      await api.post('/admin/vendors', newVendor);
      setNewVendor(emptyVendor);
      setShowVendorModal(false);
      await refreshVendors();
      flash('Vendor added');
    } catch (err) {
      flash(err.response?.data?.error || 'Failed', true);
    }
  }

  async function saveVendor(e) {
    e.preventDefault();
    if (!editVendor) return;
    try {
      await api.put(`/admin/vendors/${editVendor.id}`, editVendor);
      setEditVendor(null);
      await refreshVendors();
      flash('Vendor updated');
    } catch (err) {
      flash(err.response?.data?.error || 'Failed', true);
    }
  }

  async function deleteVendor(id) {
    if (!confirm('Delete this vendor? Parts under it may block deletion.')) return;
    try {
      await api.delete(`/admin/vendors/${id}`);
      await refreshVendors();
      if (String(vendorIdForParts) === String(id)) {
        setVendorIdForParts('');
      }
      flash('Vendor deleted');
    } catch (err) {
      flash(err.response?.data?.error || 'Delete failed (check related parts)', true);
    }
  }

  async function addPart(e) {
    e.preventDefault();
    try {
      await api.post('/admin/parts', {
        vendor_id: Number(newPart.vendor_id),
        part_number: newPart.part_number,
        description: newPart.description,
        description_eng: newPart.description_eng || null,
        country_of_origin: newPart.country_of_origin || null,
      });
      setNewPart((p) => ({
        ...p,
        part_number: '',
        description: '',
        description_eng: '',
        country_of_origin: '',
      }));
      if (String(newPart.vendor_id) === String(vendorIdForParts)) {
        const { data } = await api.get(`/parts/${vendorIdForParts}`);
        setParts(data);
      }
      flash('Part added');
    } catch (err) {
      flash(err.response?.data?.error || 'Failed', true);
    }
  }

  async function savePart(e) {
    e.preventDefault();
    if (!editPart) return;
    try {
      await api.put(`/admin/parts/${editPart.id}`, {
        part_number: editPart.part_number,
        description: editPart.description,
        description_eng: editPart.description_eng || null,
        country_of_origin: editPart.country_of_origin || null,
      });
      setEditPart(null);
      const { data } = await api.get(`/parts/${vendorIdForParts}`);
      setParts(data);
      flash('Part updated');
    } catch (err) {
      flash(err.response?.data?.error || 'Failed', true);
    }
  }

  async function deletePart(id) {
    if (!confirm('Delete this part?')) return;
    try {
      await api.delete(`/admin/parts/${id}`);
      const { data } = await api.get(`/parts/${vendorIdForParts}`);
      setParts(data);
      flash('Part deleted');
    } catch (err) {
      flash(err.response?.data?.error || 'Failed', true);
    }
  }

  async function createUser(e) {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setNewUser({ username: '', password: '', role: 'user' });
      await refreshUsers();
      flash('User created');
    } catch (err) {
      flash(err.response?.data?.error || 'Failed', true);
    }
  }

  return (
    <div className="page app-page">
      <header className="top-bar">
        <div>
          <h2>Admin dashboard</h2>
          <span className="muted">Manage vendors, parts, and accounts</span>
        </div>
        <nav className="nav-actions">
          <Link to="/" className="link-btn">
            PDF generator
          </Link>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>

      {message ? <p className="banner success">{message}</p> : null}
      {error ? <p className="banner error">{error}</p> : null}

      <main className="admin-grid">
        <section className="card section-block">
          <h3>Vendors</h3>
          <button type="button" className="primary-action" onClick={() => setShowVendorModal(true)}
            style={{ marginBottom: '1rem' }}>
            + Add vendor
          </button>

          {/* ── ADD VENDOR MODAL ── */}
          {showVendorModal && (
            <div className="modal-backdrop" onClick={() => setShowVendorModal(false)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h4 style={{ marginTop: 0 }}>Add vendor</h4>
                <form onSubmit={addVendor} className="stack-form">
                  <label>
                    Vendor name *
                    <input
                      value={newVendor.vendor_name}
                      onChange={(e) => setNewVendor((v) => ({ ...v, vendor_name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Vendor code
                    <input
                      placeholder="e.g. 21676AA"
                      value={newVendor.vendor_code}
                      onChange={(e) => setNewVendor((v) => ({ ...v, vendor_code: e.target.value }))}
                    />
                  </label>
                  <label>
                    Address line 1
                    <input
                      value={newVendor.address_line1}
                      onChange={(e) => setNewVendor((v) => ({ ...v, address_line1: e.target.value }))}
                    />
                  </label>
                  <label>
                    Address line 2
                    <input
                      value={newVendor.address_line2}
                      onChange={(e) => setNewVendor((v) => ({ ...v, address_line2: e.target.value }))}
                    />
                  </label>
                  <label>
                    Country
                    <input
                      value={newVendor.country}
                      onChange={(e) => setNewVendor((v) => ({ ...v, country: e.target.value }))}
                    />
                  </label>
                  <div className="row-btns">
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setShowVendorModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── EDIT VENDOR MODAL ── */}
          {editVendor && (
            <div className="modal-backdrop" onClick={() => setEditVendor(null)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h4 style={{ marginTop: 0 }}>Edit vendor</h4>
                <form onSubmit={saveVendor} className="stack-form">
                  <label>
                    Vendor name *
                    <input
                      value={editVendor.vendor_name}
                      onChange={(e) => setEditVendor((v) => ({ ...v, vendor_name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Vendor code
                    <input
                      value={editVendor.vendor_code ?? ''}
                      onChange={(e) => setEditVendor((v) => ({ ...v, vendor_code: e.target.value }))}
                    />
                  </label>
                  <label>
                    Address line 1
                    <input
                      value={editVendor.address_line1 ?? ''}
                      onChange={(e) => setEditVendor((v) => ({ ...v, address_line1: e.target.value }))}
                    />
                  </label>
                  <label>
                    Address line 2
                    <input
                      value={editVendor.address_line2 ?? ''}
                      onChange={(e) => setEditVendor((v) => ({ ...v, address_line2: e.target.value }))}
                    />
                  </label>
                  <label>
                    Country
                    <input
                      value={editVendor.country ?? ''}
                      onChange={(e) => setEditVendor((v) => ({ ...v, country: e.target.value }))}
                    />
                  </label>
                  <div className="row-btns">
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditVendor(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <ul className="list">
            {vendors.map((v) => (
              <li key={v.id}>
                <span>
                  <strong>{v.vendor_name}</strong>
                  {v.vendor_code ? <span className="muted"> · {v.vendor_code}</span> : null}
                  {v.address_line1 ? <span className="muted"> · {v.address_line1}{v.city ? `, ${v.city}` : ''}</span> : null}
                </span>
                <button type="button" onClick={() => setEditVendor({ ...v })}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteVendor(v.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card section-block">
          <h3>Parts</h3>
          <label>
            Vendor for list
            <select
              value={vendorIdForParts}
              onChange={(e) => setVendorIdForParts(e.target.value)}
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </label>
          <form onSubmit={addPart} className="stack-form">
            <h4>Add part</h4>
            <label>
              Vendor
              <select
                value={newPart.vendor_id}
                onChange={(e) =>
                  setNewPart((p) => ({ ...p, vendor_id: e.target.value }))
                }
                required
              >
                <option value="">Select</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Part number
              <input
                value={newPart.part_number}
                onChange={(e) =>
                  setNewPart((p) => ({ ...p, part_number: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Description (PACCAR label)
              <input
                value={newPart.description}
                onChange={(e) =>
                  setNewPart((p) => ({ ...p, description: e.target.value }))
                }
              />
            </label>
            <label>
              Description English (Individual label – auto-translates to FR &amp; ESP)
              <input
                placeholder="e.g. Brake Pad"
                value={newPart.description_eng}
                onChange={(e) =>
                  setNewPart((p) => ({ ...p, description_eng: e.target.value }))
                }
              />
            </label>
            <label>
              Country of origin
              <input
                placeholder="e.g. USA, Germany (prints as MADE IN …)"
                value={newPart.country_of_origin}
                onChange={(e) =>
                  setNewPart((p) => ({ ...p, country_of_origin: e.target.value }))
                }
              />
            </label>
            <button type="submit">Add part</button>
          </form>
          {vendorIdForParts ? (
            <ul className="list">
              {parts.map((p) => (
                <li key={p.id}>
                  {editPart?.id === p.id ? (
                    <form onSubmit={savePart} className="stack-form tight">
                      <input
                        value={editPart.part_number}
                        onChange={(e) =>
                          setEditPart({ ...editPart, part_number: e.target.value })
                        }
                      />
                      <input
                        placeholder="Description (PACCAR)"
                        value={editPart.description}
                        onChange={(e) =>
                          setEditPart({ ...editPart, description: e.target.value })
                        }
                      />
                      <input
                        placeholder="Description ENG (Individual – auto-translates)"
                        value={editPart.description_eng ?? ''}
                        onChange={(e) =>
                          setEditPart({ ...editPart, description_eng: e.target.value })
                        }
                      />
                      <input
                        placeholder="Country of origin"
                        value={editPart.country_of_origin ?? ''}
                        onChange={(e) =>
                          setEditPart({
                            ...editPart,
                            country_of_origin: e.target.value,
                          })
                        }
                      />
                      <div className="row-btns">
                        <button type="submit">Save</button>
                        <button type="button" onClick={() => setEditPart(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span>
                        <strong>{p.part_number}</strong> — {p.description || '—'}
                        {p.description_eng ? (
                          <span className="muted"> | ENG: {p.description_eng}{p.description_fr ? ` · FR: ${p.description_fr}` : ''}{p.description_esp ? ` · ESP: ${p.description_esp}` : ''}</span>
                        ) : null}
                        {p.country_of_origin ? (
                          <span className="muted"> ({p.country_of_origin})</span>
                        ) : null}
                      </span>
                      <button type="button" onClick={() => setEditPart({ ...p })}>
                        Edit
                      </button>
                      <button type="button" onClick={() => deletePart(p.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Pick a vendor to list and edit parts.</p>
          )}
        </section>

        <section className="card section-block">
          <h3>Users</h3>
          <form onSubmit={createUser} className="stack-form">
            <label>
              Username
              <input
                value={newUser.username}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, username: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, password: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Role
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, role: e.target.value }))
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <button type="submit">Create user</button>
          </form>
          <ul className="list compact">
            {users.map((u) => (
              <li key={u.id}>
                {u.username} — <strong>{u.role}</strong>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
