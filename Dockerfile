FROM python:3.13.7-slim

WORKDIR /app

RUN python -m venv /venv

ENV PATH="/venv/bin:$PATH"

COPY requirements.txt . 

RUN pip install -r requirements.txt 

COPY . . 

EXPOSE 8000

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]