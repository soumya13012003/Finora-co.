import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.listDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 15, 85));
    }, 300);

    try {
      const result = await api.uploadDocument(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(`"${file.name}" processed successfully! ${result.report?.pages || 0} pages analyzed.`);
      await fetchDocuments();

      setTimeout(() => {
        setUploadProgress(0);
        setSuccess(null);
      }, 3000);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, filename) => {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    try {
      await api.deleteDocument(docId);
      setSuccess(`"${filename}" deleted.`);
      await fetchDocuments();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2>Document Management</h2>
          <p>Upload and manage annual report PDFs for analysis</p>
        </div>
        <div className="flex gap-sm">
          <span className="badge navy">{documents.length} Documents</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="toast error" style={{ marginBottom: 16, position: 'relative', animation: 'none' }}>
          <span>❌</span>
          <div style={{ flex: 1 }}>
            <strong>Error</strong>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--gray-500)' }}>{error}</p>
          </div>
          <button className="btn-ghost" onClick={() => setError(null)} style={{ padding: 4 }}>✕</button>
        </div>
      )}

      {success && (
        <div className="toast success" style={{ marginBottom: 16, position: 'relative', animation: 'none' }}>
          <span>✅</span>
          <div style={{ flex: 1 }}>
            <strong>Success</strong>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--gray-500)' }}>{success}</p>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div className="card mb-lg">
        <div className="card-body" style={{ padding: 0 }}>
          <div
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {uploading ? (
              <div>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                <h3>Processing Document...</h3>
                <p>Extracting text, tables, and financial data</p>
                <div className="progress-bar" style={{ width: 300, margin: '16px auto 0' }}>
                  <div
                    className="progress-fill gold"
                    style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}
                  />
                </div>
                <p style={{ marginTop: 8, fontSize: '0.78rem' }}>{uploadProgress}% complete</p>
              </div>
            ) : (
              <>
                <div className="upload-zone-icon">📄</div>
                <h3>Drag & Drop PDF Annual Report</h3>
                <p>or click to browse files • Max 50MB • PDF format only</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
                  Browse Files
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">📂 Processed Documents</div>
            <div className="card-subtitle">{documents.length} report{documents.length !== 1 ? 's' : ''} analyzed</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p style={{ color: 'var(--gray-400)' }}>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h3>No Documents</h3>
            <p>Upload PDF annual reports to begin analysis. You can also load demo data from the Dashboard.</p>
          </div>
        ) : (
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {documents.map((doc) => (
              <div className="doc-card" key={doc.id}>
                <div className="doc-card-icon">📄</div>
                <div className="doc-card-info">
                  <h4>{doc.company || doc.filename}</h4>
                  <p>
                    {doc.pages} pages • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()} •{' '}
                    Revenue: ₹{doc.analysis?.summary?.total_revenue?.toFixed(0) || '—'} Cr
                  </p>
                </div>
                <div className="doc-card-actions">
                  <span className={`badge ${doc.status === 'processed' ? 'success' : 'warning'}`}>
                    {doc.status === 'processed' ? '✓ Processed' : 'Processing...'}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    title="Delete document"
                    style={{ color: 'var(--danger)' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;
