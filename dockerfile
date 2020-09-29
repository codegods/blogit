FROM ubuntu:focal

RUN mkdir -p /var/www/blogit
COPY . /var/www/blogit

WORKDIR /var/www/blogit

# Update apt
RUN apt-get update

# Install requisutes
RUN apt-get -y install curl gnupg

# Nodejs
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Install required tools
RUN apt-get install -y python3 python3-venv 

# Create a virtual environment and install dependencies
RUN python3 -m venv venv
RUN /bin/bash -c "source /var/www/blogit/venv/bin/activate; python -m pip install -r requirements.txt"

# I prefer yarn over npm
RUN npm i -g yarn

# Install dependecies and build the react app
RUN cd frontend
RUN yarn
RUN yarn build

EXPOSE 2811

CMD [ "/bin/bash", "-c", "source /var/www/blogit/venv/bin/activate;python main.py" ]
