from server import scheduler, app
from flask_mailman import EmailMessage
import requests
import datetime
import pytz
from timezonefinder import TimezoneFinder

API_KEYS = ['c85ca2a395b65b742d76ad61d8845b82', 'f483c7bf8c3c14921c036060472ae9dd']

def convert_to_utc(lon: str, lat: str, hours: str, minutes: str) -> int: 
    tf = TimezoneFinder()

    # Get the time zone name
    timezone_str = tf.timezone_at(lng=float(lon), lat=float(lat))
    user_timezone = pytz.timezone(timezone_str)

    # Current date with specified hour and minute
    current_date = datetime.datetime.now().date()  # Today's date

    # Combine the date, hour, and minute into a datetime object
    user_local_time = datetime.datetime(current_date.year, current_date.month, current_date.day, int(hours), int(minutes))

    # Localize the time
    localized_time = user_timezone.localize(user_local_time)

    # Convert to UTC
    user_utc_time = localized_time.astimezone(pytz.utc)

    hour = user_utc_time.hour
    minute = user_utc_time.minute

    return hour, minute

    


def handle_connection(url):
    for api_key in API_KEYS:
        cur_url = url + api_key
        try:
            response = requests.get(cur_url, timeout=3)
            if response.status_code != 200:
                raise ConnectionError('Something went wrong.')
            data = response.json()
            if not data:
                raise ValueError('No city found.')
            return data
        
        except Exception as e:
            #print('ERROR getting api data:', e)
            pass
    
    return None

def get_weatherapi_data(url):
    attempts = 2
    for _ in range(attempts):
        result = handle_connection(url)
        if result is not None:
            return result
    return None

def handle_geo(city):
    url = f'http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=3&appid='
    data = get_weatherapi_data(url)
    if data is None:
        return None
    return {'lat': data[0]['lat'], 'lon': data[0]['lon']}
    

def get_weather_data(lat, lon):
    url = f'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&cnt=8&lang=en&appid='
    data =  get_weatherapi_data(url)
    if data is None: return None
    return data['list']
    
def calculate_index(hour1, hour2):
    n = int(hour2) - int(hour1)
    # One because returned weather data first element is previous timestamp. 
    # Like 15:00 when time is 18:00.
    return int(n) // 3 + 1

def generate_message(index, time, city):
    # TODO: add images and next forecasts
    data = get_weather_data(city['lat'], city['lon'])
    if data is None:
        return None, None
    cur = data[index]
    
    temperature = str(round(cur['main']['temp'])) + '°'
    description = cur['weather'][0]['description']
    icon = cur['weather'][0]['icon']
    
    subject = f'''{temperature} {description}'''
    body = f'''
    <div style="font-family: Poppins;">
        <h2 style="margin-bottom: 0; padding-bottom: .4rem;">Weather</h2>
        <h4 style="margin-block: .1rem .3rem;">{time}</h4>
        <div style="display:flex; justify-content: space-between; margin-top: 1.1rem">
            <div>
                <h1 style="display: flex; align-items: center; margin-block: 0 .2rem; padding-top:0;">
                    {temperature}
                    <img src="http://openweathermap.org/img/wn/{icon}@2x.png" alt="{description}" style="width: 2.3rem; aspect-ratio: 1/1">
                </h1>
                <p>Feels like {round(cur['main']['feels_like'])}°</p>
            </div>
            <div>
                <h4 style="margin-block: 0 .3rem; padding: 0; font-weight: bold;">{cur['weather'][0]['main']}</h4>
                <p style="margin: 0; padding-block: 0 .3rem;">Humidity: {cur['main']['humidity']}%</p>
                <p style="margin: 0; padding-block: 0 .3rem;">Wind: {cur['wind']['speed']} m/s</p>
                <p style="margin:0; padding:0;">Pressure: {cur['main']['pressure']} hPa</p>
            </div>
        </div>
    </div>
    '''
    
    return subject, body

def setup_email(index, data):
    with app.app_context():
        try:
            #print('Sending email...')
            subject, body = generate_message(index, data['time'], data['city'])
            if subject is None or body is None:
                #print('ERROR sending email.', subject, body)
                return
            
            em = EmailMessage(
                subject=subject,
                body=body,
                from_email='noreply@gmail.com',
                to=[data['email']]
            )

            em.content_subtype = 'html'
            em.send()
            #print('Email was sent.')
        except Exception as e:
            #print('ERROR sending email:', e)
            pass

def identify_days(days):
    res = ""
    day_map = {
        1: 'sun',
        2: 'mon',
        4: 'tue',
        8: 'wed',
        16: 'thu',
        32: 'fri',
        64: 'sat'
    }
    res = ""
    for bit, day in day_map.items():
        if days & bit:
            res += f',{day}'
    return res[1:]

def handle_create_schedule(schedule):
    time = schedule.forecasting_time
    lon = schedule.lon
    lat = schedule.lat

    not_hour, not_minute = convert_to_utc(
        lon, lat, 
        schedule.notifying_time[:2],
        schedule.notifying_time[3:]
    )

    for_hour, for_minute = convert_to_utc(
        lon, lat,
        time[:2],
        time[3:]
    )

    index = calculate_index(not_hour, for_hour)
    data = {
        'email': schedule.email, 
        'time': time,
        'city': {
            'lat': lat,
            'lon': lon
        }
    }
    
    if schedule.days & 128: # Once
        #print('Setting up sending once.')
        current_date = datetime.datetime.now().date()
        run_time = datetime.datetime(current_date.year, current_date.month, current_date.day, not_hour, not_minute)
        #print(run_time)
        job = scheduler.add_job(setup_email, 'date', run_date=run_time, args=[index, data], id=schedule.id)
    else:
        days = identify_days(schedule.days)
        job = scheduler.add_job(setup_email, 'cron', day_of_week=days, hour=not_hour, minute=not_minute, args=[index, data], id=schedule.id)
    
    #print('Added job:', job)