import React from 'react'

const Time = ({ name, formName, defaultValue }) => {
  return (
    <div className='mb-4 w-full flex items-center text-gray-800 pr-1'>
        <span className='flex-1 form-label-text'>{name}</span>
        <input
        className='font-openSans outline-none cursor-pointer'
        type='time'
        name={formName}
        defaultValue={defaultValue}
        />
    </div>
  )
}

export default Time