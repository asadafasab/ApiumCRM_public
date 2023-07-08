FROM python:3.10-alpine

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app
ADD . /app 
RUN apk add --update --no-cache py3-pandas postgresql py3-psycopg2
ENV PYTHONPATH=/usr/lib/python3.10/site-packages
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

WORKDIR /app

# RUN python manage.py collectstatic --noinput
# RUN python manage.py migrate
CMD ["python", "-m","gunicorn","--bind",":8000","backend.wsgi:application"]
