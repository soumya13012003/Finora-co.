import { Upload } from 'lucide-react'

export function EmptyDataState({ title, message, onNavigate }) {
  return (
    <div className='chart-card' style={{textAlign:'center', padding:'48px 24px', margin: '24px 0'}}>
      <Upload size={48} style={{color:'#3B82F6', marginBottom: 16}} />
      <h3 style={{fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 8}}>
        {title || 'No Data Available'}
      </h3>
      <p style={{fontSize: 14, color: '#94A3B8', maxWidth: 480, margin: '0 auto 20px'}}>
        {message || 'Upload annual reports to generate insights for this page.'}
      </p>
      {onNavigate && (
        <button 
          className='chat-send-btn' 
          onClick={() => onNavigate('reports')} 
          style={{
            margin: '0 auto', width: 'auto', padding: '0 20px', 
            borderRadius: 8, fontSize: 13, gap: 8 
          }}
        >
          <Upload size={16}/>
          <span>Go to Reports</span>
        </button>
      )}
    </div>
  )
}
