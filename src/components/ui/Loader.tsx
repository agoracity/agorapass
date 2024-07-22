import React from 'react'

function Loader() {
    return (
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-primarydark"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-primarydark"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-primarydark"></div>
        </div>
    )
}

export default Loader