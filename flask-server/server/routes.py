from server import app, jwt, db, scheduler
from flask import redirect, url_for, jsonify, make_response, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token, unset_jwt_cookies,
    jwt_required, get_jwt_identity, set_refresh_cookies, set_access_cookies
)
from server.utilities import handle_create_schedule, handle_geo
from server.authorizations import google, facebook
from server.models import User, Schedules
import datetime


# TOKEN ERRORS

@jwt.unauthorized_loader
def custom_unauthorized_response(callback):
    #print(request.cookies)
    return {'message': 'No token. '}, 498

@jwt.invalid_token_loader
def custom_invalid_token_response(callback):
    return {'message': 'Invalid token. '}, 498

@jwt.expired_token_loader
def custom_expired_token_response(callback, arg):
    if not arg['fresh']:
        return redirect(url_for('refresh'))
    return {'message': 'Expired token. '}, 498

# API ROUTES

@app.route('/server/heartbeat')
def heartbeat():
    return {'message': 'Alive!'}, 200


# LOGIN & REGISTRATION

def create_tokens(identity):
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)
    return [access_token, refresh_token]

@app.route('/login/google')
def login_google():
    # Note: I must include url and the way that they match
    url = url_for('authorize_google', _external=True)
    #print(url)
    return google.authorize_redirect(url)

@app.route('/login/facebook')
def login_facebook():
    #print(facebook)
    url = url_for('authorize_facebook', _external=True)
    return facebook.authorize_redirect(url)

@app.route('/oauth/google')
def authorize_google():
    token = google.authorize_access_token()
    resp = google.get('https://www.googleapis.com/oauth2/v1/userinfo')
    user_info = resp.json()
    #print('Google oauth info:', user_info)

    email = user_info['email']
    user = User.is_registered(email)
    if not user: # user is None
        user = User(email=email)
        db.session.add(user)
        db.session.commit()
        #print('New user registered:', user)
    
    user_id = user.id
    access_token, refresh_token = create_tokens(user_id)
    response = redirect('https://bad-weather-notifier.onrender.com/')
    set_refresh_cookies(response, refresh_token)
    set_access_cookies(response, access_token)
    return response

@app.route('/oauth/facebook')
def authorize_facebook():
    token = facebook.authorize_access_token()
    resp = facebook.get('https://graph.facebook.com/me?fields=id,name,email')
    user_info = resp.json()
    #print('Facebook oauth info:', user_info)

    email = user_info['email']
    user = User.is_registered(email)
    if not user: # user is None
        user = User(email=email)
        db.session.add(user)
        db.session.commit()
        #print('New user registered:', user)
    
    user_id = user.id
    access_token, refresh_token = create_tokens(user_id)
    response = redirect('https://bad-weather-notifier.onrender.com/schedule')
    set_refresh_cookies(response, refresh_token)
    set_access_cookies(response, access_token)
    return response

@app.route('/oauth/delete_fb_data', methods=['POST'])
def delete_fb_data():
    pass

# Without jwt required because if a token is expired, will be an error. And generating a token to logout is a overkill
@app.route('/server/logout')
def logout():
    response = make_response({'messsage': 'Logout successfully'}, 200)
    unset_jwt_cookies(response)
    return response

@app.route('/server/refresh', methods=['GET', 'POST'])
@jwt_required(refresh=True)
def refresh():
    #print('refresh request')
    user_id = get_jwt_identity()
    if User.query.filter_by(id=user_id).first() is None:
        response = make_response({'message': 'invalid user'}) # home
        unset_jwt_cookies(response) # make sure cookie tokens are cleared
        return response, 403
    
    access_token, refresh_token = create_tokens(user_id)
    response = make_response({'access_token': access_token})
    # wWhen you use set_access_cookies in flask_jwt_extended, it automatically
    #  refreshes the CSRF token associated with that access token.
    set_refresh_cookies(response, refresh_token)
    set_access_cookies(response, access_token)
    return response, 201


# FUNCTIONS

@app.route('/server/scheduler', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def schduler():
    user_id = get_jwt_identity()
    schedule_id = request.args.get('schedule_id', None)

    if request.method == 'GET':
        #print('Received GET request. User id:', user_id)
        # Get all schedulers for the user
        schedules = Schedules.query.filter_by(user_id=user_id).order_by(Schedules.date.desc()).all()
        res = []
        for item in schedules:
            #print(item.date)
            res.append({
                'id': item.id,
                'days': item.days,
                'notifyingTime': item.notifying_time,
                'forecastingTime': item.forecasting_time,
                'email': item.email
            })
        return jsonify(res), 200

    if request.method == 'POST':
        # Add new schedule
        data = request.get_json()
        ##print(request.args, request.form, request.get_json(), request.get_data())
        try:
            days_integer = data['days']
            schedule = Schedules(id=data['id'], user_id=user_id, days=days_integer, 
                notifying_time=data['notifyingTime'], forecasting_time=data['forecastingTime'],
                email=data['email'], lat=data['lat'], lon=data['lon'], date=datetime.datetime.now())
            db.session.add(schedule)
            db.session.commit()
            handle_create_schedule(schedule)
        except Exception as e:
            #print('ERROR WITH FORM DATA', e)
            return {'error': 'Invalid data. '}, 400
        return jsonify({'message': 'Successfully added. '}), 200

    if request.method == 'DELETE':
        # Delete schedule
        id = request.get_json()
        #print(id)
        scheduler.remove_job(id)
        schedule = Schedules.query.filter_by(id=id).first()
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({'message': 'Successfully deleted. '}), 204


@app.route('/server/geo')
def get_geo():
    city = request.args.get('city')
    if city is not None:
        result = handle_geo(city)
        if result is not None: 
            return jsonify(result), 200
    return "", 400



