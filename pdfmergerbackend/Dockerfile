FROM python:3.12-slim

RUN apt-get update && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Zuerst nur die requirements.txt kopieren und installieren
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Dann den Rest des Codes kopieren
COPY . .

EXPOSE 5001
CMD ["python", "app.py"]
