FROM python:3.12-slim

WORKDIR /app

COPY  python-requirements.txt .
RUN pip install --no-cache-dir -r python-requirements.txt


COPY . .
