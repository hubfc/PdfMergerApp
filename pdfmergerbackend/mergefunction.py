def merge_pdfs(pdf_list, output_name):
    merger = PdfMerger()
    
    for pdf in pdf_list:
        merger.append(pdf)
    
    # Speichert die zusammengeführte Datei mit dem angegebenen Namen
    merger.write(output_name)
    merger.close()

# Beispielaufruf
#pdfs_to_merge = ['/Users/florian/Documents/Github/PdfMergerApp/pdfmergerbackend/1_Anschreiben.pdf', '/Users/florian/Documents/Github/PdfMergerApp/pdfmergerbackend/2_Lebenslauf.pdf']
#merge_pdfs(pdfs_to_merge, 'merged_output.pdf')
