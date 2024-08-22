import os

google_keys = {
    'name': 'google',
    'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
    'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
    'authorize_url': 'https://accounts.google.com/o/oauth2/auth',
    'access_token_url': 'https://accounts.google.com/o/oauth2/token'
}

facebook_keys = {
    'name': 'facebook',
    'client_id': os.environ.get('FACEBOOK_CLIENT_ID'),
    'client_secret': os.environ.get('FACEBOOK_CLIENT_SECRET'),
    'authorize_url': 'https://www.facebook.com/dialog/oauth',
    'access_token_url': 'https://graph.facebook.com/v10.0/oauth/access_token'
}

facebook_keys = {
    'name': 'facebook',
    'client_id': os.environ.get('FACEBOOK_CLIENT_ID'),
    'client_secret': os.environ.get('FACEBOOK_CLIENT_SECRET'),
    'authorize_url': 'https://www.facebook.com/dialog/oauth',
    'access_token_url': 'https://graph.facebook.com/v10.0/oauth/access_token'
}
