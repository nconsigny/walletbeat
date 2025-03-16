import React from 'react'

export function ImageRobot(): React.JSX.Element {
    return (
        <div className="absolute left-0 bottom-0 w-full px-4 pb-4">
            <div className="relative w-[256px] mx-auto">
                <img 
                    src="/wallet.robbot-flipped.png" 
                    alt="WalletBeat Robot"
                    className="w-full h-auto"
                />
            </div>
        </div>
    )
} 