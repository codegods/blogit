FROM python:3.8-slim

RUN mkdir -p /var/www/blogit
WORKDIR /var/www/blogit

# This enables production mode
ENV BLOGIT_MODE 1

# First we install dependencies so that whole cache isn't invalidated
COPY requirements.txt /var/www/blogit
RUN python -m pip install -r requirements.txt

COPY . /var/www/blogit
ENTRYPOINT [ "python", "-m", "scripts.start" ]