import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

function paccarOriginPreview(raw) {
  const t = raw != null ? String(raw).trim() : '';
  if (!t) {
    return 'MADE IN USA (default — set on part in admin)';
  }
  if (/^made in\b/i.test(t)) {
    return t;
  }
  return `MADE IN ${t}`;
}

export default function LabelGenerator() {
  const { user, logout, isAdmin } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [template, setTemplate] = useState('');
  const [company, setCompany] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [country, setCountry] = useState('');
  const [pallet, setPallet] = useState('');
  const [totalItems, setTotalItems] = useState('');
  const [perBox, setPerBox] = useState('');
  const [po, setPo] = useState('');
  const [pdfError, setPdfError] = useState('');

  // Individual label state
  const [indVendors, setIndVendors] = useState([]);
  const [indParts, setIndParts] = useState([]);
  const [indVendorId, setIndVendorId] = useState('');
  const [indPart, setIndPart] = useState(null);
  const [indDate, setIndDate] = useState('');
  const [indQty, setIndQty] = useState('');

  // Ship-to vendor autocomplete state
  const [shipToSuggestions, setShipToSuggestions] = useState([]);
  const [shipToFromDb, setShipToFromDb] = useState(false); // true when address was autofilled

  useEffect(() => {
    if (template === 'paccar') {
      api.get('/vendors').then((res) => setVendors(res.data));
    }
    if (template === 'individual') {
      api.get('/vendors').then((res) => setIndVendors(res.data));
      // Reset individual state on template switch
      setIndVendorId('');
      setIndParts([]);
      setIndPart(null);
      setIndDate('');
      setIndQty('');
    }
  }, [template]);

  const loadIndividualParts = (vendorId) => {
    setIndVendorId(vendorId);
    setIndPart(null);
    setIndParts([]);
    if (vendorId) {
      api.get(`/parts/${vendorId}`).then((res) => setIndParts(res.data));
    }
  };

  // Ship-to: search vendors as user types in company field
  useEffect(() => {
    if (template !== 'ship-to' || !company.trim()) {
      setShipToSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      api.get(`/vendors/search?q=${encodeURIComponent(company)}`)
        .then((res) => setShipToSuggestions(res.data))
        .catch(() => setShipToSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [company, template]);

  // Reset ship-to autofill flag when company is cleared
  useEffect(() => {
    if (!company) {
      setShipToFromDb(false);
      setShipToSuggestions([]);
    }
  }, [company]);

  const loadParts = (vendorId) => {
    setSelectedVendor(vendorId);
    api.get(`/parts/${vendorId}`).then((res) => setParts(res.data));
  };

  // Autofill ship-to address from a selected vendor suggestion
  const pickShipToVendor = (v) => {
    setCompany(v.vendor_name);
    setAddress1(v.address_line1 || '');
    setAddress2(v.address_line2 || '');
    setCountry(v.country || '');
    setShipToSuggestions([]);
    setShipToFromDb(true);
  };

  const generatePDF = async () => {

    setPdfError('');
    try {
      const payload = template === 'individual'
        ? {
            template,
            part_id: indPart?.id,
            date: indDate,
            qty: indQty,
          }
        : {
            part_id: selectedPart?.id,
            part_number: selectedPart?.part_number || '',
            description: selectedPart?.description || '',
            totalItems,
            perBox,
            po,
            template,
            company,
            address1,
            address2,
            country,
            pallet,
          };

      const response = await api.post(
        '/generate',
        payload,
        { responseType: 'blob' },
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'label.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setPdfError('Could not generate PDF. Check required fields and try again.');
    }
  };

  const canGeneratePaccar =
    template === 'paccar' && selectedPart && totalItems && perBox;
  const canGenerateShipTo = template === 'ship-to' && company && address1 && pallet;
  const canGenerateSimple = template === 'packing-slip' || template === 'mixed-load';
  const canGenerateIndividual =
    template === 'individual' && indPart && indDate && Number(indQty) > 0;
  const canGenerate =
    template &&
    (canGeneratePaccar || canGenerateShipTo || canGenerateSimple || canGenerateIndividual);

  return (
    <div className="page app-page">
      <header className="top-bar">
        <div>
          <h2>Label generator</h2>
          <span className="muted">
            Signed in as <strong>{user?.username}</strong> ({user?.role})
          </span>
        </div>
        <nav className="nav-actions">
          {isAdmin ? (
            <Link to="/admin" className="link-btn">
              Admin dashboard
            </Link>
          ) : null}
          <button type="button" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>

      <main className="main-content">
        <label>
          Select template
          <select
            value={template}
            onChange={(e) => {
              setTemplate(e.target.value);
              setSelectedVendor('');
              setSelectedPart(null);
            }}
          >

            <option value="paccar">PACCAR label</option>
            <option value="packing-slip">Packing slip enclosed</option>
            <option value="ship-to">Ship-to label</option>
            <option value="mixed-load">Mixed load label</option>
            <option value="individual">Individual Label</option>
          </select>
        </label>

        {template === 'paccar' && (
          <section className="section">
            <label>
              Vendor
              <select
                value={selectedVendor}
                onChange={(e) => loadParts(e.target.value)}
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name}
                  </option>
                ))}
              </select>
            </label>

            {selectedVendor ? (
              <label>
                Part
                <select
                  value={selectedPart?.id ?? ''}
                  onChange={(e) =>
                    setSelectedPart(parts.find((p) => String(p.id) === e.target.value))
                  }
                >
                  <option value="">Select part</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.part_number}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {selectedPart ? (
              <>
                <p className="muted">
                  On label: <strong>{paccarOriginPreview(selectedPart.country_of_origin)}</strong>
                </p>
                <label>
                  Total items
                  <input
                    type="number"
                    value={totalItems}
                    onChange={(e) => setTotalItems(e.target.value)}
                    min="1"
                  />
                </label>
                <label>
                  Per box capacity
                  <input
                    type="number"
                    value={perBox}
                    onChange={(e) => setPerBox(e.target.value)}
                    min="1"
                  />
                </label>
                <label>
                  PO (K)
                  <input
                    type="text"
                    value={po}
                    onChange={(e) => setPo(e.target.value)}
                  />
                </label>
              </>
            ) : null}
          </section>
        )}

        {template === 'ship-to' && (
          <section className="section">
            {/* Company with autocomplete */}
            <label style={{ position: 'relative' }}>
              Company / Vendor name
              <input
                type="text"
                value={company}
                placeholder="Start typing vendor name…"
                onChange={(e) => { setCompany(e.target.value); setShipToFromDb(false); }}
                autoComplete="off"
              />
              {shipToSuggestions.length > 0 && (
                <ul className="autocomplete-list">
                  {shipToSuggestions.map((v) => (
                    <li key={v.id} onMouseDown={() => pickShipToVendor(v)}>
                      <strong>{v.vendor_name}</strong>
                      {v.vendor_code ? <span className="muted"> · {v.vendor_code}</span> : null}
                      {v.address_line1 ? <span className="muted"> · {v.address_line1}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </label>

            {shipToFromDb && (
              <p className="muted" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                ✓ Address autofilled from database — edit below if needed
              </p>
            )}

            <label>
              Address line 1
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </label>
            <label>
              Address line 2
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </label>
            <label>
              Country
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
            <label>
              Total pallets
              <input
                type="number"
                value={pallet}
                onChange={(e) => setPallet(e.target.value)}
                min="1"
              />
            </label>
          </section>
        )}

        {template === 'individual' && (
          <section className="section">
            {/* Step 1: Vendor */}
            <label>
              Vendor
              <select
                value={indVendorId}
                onChange={(e) => loadIndividualParts(e.target.value)}
              >
                <option value="">Select vendor</option>
                {indVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_name}
                  </option>
                ))}
              </select>
            </label>

            {/* Step 2: Part No. */}
            {indVendorId && (
              <label>
                Part No.
                <select
                  value={indPart?.id ?? ''}
                  onChange={(e) =>
                    setIndPart(indParts.find((p) => String(p.id) === e.target.value) || null)
                  }
                >
                  <option value="">Select part</option>
                  {indParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.part_number}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Step 3: Description preview (read-only from DB) */}
            {indPart && (
              <div className="desc-preview">
                <p><strong>{indPart.description_eng || '—'}</strong></p>
                <p className="muted">{indPart.description_fr  || '—'}</p>
                <p className="muted">{indPart.description_esp || '—'}</p>
              </div>
            )}

            {/* Step 4: Date → formatted as SDDMMYYYY */}
            {indPart && (
              <label>
                Date Code
                <input
                  type="date"
                  value={indDate}
                  onChange={(e) => setIndDate(e.target.value)}
                />
                {indDate && (
                  <span className="muted" style={{ marginLeft: 8 }}>
                    → {(() => {
                      const [y, m, d] = indDate.split('-');
                      return `S${d}${m}${y}`;
                    })()}
                  </span>
                )}
              </label>
            )}

            {/* Step 5: Quantity */}
            {indPart && indDate && (
              <label>
                Quantity (one label per unit)
                <input
                  type="number"
                  min="1"
                  value={indQty}
                  onChange={(e) => setIndQty(e.target.value)}
                />
              </label>
            )}
          </section>
        )}

        {pdfError ? <p className="error">{pdfError}</p> : null}

        {template ? (
          <button
            type="button"
            onClick={generatePDF}
            disabled={!canGenerate}
            className="primary-action"
          >
            Generate PDF
          </button>
        ) : null}
      </main>
    </div>
  );
}
