# APIs für Converter und Download

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import tempfile
from ab_jsonhandler import process_files
from ac_mergefunction import merge_pdfs
from ad_urlgenerator import generate_download_url

app = Flask(__name__)
CORS(app)

# Pfad für zusammengeführte pdfs
merged_pdf_path = os.path.join(tempfile.gettempdir(), 'merged.pdf')

@app.route('/pdfmerger/upload', methods=['POST'])
def upload_files():

    # Überprüfen und Verarbeiten der hochgeladenen Daten
    try:
        pdf_files = process_files(request.json)
    except ValueError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

    # Merge pdfs
    try:
        merge_pdfs(pdf_files, merged_pdf_path)  
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Fehler beim Zusammenführen der PDFs: {str(e)}'}), 500

    # Erstelle die Download-URL
    download_url = generate_download_url(request.host,'30080')  

    # Bereinige temporäre Dateien
    for pdf_file in pdf_files:
        os.remove(pdf_file)

    return jsonify({
        'status': 'success',
        'message': 'PDFs erfolgreich zusammengeführt',
        'download_link': download_url
    })
    # Code


@app.route('/pdfmerger/download', methods=['GET'])
def download_file():

    # Erstelle Pfad zur Datei
    if os.path.exists(merged_pdf_path):
        response = send_file(merged_pdf_path, as_attachment=True)
        
        # Optional: Du kannst die Datei hier löschen, wenn du möchtest
        os.remove(merged_pdf_path)  # Diese Zeile auskommentieren, um die Datei nach dem Download zu löschen.
        
        return response
    else:
        return jsonify({'error': 'Datei nicht gefunden'}), 406

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)