# API für Converter
import tempfile
import os
import base64  # Füge diesen Import hinzu
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from mergefunction import merge_pdfs

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_files():
    # Überprüfen, ob die Datei-Keys im JSON vorhanden sind
    if 'files' not in request.json:
        return jsonify({'error': 'Keine Dateien hochgeladen'}), 400

    # Erstelle eine temporäre Liste zur Speicherung der Datei-Pfade
    pdf_files = []

    # Speichere alle hochgeladenen Dateien temporär
    for idx, file_data in enumerate(request.json['files']):
        try:
            # Hier wird erwartet, dass file_data ein Base64-String ist
            file_bytes = base64.b64decode(file_data)
            # Generiere einen einzigartigen Dateinamen, um Überschreibungen zu vermeiden
            temp_path = os.path.join(tempfile.gettempdir(), f'uploaded_file_{idx}.pdf')
            print(f'Datei gespeichert unter: {temp_path}')
            with open(temp_path, 'wb') as f:
                f.write(file_bytes)
            pdf_files.append(temp_path)
        except Exception as e:
            return jsonify({'error': f'Fehler beim Verarbeiten der Datei: {e}'}), 500
    
    # Temporärer Pfad für das zusammengeführte PDF
    merged_pdf_path = os.path.join(tempfile.gettempdir(), 'merged.pdf')
    

    # Führe die PDF-Dateien zusammen
    try:
        merge_pdfs(pdf_files, merged_pdf_path)
        print('PDFs wurden erfolgreich zusammengeführt.')
    except Exception as e:
        print(f'Fehler beim Zusammenführen der PDFs: {e}')
        return jsonify({'error': 'Fehler beim Zusammenführen der PDFs'}), 501
    
    #Check
    if not os.path.exists(merged_pdf_path):
        return jsonify({'error': 'Zusammengeführte PDF-Datei wurde nicht erstellt'}), 502

    # Erstelle die URL für den Download der zusammengeführten PDF
    download_url = f'http://{request.host}:30081/download/{os.path.basename(merged_pdf_path)}'
    # Entferne die temporären Dateien (hier erst nach dem Download)
    for pdf_file in pdf_files:
        os.remove(pdf_file)

    # Sende die URL der zusammengeführten PDF-Datei als JSON-Antwort
    return jsonify({
        'message': 'PDFs erfolgreich zusammengeführt',
        'download_link': download_url
    }), 206 

@app.route('/download/merger.pdf', methods=['GET'])
def download_file():
    # Erstelle den vollständigen Pfad zur Datei
    file_path = os.path.join(tempfile.gettempdir(), 'merger.pdf')
    if os.path.exists(file_path):
        response = send_file(file_path, as_attachment=True,attachment_filename='merger.pdf', mimetype='application/pdf')
        
        # Optional: Du kannst die Datei hier löschen, wenn du möchtest
        os.remove(file_path)  # Diese Zeile auskommentieren, um die Datei nach dem Download zu löschen.
        
        return response
    else:
        return jsonify({'error': 'Datei nicht gefunden'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
