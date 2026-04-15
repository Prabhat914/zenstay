import React from 'react'

const ReelPlayer = ({ url }) => {
    if (!url) return null;

    return (
        <div className="reel-container" style={{ borderRadius: '15px', overflow: 'hidden', height: '100%' }}>
            <video 
                src={url} 
                controls 
                autoPlay 
                loop 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
    )
}

export default ReelPlayer