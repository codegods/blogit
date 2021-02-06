# Getting Set Up In Production Mode

The production mode is for users that only want a demo or want to run the app directly. You don't need NodeJS when in production mode. Although blogit was designed to run in Linux based operating systems, it can work on windows too. Just follow these steps and you will be running in minutes:

## Step 1: Build the frontend

For this, you have two choices:

### Method 1: Download a pre-compiled zip archive

Our [latest release](https://github.com/codegods/blogit/releases/v1.0.1-alpha/) comes with a pre-compiled version of the frontend.
You can download it from [here](https://github.com/codegods/blogit/releases/download/v1.0.1-alpha/blogit-precompiled-frontend-v1.0.1-alpha.zip). Just extract the archive in the root of your local copy of the source code and thats it!

### Method 2: Build it yourself

For this, first change your cwd to frontend:

    $ cd frontend

Then install the dependencies:

    $ npm i
    $ # or
    $ yarn

Now build the app, by running any of the following commands:

    $ npm run build
    $ # or
    $ yarn build
    $ # or
    $ node scripts/build.js

## Step 2: Install python dependecies

For installing python dependencies, it is recommended to use virtual environments. The method is different for different Operating Systems.

### For users of linux based operating systems (and the like):

To create and activate virtual environment:

    $ python3 -m venv .venv
    $ source .venv/bin/activate

And then install dependencies:

    $ python -m pip install -r requirements.txt

### For windows users:

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

> You can skip the `FLASK_SECRET_KEY` field if you are running blogit just for demo purposes.

## Step 5: Setting up the database

The next step is to make the database ready for use. And there's a long list of commands that need to be run in order to create the database and all the tables we need. But don't worry, you don't have to do all of this. You just have to run this command:

    $ python -m scripts.init_db

And, it will create the database along with all the tables with right structures for you.

<ins>**Note**</ins> Before running the script, please make sure that your MySQL server doesn't has any database with the name `blogit`. Because if it does, then the above script will exit without doing anything.

## Step 6: Running the server

There are two ways to run the actual server:

#### The better way

The recommended way to run blogit in production mode is to use `gunicorn` along with `meinheld`. Just enter this command in a terminal:

    $ gunicorn --workers=2 --worker-class="egg:meinheld#gunicorn_worker" "scripts.start:gunicron()"

You can change the number of workers as per your needs ( and CPU cores ).

#### The not so good way

The above way is the most efficient one to run the app. However, both `gunicorn` and `meinheld` are unix only. They won't work on Windows. This method is more "cross-platformic" as it works on Windows too.

To run in production mode, you have to set the environment variable `BLOGIT_MODE` to 1.

Run the following commands in a command prompt:

    \..\..>set BLOGIT_MODE=1
    \..\..>python -m scripts.start

Or in a terminal:

    $ BLOGIT_MODE=1 python -m scripts.start

---

Now you are all set to get your hands on blogit!!
