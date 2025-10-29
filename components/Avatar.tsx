
import React from 'react';
import type { AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
}

export const Avatar: React.FC<AvatarProps> = ({ state }) => {
  const { isSpeaking, isTurned, gesture, emotion } = state;

  const animationStyles = `
    @keyframes sway {
      0%, 100% { transform: translateY(0) rotate(0); }
      50% { transform: translateY(-3px) rotate(0.5deg); }
    }
    @keyframes blink {
      0%, 95% { transform: scaleY(1); }
      97%, 100% { transform: scaleY(0.1); }
    }
    @keyframes talk {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.15); }
    }
    @keyframes laugh {
        0%, 100% { transform: translateY(0) rotate(0); }
        25% { transform: translateY(-5px) rotate(1deg); }
        50% { transform: translateY(0) rotate(-1deg); }
        75% { transform: translateY(-5px) rotate(1deg); }
    }

    .avatar-body {
      animation: sway 8s ease-in-out infinite;
    }
    #eyes {
      animation: blink 5s ease-in-out infinite;
      transform-origin: center;
    }
    .speaking #mouth {
      animation: talk 0.3s ease-in-out infinite;
      transform-origin: center;
    }
    .laughing .avatar-body{
        animation: laugh 0.5s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div className="relative w-80 h-96">
        <div
          className="w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transformStyle: 'preserve-3d', transform: isTurned ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front of Avatar */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
            <svg viewBox="0 0 300 360" className={`w-full h-full ${emotion === 'laughing' ? 'laughing' : (isSpeaking ? 'speaking' : '')}`} aria-label="Animated teacher avatar based on user-provided image">
               <defs>
                 <radialGradient id="skin-highlight" cx="0.5" cy="0.4" r="0.6">
                    <stop offset="0%" stopColor="#8a5a44" />
                    <stop offset="100%" stopColor="#54382B" />
                </radialGradient>
               </defs>
              <g className="avatar-body">
                {/* Right Arm */}
                <g style={{ transform: gesture === 'explain' ? 'rotate(15deg)' : 'rotate(5deg)', transition: 'transform 0.4s ease', transformOrigin: '195px 165px' }}>
                  <path d="M195 165 C 205 210, 215 280, 210 320 L 190 325 L 180 170 Z" fill="#6B4533" />
                </g>

                {/* Torso */}
                <path d="M100 360 L 100 170 C 100 150, 120 130, 150 130 C 180 130, 200 150, 200 170 L 200 360 Z" fill="#276749"/>
                <path d="M100 170 C 120 180, 180 180, 200 170 C 200 150, 180 130, 150 130 C 120 130, 100 150, 100 170" fill="#38A169" />

                {/* Head */}
                <g transform="translate(0, -5)">
                    <path d="M115 70 C 90 100, 90 160, 115 190 L 185 190 C 210 160, 210 100, 185 70 Z" fill="url(#skin-highlight)"/>
                     
                    {/* Eyes */}
                    <g id="eyes">
                      <path d="M125 115 C 130 110, 140 110, 145 115 C 140 122, 130 122, 125 115" fill="white"/>
                      <circle cx="135" cy="116" r="3" fill="#2D3748"/>
                      <path d="M155 115 C 160 110, 170 110, 175 115 C 170 122, 160 122, 155 115" fill="white"/>
                      <circle cx="165" cy="116" r="3" fill="#2D3748"/>
                    </g>
                    
                    {/* Eyebrows */}
                    <path d="M125 105 C 130 102, 140 102, 145 105" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M155 105 C 160 102, 170 102, 175 105" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

                    {/* Mouth */}
                    <g id="mouth">
                       { emotion === 'laughing' 
                          ? <path d="M135 150 C 140 165, 160 165, 165 150 Q 150 155 135 150" fill="white" />
                          : <path d="M140 150 Q 150 155, 160 150" stroke="#4A5568" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                       }
                    </g>
                    
                    {/* Hair (Dreadlocks) - Stylized */}
                    <g fill="#2D3748">
                        <path d="M110 70 C 110 40, 190 40, 190 70 L 180 60 C 170 45, 130 45, 120 60 Z" />
                        <rect x="110" y="70" width="15" height="40" rx="8" transform="rotate(-10 117.5 90)" />
                        <rect x="125" y="65" width="12" height="35" rx="6" transform="rotate(-5 131 82.5)" />
                        <rect x="140" y="60" width="12" height="40" rx="6" />
                        <rect x="155" y="60" width="12" height="38" rx="6" />
                        <rect x="170" y="65" width="12" height="35" rx="6" transform="rotate(5 176 82.5)" />
                        <rect x="180" y="75" width="13" height="40" rx="7" transform="rotate(10 186.5 95)" />
                        <rect x="100" y="90" width="15" height="40" rx="8" transform="rotate(-15 107.5 110)" />
                        <rect x="185" y="95" width="15" height="40" rx="8" transform="rotate(15 192.5 115)" />
                    </g>
                </g>
                
                {/* Left Arm */}
                 <g style={{ transform: gesture === 'point' ? 'rotate(-35deg)' : (gesture === 'explain' ? 'rotate(-15deg)' : 'rotate(-5deg)'), transition: 'transform 0.4s ease', transformOrigin: '105px 165px' }}>
                    <path d="M105 165 C 95 210, 85 280, 90 320 L 110 325 L 120 170 Z" fill="#6B4533"/>
                </g>
              </g>
            </svg>
          </div>

          {/* Back of Avatar */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <svg viewBox="0 0 300 360" className="w-full h-full" aria-label="Back of teacher avatar">
              <g>
                {/* Arms */}
                <path d="M105 165 L 195 165 L 180 170 L 190 325 L 210 320 L 205 165" fill="#603F2D" />
                <path d="M105 165 C 95 210, 85 280, 90 320 L 110 325 L 120 170 Z" fill="#603F2D" />

                {/* Torso */}
                <path d="M100 360 L 100 170 C 100 150, 120 130, 150 130 C 180 130, 200 150, 200 170 L 200 360 Z" fill="#22543D"/>
                
                {/* Head and Hair */}
                <g transform="translate(0, -5)">
                    <path d="M115 70 C 90 100, 90 160, 115 190 L 185 190 C 210 160, 210 100, 185 70 Z" fill="#54382B"/>
                    <g fill="#2D3748">
                      <path d="M110 70 C 110 40, 190 40, 190 70 L 190 150 C 190 190, 110 190, 110 150 Z" />
                       <rect x="110" y="70" width="80" height="110" rx="40" />
                    </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
