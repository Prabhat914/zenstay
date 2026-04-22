import React, { useEffect, useState } from 'react'

const ReelPlayer = ({ url, fallback = null }) => {
    const [hasPlaybackError, setHasPlaybackError] = useState(false)

    useEffect(() => {
        setHasPlaybackError(false)
    }, [url])

    if (!url || hasPlaybackError) {
        return fallback
    }

    return (
        <div className="reel-container" style={{ borderRadius: '15px', overflow: 'hidden', height: '100%', width: '100%' }}>
            <video
                src={url}
                controls
                autoPlay
                loop
                muted
                playsInline
                onError={() => setHasPlaybackError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
        </div>
    )
}

export default ReelPlayer
