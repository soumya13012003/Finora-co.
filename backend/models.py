"""
Database Models for Finora-Co
SQLAlchemy ORM models for Reports, Chat Sessions, and Messages
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class Report(db.Model):
    """Represents an uploaded and processed PDF report"""
    __tablename__ = 'reports'

    id = db.Column(db.String(36), primary_key=True)  # UUID
    filename = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    pages = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='processed')  # pending, processed, failed
    
    # Store analysis as JSON
    analysis_data = db.Column(db.JSON, nullable=False, default=dict)
    
    # Relationships
    chat_messages = db.relationship('Message', backref='report', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'filename': self.filename,
            'uploaded_at': self.uploaded_at.isoformat(),
            'pages': self.pages,
            'status': self.status,
            'analysis': self.analysis_data
        }
    
    @staticmethod
    def from_dict(data):
        """Create Report from dictionary"""
        report = Report()
        report.id = data.get('id')
        report.filename = data.get('filename')
        report.pages = data.get('pages', 0)
        report.analysis_data = data.get('analysis', {})
        report.status = data.get('status', 'processed')
        return report


class ChatSession(db.Model):
    """Represents a chat session between user and AI assistant"""
    __tablename__ = 'chat_sessions'

    id = db.Column(db.String(36), primary_key=True)  # UUID
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_messages=False):
        """Convert to dictionary for JSON response"""
        data = {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'message_count': len(self.messages)
        }
        if include_messages:
            data['messages'] = [msg.to_dict() for msg in self.messages]
        return data
    
    @staticmethod
    def create_session(session_id):
        """Create a new chat session"""
        session = ChatSession(id=session_id)
        return session


class Message(db.Model):
    """Represents a single message in a chat session"""
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String(36), db.ForeignKey('chat_sessions.id'), nullable=False)
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id'), nullable=True)
    
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat()
        }
    
    @staticmethod
    def create_message(session_id, role, content, report_id=None):
        """Create a new message"""
        message = Message(
            session_id=session_id,
            report_id=report_id,
            role=role,
            content=content
        )
        return message
