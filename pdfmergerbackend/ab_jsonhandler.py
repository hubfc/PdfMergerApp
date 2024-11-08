# json_handler.py
import base64
import tempfile
import os

def process_files(json_data):
    if 'files' not in json_data:
        raise ValueError('Keine Dateien hochgeladen')

    pdf_files = []
    for idx, file_data in enumerate(json_data['files']):
        try:
            # Dekodierung des Base64-Codes
            file_bytes = base64.b64decode(file_data)
            temp_path = os.path.join(tempfile.gettempdir(), f'uploaded_file_{idx}.pdf')
            with open(temp_path, 'wb') as f:
                f.write(file_bytes)
            pdf_files.append(temp_path)
        except Exception as e:
            raise ValueError(f'Fehler beim Verarbeiten der Datei: {e}')
    
    return pdf_files
