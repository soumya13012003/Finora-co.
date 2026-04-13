"""
Finora-Co Backend API Server
Annual Report Analysis, Investment Intelligence & Smart Chatbot
"""

import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'finora-secret-key-2026')
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_FILE_SIZE_MB', 50)) * 1024 * 1024

# Database configuration
database_url = os.getenv(
    'DATABASE_URL',
    'sqlite:///finora.db'  # Default to SQLite for local dev; override with PostgreSQL for production
)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize database
from models import db, Report, ChatSession, Message
db.init_app(app)

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(__file__), 'vector_store'), exist_ok=True)

# Import services
from services.pdf_service import PDFService
from services.analysis_service import AnalysisService
from services.chat_service import ChatService
from services.vector_service import VectorService

pdf_service = PDFService(app.config['UPLOAD_FOLDER'])
analysis_service = AnalysisService()
vector_service = VectorService(os.path.join(os.path.dirname(__file__), 'vector_store'))
chat_service = ChatService(vector_service)

# Create database tables
with app.app_context():
    db.create_all()
    print("[OK] Database tables initialized")


# ─────────────────────── Health Check ───────────────────────
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Finora-Co API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })


# ─────────────────────── Document Upload & Processing ───────────────────────
@app.route('/api/documents/upload', methods=['POST'])
def upload_document():
    """Upload and process a PDF annual report"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400

    try:
        # Save file
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text from PDF
        extracted_data = pdf_service.extract_text(filepath)

        # Analyze the extracted data
        analysis = analysis_service.analyze_report(extracted_data)

        # Store in vector database for RAG
        vector_service.add_document(file_id, extracted_data['text'], extracted_data.get('metadata', {}))

        # Store report in database
        report = Report(
            id=file_id,
            filename=file.filename,
            pages=extracted_data.get('pages', 0),
            analysis_data=analysis,
            status='processed'
        )
        db.session.add(report)
        db.session.commit()

        return jsonify({
            'message': 'Document processed successfully',
            'report': report.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500


@app.route('/api/documents', methods=['GET'])
def list_documents():
    """List all processed documents"""
    reports = Report.query.all()
    docs = [report.to_dict() for report in reports]
    return jsonify({'documents': docs, 'total': len(docs)})


@app.route('/api/documents/<doc_id>', methods=['GET'])
def get_document(doc_id):
    """Get a specific document's analysis"""
    report = Report.query.get(doc_id)
    if not report:
        return jsonify({'error': 'Document not found'}), 404
    return jsonify({'document': report.to_dict()})


@app.route('/api/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete a document"""
    report = Report.query.get(doc_id)
    if not report:
        return jsonify({'error': 'Document not found'}), 404
    
    db.session.delete(report)
    db.session.commit()
    vector_service.remove_document(doc_id)
    return jsonify({'message': 'Document deleted'})


# ─────────────────────── Analytics & Insights ───────────────────────
@app.route('/api/analytics/overview', methods=['GET'])
def analytics_overview():
    """Get aggregated analytics overview"""
    reports = Report.query.all()
    if not reports:
        return jsonify({
            'total_reports': 0,
            'total_revenue': 0,
            'revenue_growth': 0,
            'top_regions': [],
            'demand_trends': [],
            'risk_indicators': [],
            'investment_zones': [],
            'monthly_revenue': [],
            'category_breakdown': [],
            'regional_performance': [],
            'message': 'Upload annual reports to see analytics'
        })

    reports_data = [report.to_dict() for report in reports]
    overview = analysis_service.generate_overview(reports_data)
    return jsonify(overview)


@app.route('/api/analytics/regional', methods=['GET'])
def regional_analytics():
    """Get location-based insights"""
    reports = Report.query.all()
    if not reports:
        return jsonify({'regions': [], 'message': 'No data available'})

    reports_data = [report.to_dict() for report in reports]
    regional = analysis_service.get_regional_insights(reports_data)
    return jsonify(regional)


@app.route('/api/analytics/demand-trends', methods=['GET'])
def demand_trends():
    """Get demand trend analysis"""
    reports = Report.query.all()
    if not reports:
        return jsonify({'trends': [], 'message': 'No data available'})

    reports_data = [report.to_dict() for report in reports]
    trends = analysis_service.get_demand_trends(reports_data)
    return jsonify(trends)


@app.route('/api/analytics/investment-zones', methods=['GET'])
def investment_zones():
    """Get investment opportunity zones"""
    reports = Report.query.all()
    if not reports:
        return jsonify({'zones': [], 'message': 'No data available'})

    reports_data = [report.to_dict() for report in reports]
    zones = analysis_service.get_investment_zones(reports_data)
    return jsonify(zones)


@app.route('/api/analytics/risk-growth', methods=['GET'])
def risk_growth():
    """Get risk and growth indicators"""
    reports = Report.query.all()
    if not reports:
        return jsonify({'indicators': [], 'message': 'No data available'})

    reports_data = [report.to_dict() for report in reports]
    indicators = analysis_service.get_risk_growth_indicators(reports_data)
    return jsonify(indicators)


# ─────────────────────── Demo Data ───────────────────────
@app.route('/api/demo/load', methods=['POST'])
def load_demo_data():
    """Load demo data for demonstration purposes"""
    demo_data = analysis_service.generate_demo_data()
    for demo_report in demo_data:
        report = Report(
            id=demo_report['id'],
            filename=demo_report['filename'],
            pages=demo_report.get('pages', 0),
            analysis_data=demo_report['analysis'],
            status='demo'
        )
        db.session.add(report)

        # Add demo data to vector store
        vector_service.add_document(
            demo_report['id'],
            json.dumps(demo_report['analysis']),
            {'filename': demo_report['filename'], 'type': 'demo'}
        )
    
    db.session.commit()

    return jsonify({
        'message': 'Demo data loaded successfully',
        'reports_loaded': len(demo_data)
    })


@app.route('/api/demo/clear', methods=['POST'])
def clear_demo_data():
    """Clear all data"""
    Report.query.delete()
    ChatSession.query.delete()
    db.session.commit()
    vector_service.clear_all()
    return jsonify({'message': 'All data cleared'})


# ─────────────────────── Chatbot ───────────────────────
@app.route('/api/chat', methods=['POST'])
def chat():
    """Send a message to the Finora Assistant"""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400

    session_id = data.get('session_id') or str(uuid.uuid4())
    message = data['message']

    # Get or create session
    session = ChatSession.query.get(session_id)
    if not session:
        session = ChatSession(id=session_id)
        db.session.add(session)
        db.session.commit()

    # Add user message
    user_msg = Message.create_message(session_id, 'user', message)
    db.session.add(user_msg)
    db.session.commit()

    # Generate response using RAG
    context = vector_service.search(message, top_k=5)
    reports = Report.query.all()
    reports_context = [report.to_dict() for report in reports]
    
    # Get all messages in session for chat history
    session_messages = [msg.to_dict() for msg in Message.query.filter_by(session_id=session_id).all()]
    response = chat_service.generate_response(message, context, reports_context, session_messages)

    # Add assistant response
    assistant_msg = Message.create_message(session_id, 'assistant', response)
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        'session_id': session_id,
        'response': response,
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/chat/sessions', methods=['GET'])
def list_chat_sessions():
    """List chat sessions"""
    sessions = ChatSession.query.all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]})


@app.route('/api/chat/sessions/<session_id>', methods=['GET'])
def get_chat_session(session_id):
    """Get a specific chat session"""
    session = ChatSession.query.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    return jsonify({'session': session.to_dict(include_messages=True)})


# ─────────────────────── WebSocket for real-time chat ───────────────────────
@socketio.on('chat_message')
def handle_chat_message(data):
    session_id = data.get('session_id') or str(uuid.uuid4())
    message = data.get('message', '')

    # Get or create session
    session = ChatSession.query.get(session_id)
    if not session:
        session = ChatSession(id=session_id)
        db.session.add(session)
        db.session.commit()

    # Add user message
    user_msg = Message.create_message(session_id, 'user', message)
    db.session.add(user_msg)
    db.session.commit()

    # Generate response using RAG
    context = vector_service.search(message, top_k=5)
    reports = Report.query.all()
    reports_context = [report.to_dict() for report in reports]
    
    # Get all messages in session for chat history
    session_messages = [msg.to_dict() for msg in Message.query.filter_by(session_id=session_id).all()]
    response = chat_service.generate_response(message, context, reports_context, session_messages)

    # Add assistant response
    assistant_msg = Message.create_message(session_id, 'assistant', response)
    db.session.add(assistant_msg)
    db.session.commit()

    emit('chat_response', {
        'session_id': session_id,
        'response': response,
        'timestamp': datetime.utcnow().isoformat()
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n[FINORA-CO] API running on http://localhost:{port}")
    print(f"   Health: http://localhost:{port}/api/health\n")
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)
