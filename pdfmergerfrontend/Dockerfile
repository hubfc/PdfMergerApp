FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/pdfmerger/index.html
COPY styles.css /usr/share/nginx/html/pdfmerger/styles.css
COPY script.js /usr/share/nginx/html/pdfmerger/script.js

EXPOSE 81
