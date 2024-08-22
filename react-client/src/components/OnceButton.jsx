import React from 'react'

const OnceButton = ({ isActive, addActiveStyle, scheduleStyles="" }) => {
  return (
    <div
        className={`form-elipsis py-[2px] px-6 ${isActive ? 'form-elipsis-active' : ''}
        ${scheduleStyles}`}
        onClick={() => addActiveStyle(7)}
        >
        Once
    </div>
  )
}

export default OnceButton