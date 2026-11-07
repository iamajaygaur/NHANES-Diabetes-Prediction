# Hugging Face Spaces (Docker SDK) — API listens on 7860 by default.
#
# Local test (repo root as build context):
#   docker build -t diabetesinsight-hf -f spaces/Dockerfile .
#   docker run --rm -p 7860:7860 -e CORS_ORIGINS=https://diabetesinsight.vercel.app diabetesinsight-hf
#
# HF Space root must contain this Dockerfile + README.md plus sibling dirs:
#   backend/  reference/  docs/
# (same layout as the monorepo root). Railway/local still use backend/Dockerfile (port 8000).

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=7860

COPY backend/requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY backend /app/backend
COPY reference /app/reference
COPY docs /app/docs

WORKDIR /app/backend

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import os,urllib.request; p=os.environ.get('PORT','7860'); urllib.request.urlopen(f'http://127.0.0.1:{p}/api/health')"

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
