import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';

const EmptySchedules = ({ emailFocus }) => {
  return (
    <div className='my-auto bg-gray-100 rounded-lg p-8 text-center'>
        <h3 className='font-montserrat font-bold text-lg text-gray-800'>No schedules yet...</h3>
        <p className='font-openSans font-normal text-base text-gray-700'>Create a one or tap the arrow below.</p>
        <div className='mt-8 w-full text-center cursor-pointer
        ' onClick={() => {emailFocus()}}>
            <FontAwesomeIcon icon={faArrowLeftLong} className='transition-all
            text-[6rem] text-green-500 text-green-shadow bg-transparent w-full
            active:text-green-200'/>
        </div>
    </div>
  )
}

export default EmptySchedules