# Getting Set Up

> This guide is for those wanting to set-up blogit for development purposes. For an easier way to get running, visit the [setup guide for the production version](./production).

Once you have obtained a local copy of the source code, you will have to do some setup to get running. Although we have tried to keep setting up as simple as possible, but let's face it, it can sometimes be a little tricky for beginners to get running. So, here are the steps you should follow to run the app.

## Step 1: Download NodeJS and Python

If you haven't already then, you should first download a recent version of NodeJS ([Download](https://nodejs.org/en/download/)) and Python 3.6+ ([Download](https://www.python.org/downloads/)).
Next, it is preferred to download the yarn package manager but npm will also do.
Check your installations with the following commands:

    $ node --version
    v12.18.3

    $ python --version
    Python 3.8.5

    $ pip --version
    pip 20.0.2 from /path/to/python/site-packages/pip (python 3.x)

    $ yarn --verion # or you can use npm
    1.22.5

    $ npm --version
    6.14.6

## Step 2: Install dependencies

### Step 2A: NodeJS

Run the following commands to install dependencies of the frontend part.

    $ cd frontend
    $ yarn

or, if you use npm:

    $ cd frontend
    $ npm i

### Step 2B: Python

For installing python dependencies, it is recommended to use virtual environments. The method is different for different Operating Systems.

#### For users of linux based operating systems (and the like):

To create and activate virtual environment:

    $ python3 -m venv .venv
    $ source .venv/bin/activate

And then install dependencies:

    $ python -m pip install -r requirements.txt

#### For windows users:

To create and activate virtual environment:

    \..\..> python -m venv .venv
    \..\..> .venv\Scripts\activate.bat

And then install dependencies:

    \..\..> python -m pip install -r requirements-win.txt

## Step 3: Create a secrets.json file

Now that we have our environment set up, we have to create a `secrets.json` that will store sensitive info of the app.

Create a new file and enter the following details in it:

```json
{
    "MYSQL_PASSWORD": "",
    "FLASK_SECRET_KEY": ""
}
```

Set `MYSQL_PASSWORD` field to your mysql password and `FLASK_SECRET_KEY` should be a randomly generated, cryptographically secure key with a minimum length of 16. To generate a good and random secret key use the following program:

```python
import secrets
import string

key = ""
for i in range(secrets.SystemRandom().randint(16, 100)):
    key += secrets.choice(string.printable)
print(key)
```

***You should never ever reveal your `SECRET_KEY`***

## Step 4: Additional configuration

Although the default configuration suits the needs for most users, it isn't "One size fits all".
You may still need to fine tune it according to your needs.

Mostly you may need to change the host or port of `flask` or `wds` according to your needs. The default config sets host of both these servers to `0.0.0.0` and port to a random free port provided by the os.
Or you may change your MySQL user or host. All these things are handled by `config.py`.

## Step 5: Setting up the database

The next step is to make the database ready for use. And there's a long list of commands that need to be run in order to create the database and all the tables we need. But don't worry, you don't have to do all of this. You just have to run this command:

    $ python -m scripts.init_db

And, it will create the database along with all the tables with right structures for you.

<ins>**Note**</ins> Before running the script, please make sure that your MySQL server doesn't has any database with the name `blogit`. Because if it does, then the above script will exit without doing anything.

## Step 6: Run the App

By default, the app is in development mode. If you need to run it in production mode see [this](./production) document. All you need to do is to run the following command:

    $ python -m scripts.start

This script will load the config and act accordingly. With the default config, you will see an output similiar to following:

    [16:13:36.211306] [INFO] configLoader: Loading config from /home/jalaj/projects/blogit/config.py
    [16:13:36.229184] [INFO] configLoader: Validating configuration...
    [16:13:36.230489] [INFO] configLoader: Configuration OK
    [16:13:36.778291] [INFO] startScript: Using yarn package manager...
    [16:13:36.779210] [INFO] startScript: Attempting to find default terminal...
    [16:13:38.408689] [INFO] startScript: Using terminal gnome-terminal
    [16:13:38.410681] [INFO] startScript: Attempting to start flask server...
    [16:13:40.145592] [INFO] mysql: Connecting to mysql server...
    [16:13:40.188114] [INFO] mysql: Connected.
    [16:13:40.197490] [INFO] cache: Caching extension ready.
    [16:13:40.201543] [INFO] cache: Cache invalidator running...
    * Serving Flask app "main" (lazy loading)
    * Environment: development
    * Debug mode: on
    [16:13:40.653381] [INFO] werkzeug:  * Running on http://0.0.0.0:33311/ (Press CTRL+C to quit)
    [16:13:40.675595] [INFO] werkzeug:  * Restarting with stat
    [16:13:42.636257] [INFO] mysql: Connecting to mysql server...
    [16:13:42.684458] [INFO] mysql: Connected.
    [16:13:42.687277] [INFO] cache: Caching extension ready.
    [16:13:42.689073] [INFO] cache: Cache invalidator running...
    [16:13:43.031983] [WARNING] werkzeug:  * Debugger is active!

...along with a new terminal window that will automatically start the `Webpack Dev Server` for you along with proper proxy settings in place. 
Please note that this feature is not available in all operating systems. Windows works fine and Linux/Unix distros with `gnome-terminal` or `x-terminal-emulator` should work fine.

Just make the changes and both the servers will reload automatically!

---

Now you are all set to get your hands on blogit!!
