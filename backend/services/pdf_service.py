"""
PDF Extraction Service
Handles parsing and extracting text from PDF annual reports
"""

import os
import re
from PyPDF2 import PdfReader


class PDFService:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder

    def extract_text(self, filepath):
        """Extract text and metadata from a PDF file"""
        text_content = []
        metadata = {}

        try:
            reader = PdfReader(filepath)
            metadata['pages'] = len(reader.pages)
            metadata['filename'] = os.path.basename(filepath)

            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_content.append({
                        'page': i + 1,
                        'text': page_text
                    })

            full_text = '\n'.join([p['text'] for p in text_content])

            # Extract financial figures
            financial_data = self._extract_financial_data(full_text)

            # Extract regional mentions
            regional_data = self._extract_regional_data(full_text)

            return {
                'text': full_text,
                'pages': metadata.get('pages', 0),
                'tables': [],
                'financial_data': financial_data,
                'regional_data': regional_data,
                'metadata': metadata,
                'page_texts': text_content
            }

        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")

    def _extract_financial_data(self, text):
        """Extract financial figures from text"""
        data = {
            'revenue_mentions': [],
            'profit_mentions': [],
            'growth_mentions': [],
            'currency_amounts': []
        }

        # Revenue patterns
        revenue_pattern = r'(?:revenue|sales|turnover|income)\s*(?:of|:|\s)?\s*(?:Rs\.?|INR|USD|\$|₹)?\s*([\d,]+\.?\d*)\s*(?:crore|million|billion|lakh|thousand|cr|mn|bn)?'
        matches = re.findall(revenue_pattern, text, re.IGNORECASE)
        data['revenue_mentions'] = [m.replace(',', '') for m in matches[:10]]

        # Profit patterns
        profit_pattern = r'(?:profit|net income|EBITDA|PAT)\s*(?:of|:|\s)?\s*(?:Rs\.?|INR|USD|\$|₹)?\s*([\d,]+\.?\d*)\s*(?:crore|million|billion|lakh|cr|mn|bn)?'
        matches = re.findall(profit_pattern, text, re.IGNORECASE)
        data['profit_mentions'] = [m.replace(',', '') for m in matches[:10]]

        # Growth patterns
        growth_pattern = r'(?:growth|grew|increase|rise)\s*(?:of|by|:|\s)?\s*([\d.]+)\s*%'
        matches = re.findall(growth_pattern, text, re.IGNORECASE)
        data['growth_mentions'] = matches[:10]

        # Currency amounts
        curr_pattern = r'(?:Rs\.?|INR|USD|\$|₹)\s*([\d,]+\.?\d*)\s*(?:crore|million|billion|lakh|thousand|cr|mn|bn)?'
        matches = re.findall(curr_pattern, text)
        data['currency_amounts'] = [m.replace(',', '') for m in matches[:20]]

        return data

    def _extract_regional_data(self, text):
        """Extract regional/location mentions from text"""
        regions = {
            'cities': [],
            'states': [],
            'countries': []
        }

        # Common Indian cities
        indian_cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Chennai', 'Hyderabad',
            'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat',
            'Kochi', 'Chandigarh', 'Indore', 'Nagpur', 'Coimbatore', 'Vizag',
            'Noida', 'Gurgaon', 'Gurugram', 'Thiruvananthapuram'
        ]

        # Common states
        indian_states = [
            'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat',
            'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Punjab',
            'Madhya Pradesh', 'Andhra Pradesh', 'Bihar', 'Odisha', 'Haryana'
        ]

        # Countries
        countries = [
            'India', 'USA', 'United States', 'UK', 'United Kingdom', 'Germany',
            'Japan', 'China', 'Australia', 'Canada', 'Singapore', 'UAE',
            'Dubai', 'France', 'Brazil', 'South Korea', 'Netherlands'
        ]

        for city in indian_cities:
            if re.search(r'\b' + city + r'\b', text, re.IGNORECASE):
                regions['cities'].append(city)

        for state in indian_states:
            if re.search(r'\b' + state + r'\b', text, re.IGNORECASE):
                regions['states'].append(state)

        for country in countries:
            if re.search(r'\b' + country + r'\b', text, re.IGNORECASE):
                regions['countries'].append(country)

        return regions
