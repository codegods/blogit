FROM ubuntu:focal

RUN mkdir -p /var/www/blogit
COPY . /var/www/blogit

WORKDIR /var/www/blogit

# Update apt
RUN apt-get update

# Install required tools
RUN apt-get install -y python3 python3-venv 

# Create a virtual environment and install dependencies
RUN python3 -m venv venv
RUN /bin/bash -c "source /var/www/blogit/venv/bin/activate; python -m pip install -r requirements.txt"

EXPOSE 2811

CMD [ "/bin/bash", "-c", "source /var/www/blogit/venv/bin/activate;python main.py" ]
