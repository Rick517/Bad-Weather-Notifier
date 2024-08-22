import { useRef } from 'react';
import backgroundImage from '../assets/images/couple-sitting-in-park.png';
import { useNavigate } from 'react-router-dom';

const Hero = ({ authorized }) => {
  const navigate = useNavigate();
  const popoverButton = useRef(null);

  const navigateToScheuduler = () => {
    if (authorized) {navigate('/schedule');}
    else {
      popoverButton.current.click();
    }
  }

  return (
    <div className='h-screen'>
      <main className='flex w-full items-center h-full'>
        <section className='flex-1'>
          <article className='pl-32'>
            <p className='font-raleway text-gray-600 font-bold text-lg'>Weather Notifier</p>
            <h3 className='max-w-xl mb-4 mt-2 font-montserrat text-gray-800 font-extrabold text-4xl'>Stay ahead of bad weather and 
              <span className='text-green-500'> never</span> miss your schedule again</h3>
            <p className='max-w-md font-openSans text-gray-400 font-medium text-xl'>Set your own schedule and we'll send you reminders about forecasting weather.</p>
            <button className='mx-auto my-10 px-20 py-2 bg-green-500 text-white font-raleway rounded-full'
            onClick={() => navigateToScheuduler()}>Set your schedule</button>
            <button ref={popoverButton} popovertarget="sign-in-popover" className='hidden'></button>
          </article>

        </section>
        <section className='flex-1 h-full min-h-screen '>
          <img className='h-full min-w-full object-cover object-[65%_10%] block' 
          src={backgroundImage} alt="background image"/>
        </section>
      </main>
    </div>
    
  )
}

export default Hero