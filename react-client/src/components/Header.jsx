import { useRef } from 'react';
import logoImage from '../assets/images/sunny.png';
import { Link } from 'react-router-dom';
import googleIcon from '../assets/images/google-icon-transparent.png';
import facebookIcon from '../assets/images/facebook-icon-transparent.png';

const Header = ({ authorized, logout }) => { 
    const openPopoverButton = useRef(null)
    const openSignInPopover = () => {
        openPopoverButton.current.click();
    } 

  return (
    <header className='absolute top-0 w-full flex items-center h-16 justify-between px-20 z-10 bg-slate-100 bg-opacity-5'>
        <div className='flex space-x-4 items-center'>
            <img className="aspect-square w-10" src={logoImage} alt="logo" />
            <Link to="/" className="font-montserrat text-lg font-semibold text-gray-800">Weather Notifier</Link>
        </div>
        <div className='text-white text-md font-semibold max-w-lg flex items-center space-x-10'>
            <Link to="/" className='font-raleway'>Home</Link>
            <Link to={authorized ? "/schedule" : () => {openSignInPopover()}} className='font-raleway'>Schedule</Link>
            {authorized ? 
            <button  className='font-raleway text-gray-300 rounded-full px-6 py-1 bg-slate-600' popovertarget="logout-assurement" >
                Logout
            </button> : 
            <button  ref={openPopoverButton} popovertarget="sign-in-popover" className='font-raleway rounded-full px-6 py-1 bg-green-600'>
                Sign in
            </button>}
            
        </div>
        {!authorized ? 
        <section popover="auto" id="sign-in-popover" className="middle-popover bg-white p-9 items-center">
            <h3 className="font-montserrat text-2xl font-bold text-gray-800 mt-7">Welcome</h3>
            <p className='mt-2 text-lg font-montserrat text-gray-600'>Login & Registration</p>
            <p className="text-md font-openSans text-gray-500 mb-5">Please select an option to sign in</p>
            <div>
                <Link to="https://bad-weather-notifier-server.onrender.com/login/google" className='authorization-link'>
                    <img src={googleIcon} alt="Google" className='w-5 h-5' />
                    <span>Google</span>
                </Link>
                <Link to="https://bad-weather-notifier-server.onrender.com/login/facebook" className='authorization-link'>
                    <img src={facebookIcon} alt="Google" className='w-5 h-5' />
                    <span>Facebook</span>
                </Link>
            </div>
        </section> : 
        <section popover="auto" id="logout-assurement" className='middle-popover p-7'>
            <h3 className="font-montserrat text-2xl font-bold text-gray-800 mt-5">Come Again</h3>
            <p className='mt-2 text-lg font-montserrat font-semibold text-gray-700 mb-8'>This will logout you</p>
            <div className='flex space-x-4'>
                <button popovertarget="logout-assurement" popovertargetaction="hide" 
                className='flex-1 rectangle-button text-gray-800 hover:text-gray-700 hover:bg-stone-400'>Cancel</button>
                <button onClick={() => {logout()}} popovertarget="logout-assurement" popovertargetaction="hide" 
                className='flex-1 rectangle-button bg-red-600 text-white hover:bg-red-700 hover:text-gray-300 border-red-600 hover:border-red-700'>Logout</button>
            </div>
        </section>}
        
    </header>
  )
}

export default Header