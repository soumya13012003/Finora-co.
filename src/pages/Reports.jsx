import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Clock, File, Trash2, RefreshCw } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8000/api'

export default function Reports({ onReportUploaded, backendOnline }) {
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports`)
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch {
      // Backend not available
    }
    setLoadingReports(false)
  }

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setUploadResult({ error: 'Please upload a PDF file' })
      return
    }

    // Client-side size check
    if (file.size > 100 * 1024 * 1024) {
      setUploadResult({ error: `File too large (${(file.size / 1e6).toFixed(1)}MB). Maximum is 100MB.` })
      return
    }

    setUploading(true)
    setUploadResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE}/reports/upload`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadResult({ success: true, data })
        // Refresh report list
        fetchReports()
        // Tell App to refresh dashboard data
        if (onReportUploaded) onReportUploaded()
      } else {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `Upload failed (${response.status})`)
      }
    } catch (e) {
      setUploadResult({ error: e.message || 'Upload failed. Is the backend server running?' })
    }

    setUploading(false)
  }

  const handleDelete = async (reportId) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${reportId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchReports()
        if (onReportUploaded) onReportUploaded()
      }
    } catch {
      // ignore
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // Reset input so same file can be uploaded again
    e.target.value = ''
  }

  return (
    <div>
      <div className="page-header">
        <h2>Report Management</h2>
        <p>Upload annual reports — extracted data will populate the dashboard automatically</p>
      </div>

      {/* Backend status */}
      {!backendOnline && (
        <div className="alert-item risk" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} />
          <span>Backend server is not running. Start it with: <code style={{background:'rgba(0,0,0,0.3)',padding:'2px 6px',borderRadius:4}}>cd backend && uvicorn main:app --reload</code></span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="section">
        <div
          className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          {uploading ? (
            <>
              <RefreshCw size={48} style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
              <h3>Processing Report...</h3>
              <p>Extracting text, tables, and financial data...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </>
          ) : (
            <>
              <Upload />
              <h3>Upload Annual Report</h3>
              <p>Drag & drop a PDF file here or click to browse</p>
              <p style={{ fontSize: 12, marginTop: 8, color: '#475569' }}>Supports PDF up to 100MB · Max 500 pages</p>
            </>
          )}
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="chart-card" style={{ marginTop: 16 }}>
            {uploadResult.error ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#EF4444' }}>
                <AlertCircle size={20} />
                <span>{uploadResult.error}</span>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CheckCircle size={20} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#10B981' }}>Report Analyzed Successfully!</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>File</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{uploadResult.data.filename}</div>
                  </div>
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Size</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{uploadResult.data.file_size_mb}MB</div>
                  </div>
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Pages</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{uploadResult.data.pages}</div>
                  </div>
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Text Chunks</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{uploadResult.data.chunks_created}</div>
                  </div>
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Tables Found</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{uploadResult.data.tables_found}</div>
                  </div>
                </div>

                {uploadResult.data.financial_summary && (
                  <div style={{ marginTop: 16, padding: 16, background: 'rgba(59,130,246,0.08)', borderRadius: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3B82F6', marginBottom: 8 }}>
                      📊 Extracted Financial Metrics
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                      {Object.entries(uploadResult.data.financial_summary)
                        .filter(([k, v]) => v && !k.startsWith('_'))
                        .map(([key, val]) => (
                          <div key={key}>
                            <div style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                              {typeof val === 'number' && val > 1000
                                ? `$${(val / 1e6).toFixed(1)}M`
                                : typeof val === 'number'
                                ? `${val}%`
                                : val}
                            </div>
                          </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>
                      ✅ This data is now shown on the Dashboard. Go to Dashboard to see your report insights!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="section">
        <div className="section-title"><FileText size={20} /> Uploaded Reports ({reports.length})</div>
        <div className="chart-card">
          {loadingReports ? (
            <div style={{ padding: 24 }}>
              <div className="loading-skeleton" style={{ width: '100%', height: 200 }} />
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No Reports Yet</h3>
              <p>Upload a PDF annual report above. Extracted financial data will populate the entire dashboard.</p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Report</th>
                    <th>Company</th>
                    <th>Uploaded</th>
                    <th>Pages</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, i) => (
                    <tr key={report.id}>
                      <td style={{ fontWeight: 700, color: '#8B5CF6' }}>#{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: 'rgba(59,130,246,0.12)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}>
                            <File size={18} style={{ color: '#3B82F6' }} />
                          </div>
                          <span className="value">{report.name || report.filename}</span>
                        </div>
                      </td>
                      <td>{report.company || '—'}</td>
                      <td style={{ color: '#94A3B8' }}>{report.date}</td>
                      <td style={{ fontWeight: 600 }}>{report.pages}</td>
                      <td style={{ color: '#94A3B8' }}>{report.file_size_mb ? `${report.file_size_mb}MB` : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle size={14} style={{ color: '#10B981' }} />
                          <span style={{ fontSize: 13, color: '#10B981' }}>Analyzed</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(report.id) }}
                          style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#EF4444', padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12
                          }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
