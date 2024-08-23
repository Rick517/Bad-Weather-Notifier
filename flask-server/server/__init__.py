from flask import Flask
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os
from flask_mailman import Mail
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
import pathlib


# qq How to handle allowing server to let the fronted framework to serve routes independently? Explaing the problem why this solution is required.
# Setting folder to find index.html file to allow react to server routes. 
# Setting path from /static to / to prevent misrouting and allow right one.
parent = pathlib.Path(__file__).parent.parent.parent
app = Flask(__name__, static_folder=url, static_url_path='/')
print(app.static_folder, url)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///server.sqlite3'

jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
# Only allow JWT cookies to be sent over https. In production, this
# should likely be True
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_COOKIE_SAMESITE'] = 'None'


CORS(app, supports_credentials=True, origins=['https://bad-weather-notifier.onrender.com', 'https://bad-weather-notifier.onrender.com/schedule'])
oauth = OAuth(app)
db = SQLAlchemy(app)

mail = Mail()
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_USERNAME'] = 'weathernotifier.com@gmail.com'
app.config['MAIL_PASSWORD'] = os.environ.get('GMAIL_SECRET_WEATHERNOTIFIER')
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail.__init__(app)

# Job storing is to keep shcedules if app brokes or turned off
# NOTE: this is a url to existing db
with app.app_context():
    jobstores = {
        'default': SQLAlchemyJobStore(engine=db.engine)
    }

    scheduler = BackgroundScheduler(
        job_defaults={
            'coalesce': True,  # Combine missed runs into one
            'misfire_grace_time': 60  # Give jobs 60 seconds to run after the scheduled time
        },
        jobstores=jobstores,
        timezone='UTC'  # Set timezone to UTC to avoid any timezone-related issues accross the world.
    )

    # We don't need additional thread because flask handles it
    scheduler.start()


from server import routes
