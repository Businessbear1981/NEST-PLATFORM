FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD gunicorn -k gevent -w 1 --bind 0.0.0.0:$PORT --timeout 120 --worker-connections 1000 app:app
