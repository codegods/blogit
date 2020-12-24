FROM ubuntu:focal

RUN mkdir -p /var/www/blogit
WORKDIR /var/www/blogit

# Installs build/runtime dependencies
RUN apt-get update
RUN apt-get install -y gcc build-essential python3 python3-venv python3-dev

# Creates a virtual environment
RUN python3 -m venv .venv

# This enables production mode
ENV BLOGIT_MODE 1

# First we install dependencies so that whole cache isn't invalidated
COPY requirements.txt /var/www/blogit
RUN ["./.venv/bin/python" ,"-m" ,"pip", "install", "-r", "requirements.txt"]

# Delete build dependencies
RUN apt-get remove -y gcc build-essential python3-dev
RUN apt-get purge -y gcc build-essential python3-dev
RUN apt-get autoremove -y
RUN apt-get clean

# Remove cache
RUN rm -d -r ~/.cache

COPY . /var/www/blogit

# Create database tables
RUN ["./.venv/bin/python", "-m", "scripts.init_db"]
ENTRYPOINT [ "./.venv/bin/gunicorn", "--workers=2" ,"--worker-class=\"egg:meinheld#gunicorn_worker\"", "\"scripts.start:gunicorn()\"" ]
