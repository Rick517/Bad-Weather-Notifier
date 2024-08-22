import { useState, useEffect, useRef, useTransition }  from 'react';
import ScheduleBlock from './ScheduleBlock';
import WeekDays from './WeekDays';
import OnceButton from './OnceButton';
import Time from './Time';
import InlineError from './InlineError';
import EmptySchedules from './EmptySchedules';
import { serverAxios } from '../App.jsx';
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleInfo, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const fetchScheduleData = async (data, method, signal) => {
  const csrfToken = Cookies.get('csrf_access_token');
  return await serverAxios({
    method: method,
    url: '/server/scheduler', 
    data: data,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken
    },
    signal: signal
  });
}

// I deliver authorized here just in order to use useEffect after first request from app server comes
const Schedule = ({ changeAuthorization }) => {
  const [schedules, setSchedules] = useState([]);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [schedulesError, setSchedulesError] = useState("");
  const [activeButtons, setActiveButtons] = useState(0);
  const [city, setCity] = useState("");
  const [isCityPending, startCityTransition] = useTransition();
  const [isCityValid, setIsCityValid] = useState("");
  const emailInput = useRef(null);
  const formAbortController = useRef(null);
  const geoId = useRef(null);
  const navigate = useNavigate();


  const notify = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light"
    }
  );}
  


  useEffect(() => {
    // Pending will be as: !schedulesError (or schedules === empty)
    // I can do this because I refresh the schedulesError. And the option with data is worse because 
    // the error will disappear when a user adds a new schedule
    const getSchedules = async () => {
      try {
        const sign = await changeAuthorization();
        if (sign) {
          const response = await serverAxios.get('/server/scheduler');
          if (response.status !== 200) {
            throw new Error('Something went wrong. ')
          } 
          //console.log(response)
          setSchedules(response.data);
          setSchedulesError("")
        } 
        else {
          navigate('/')
        };
        
      } catch (e) {
        console.error(e);
        setSchedulesError('Failed to get your schedules. Please try again');
      }
    }

    getSchedules();

    // Autorized because calling change authentication is not compitable with rendering 
    // shcedule in the same time.
  }, [])

  const validateForm = (data) => {
    // Email is validated already.
    //console.log('Validating form.')

    const notifyingDate = new Date(`1970-01-01T${data.notifyingTime}:00`);
    const forecastDate = new Date(`1970-01-01T${data.forecastingTime}:00`);
  
    return notifyingDate <= forecastDate && activeButtons !== 0 
    && isCityValid != null && isCityValid !== ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const sign = validateForm(data); // I can do this on client because validation is quite simple.

    if (sign) {
      // Aborting multiple same add schedule requests
      // Exactly here because only only here fetch request will be made.
      if (formAbortController.current) {
        //console.log('ABORTED');
        formAbortController.current.abort();
      }
      formAbortController.current = new AbortController();

      const id = uuidv4();
      const signal = formAbortController.current.signal;

      data['days'] = activeButtons; // because could be changed

      if (data.days === 128) {
        notify(`Email will be sent once at ${data.notifyingTime}.`);
      }
      else {
        addBlockSchedule(data, activeButtons, id);
      }

      // Just to prevent redirecting on the server and losing data 
      // inside main respnose if access token has expired right into that moment
      const sign = await changeAuthorization();
      if (!sign) {
        //console.log('not sign')
        navigate('/home')
        return;
      }

      // Await is for comformity
      const response = await fetchScheduleData({...data, id,
        'lat': isCityValid.lat, 'lon': isCityValid.lon}, 'POST', signal);
      formAbortController.current = null;

      if (response.status === 200) {
        //console.log(data)
        setFormError("");
      } else {
        setFormError("Something went wrong. ")
      }
    } else {
      setFormError('Submit data is incorrect.');
    }
    ////console.log(sign);
  }

  const addActiveStyle = (targetIndex) => {
    // Note: the once is the last - the largest one
    let newButtons = activeButtons;
    if (targetIndex === 7) {
      newButtons = newButtons >> 7 ? 0 : 1 << 7;
    } else {
      if (targetIndex < 7) {
        newButtons = (newButtons | (1 << 7)) ^ (1 << 7);
      }
      newButtons ^= 1 << targetIndex;
    }
    setActiveButtons(newButtons);
  }

  const fetchCityData = async (value) => {
    clearTimeout(geoId.current);

    geoId.current = setTimeout( async () => {
      startCityTransition(() => {
        (async () => {
          try {
            const response = await serverAxios.get(`/server/geo?city=${value}`);
            geoId.current = null;
            setIsCityValid(response.data);
          } catch (e) {
            console.error(e);
            setIsCityValid(null);
          }
        })();
      });
    }, 500);
  };

  const handleSettingCity = (value) => {
    setCity(value);
    // Just for performance
    if (value.length !== 0) { 
      fetchCityData(value); // Call the debounced function
    } else {
      setIsCityValid("")
    }
  };

  // SCHEDULE 

  const addBlockSchedule = (data, buttons, id) => {
    setSchedules(
      [{...data, 'days': buttons, 'id': id}, ...schedules]
    )
  }

  const deleteSchedule = async (scheduleId) => {
    //console.log('deleteSchedule', scheduleId);
    setSchedules(schedules.filter(item => item.id !== scheduleId));
    await fetchScheduleData(scheduleId, 'DELETE');
  }

  const emailFocus = () => {
    emailInput.current.focus();
  }

  return (
    <div className='h-screen flex px-10'>
      <ToastContainer />
      <section className='flex-1 justify-center self-center'>
        <form className='w-96 mx-auto' onSubmit={handleSubmit}>
          <h2 className='font-montserrat font-bold text-2xl mb-6'>New Schedule</h2>
          <InlineError error={formError} />
          <Time name="Notifying time" formName="notifyingTime" defaultValue="00:00" />
          <Time name="Forecasting time" formName="forecastingTime" defaultValue="12:00" />
          <div className='my-5 w-full flex items-center text-gray-800'>
            <div className='flex-1'>
              <WeekDays activeButtons={activeButtons} addActiveStyle={addActiveStyle} />
            </div>
            <OnceButton addActiveStyle={addActiveStyle} isActive={activeButtons & (1 << 7)} />
          </div>
          {/* We must use email because registration is done with OAuth. */}
          <div className='flex my-3'>
            <input
              placeholder='Your email'
              value={email}
              onChange={() => setEmail(emailInput.current.value)}
              ref={emailInput}
              type='email' required
              name='email' 
              className='form-active-text-input focus:border-green-600'
            />
          </div>
          <div className='flex items-center my-3'>
            <input 
              placeholder='Your city' value={city} type='text' required
              onChange={(e) => handleSettingCity(e.target.value)} name='city'
              className='max-w-[50%] form-active-text-input' />
            <div className='flex-1 flex items-center justify-center font-normal font-raleway text-base'>
              {/* Exactly isCityValid should be used. 
                  Just city state isn't good because of rapid invalid rendering. */}
              {isCityValid != null ? (
                isCityValid.length !== 0 ? 
                  <span className='text-green-400 geo-text'>
                    <FontAwesomeIcon icon={faCircleCheck} />
                    <span>Valid</span>
                  </span> : 
                  <span className='text-gray-600 geo-text'>
                    <FontAwesomeIcon icon={faCircleInfo} />
                    <span>Waiting...</span>
                  </span>
                ) : <span className='text-red-500 geo-text'>
                  <FontAwesomeIcon icon={faCircleExclamation} />
                  <span>Invalid</span>
                </span>}
            </div>
          </div>
          <div className='mt-1'>
            <button
              type='submit'
              className='px-12 py-2 bg-green-600 text-white font-semibold font-raleway rounded-full hover:bg-green-700 transition-all'
            >
              Add schedule
            </button>
          </div>
        </form>
      </section>
      <section className='flex-1'>
        <div className='pt-28 pb-24 mr-16 h-screen relative'>
          <div className='customized-scrollbar w-full h-full flex flex-col items-center 
          overflow-y-scroll scroll-smooth'>
            {schedulesError && <InlineError error={schedulesError} width="w-[80%] mx-auto"/>}
            {!schedulesError && (
              // If there is no schedules, I show an empty board message
              schedules.length === 0 ? <EmptySchedules emailFocus={emailFocus}/> : 
              schedules.map(item => (
              <div key={item.id} className='mb-2'>
                <ScheduleBlock schedule={item} deleteSchedule={deleteSchedule}  />
              </div>)))}
          </div>
          <div className="absolute inset-x-[5.6rem] top-28 h-4 bg-gradient-to-b from-white/70 to-transparent z-40"></div>
          <div className="absolute inset-x-[5.6rem] bottom-24 h-4 bg-gradient-to-t from-white/70 to-transparent z-40"></div>
        </div>
      </section>
    </div>
  )
}

export default Schedule