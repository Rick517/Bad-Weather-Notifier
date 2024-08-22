import React from 'react';
import WeekDays from './WeekDays';
import OnceButton from './OnceButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const ScheduleBlock = ({ deleteSchedule, schedule }) => {
  ////console.log(schedule)
  return (
    <div className='w-[33rem] flex items-center bg-gray-100 rounded-xl py-8 px-8'>
      <div className='font-montserrat text-lg font-semibold text-gray-800'>
        {schedule.notifyingTime} - {schedule.forecastingTime}
      </div>
      <WeekDays activeButtons={schedule.days} addActiveStyle={null} 
      scheduleStyles={'flex-1 justify-end'} />
      <button className='min-w-6 text-xl cursor-pointer flex items-center justify-center text-gray-600 ml-6
      hover:text-gray-500 active:text-gray-400 active:text-lg transition-all' onClick={() => {deleteSchedule(schedule.id)}}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  )
}

export default ScheduleBlock