import React from 'react'

const InlineError = ({ error, width=undefined }) => {
  return (
    <div className='w-full h-9 mb-4 z-50'>
        {error && <p className={`leading-9 border-2 border-red-600 text-red-600 rounded-md pl-2
        font-raleway text-sm font-semibold opacity-85 ${width != undefined ? width : 'w-full'}`}>{error}</p>}
    </div>
  )
}

export default InlineError