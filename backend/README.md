# How to run 

## Requirements
    * Python 3.8 or later
    * postgresql 18
    * pgadmin4 (na spusteni serveru lehkeho idk jde tam videt suepr veci)

## Set Up the Database (Using pgAdmin4)
The server needs an empty database and a user to connect to.

Open pgAdmin4 and connect to your local PostgreSQL server.

In the browser tree, right-click on Databases > Create > Database...

Name your database (e.g., my_project_db).

You can use the default postgres user, but it's better to create a new Login/Group Role (e.g., my_project_user) with a secure password. Make sure to grant it LOGIN privileges.

Right-click your new database (my_project_db) and go to Properties... > Security. Grant all privileges to your new user (my_project_user).

## Configure the Project
Create a Virtual Environment:

### On Windows
- python -m venv venv
- venv\Scripts\activate

### On macOS/Linux
- python3 -m venv venv
- source venv/bin/activate

### Install Dependencies:

- pip install -r requirements.txt

### Settings
- in backend_iis/settings.py set your user and password same as in postgres server

## RUN
- python manage.py makemigrations
- python manage.py migrate
- python manage.py runserver


