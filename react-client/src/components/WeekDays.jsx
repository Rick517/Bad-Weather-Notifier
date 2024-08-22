import React from 'react'

const WeekDays = ({ activeButtons, scheduleStyles="", addActiveStyle=null }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={`flex space-x-2 ${scheduleStyles}`}>
        {days.map((day, i) => (
        <span
            key={i}
            className={`form-elipsis w-7 h-7 aspect-square flex items-center justify-center ${activeButtons & (1 << i) ? 'form-elipsis-active' : ''}`}
            onClick={addActiveStyle !== null ? () => addActiveStyle(i) : () => {}}
        >
            {day}
        </span>
        ))}
    </div>
  )
}

export default WeekDays