import Schedule from './components/Schedule.jsx';
import {useState, useEffect} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';


const BASE_URL = 'https://bad-weather-notifier-server.onrender.com'
export const serverAxios = axios.create({
  withCredentials: true,
  baseURL: BASE_URL
})

const App = () => {
  const [authorized, setAuthorized] = useState(false)
  const navigate = useNavigate();

  const changeAuthorization = async () => {
    try {
      const response = await serverAxios.get('/server/refresh');
      //console.log(response)
      if (response.status === 201) {
        setAuthorized(true)
        return true;
      } 
      throw new Error(response.data.message)

    } catch (err) {
      // Here is always the state is something went wrong with authentication
      console.error('Unathorized.', err.response.data.message)
      setAuthorized(null)
    }

    return false;
  }

  useEffect(() => {
    const setUp = async () => {
      const isAuthorized = await changeAuthorization();
      if (isAuthorized) {
        //console.log('SJDLFLSDFLKSDFJSKLDF')
        navigate('/schedule');
      }
      else {
        navigate('/');
      }
    }

    setUp();
  }, [])

  const logout = async () => {
    const response = await serverAxios.get('/server/logout');
    if (response.status === 200) {
      setAuthorized(false)
      navigate('/');
    } else (e) => {
      console.error(e);
    }

  }




  return (
    <>
      <Header authorized={authorized} logout={logout} />
      <Routes>
        <Route path="/" element={<Hero authorized={authorized} />} />
        <Route path="/home" element={<Hero authorized={authorized} />} />
        <Route path="/schedule" element={<Schedule authorized={authorized} changeAuthorization={changeAuthorization} />} />
      </Routes>
    </>
  )
}

export default App