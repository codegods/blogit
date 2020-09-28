FROM ubuntu:focal

COPY . .

# Update apt
RUN apt-get update

# Install required tools
RUN apt-get install -y python3 python3-venv nodejs

# Create a virtual environment and install dependencies
RUN python3 -m venv venv
RUN /bin/bash -c "source venv/bin/activate"
RUN python -m pip install -r requirements.txt

# I prefer yarn over npm
RUN npm i -g yarn

# Install dependecies and build the react app
RUN cd frontend
RUN yarn
RUN yarn build

EXPOSE 2811

ENTRYPOINT [ "python", "main.py" ]