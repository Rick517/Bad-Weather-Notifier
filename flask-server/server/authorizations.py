from server import app, oauth
from server.constants import google_keys, facebook_keys
from flask import url_for


with app.app_context():
    google = oauth.register(
        google_keys['name'],
        client_id=google_keys['client_id'],
        client_secret=google_keys['client_secret'],
        redirect_uri='https://bad-weather-notifier-server.onrender.com/oauth/google',
        client_kwargs={'scope': 'openid email'},
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration'
    )

    facebook = oauth.register(
        name=facebook_keys['name'],
        client_id=facebook_keys['client_id'],
        client_secret=facebook_keys['client_secret'],
        authorize_url=facebook_keys['authorize_url'],
        access_token_url=facebook_keys['access_token_url'],
        redirect_uri='https://bad-weather-notifier-server.onrender.com/oauth/facebook',
        client_kwargs={'scope': 'email'}
    )