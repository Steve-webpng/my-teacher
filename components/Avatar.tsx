
import React from 'react';
import type { AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
}

export const Avatar: React.FC<AvatarProps> = ({ state }) => {
  const { isSpeaking, isTurned, gesture } = state;

  const animationStyles = `
    @keyframes sway {
      0%, 100% { transform: translateY(0) rotate(0); }
      50% { transform: translateY(-4px) rotate(0.5deg); }
    }
    @keyframes blink {
      0%, 95% { opacity: 1; }
      96%, 100% { opacity: 0; }
    }
    @keyframes talk {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.3); }
    }
    .avatar-body {
      animation: sway 8s ease-in-out infinite;
    }
    .avatar-eyes-open {
      animation: blink 4s step-end infinite;
    }
    .speaking .avatar-mouth {
      animation: talk 0.3s ease-in-out infinite;
      transform-origin: center;
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
            <svg viewBox="0 0 300 360" className={`w-full h-full ${isSpeaking ? 'speaking' : ''}`} aria-label="Animated teacher avatar">
              <g className="avatar-body">
                {/* Right Arm (from viewer's perspective) */}
                <g style={{ transform: gesture === 'explain' ? 'rotate(15deg)' : 'rotate(5deg)', transition: 'transform 0.4s ease', transformOrigin: '195px 165px' }}>
                  <path d="M195 165 C 205 210, 215 280, 210 320 L 190 325 L 180 170 Z" fill="#4A5568" />
                </g>

                {/* Torso */}
                <path d="M100 360 L 100 170 C 100 150, 120 130, 150 130 C 180 130, 200 150, 200 170 L 200 360 Z" fill="#718096"/>
                <path d="M150 130 L 150 220 L 165 220 L 170 145 C 160 135, 155 130, 150 130 Z" fill="#E2E8F0"/>
                <path d="M150 130 L 150 220 L 135 220 L 130 145 C 140 135, 145 130, 150 130 Z" fill="#F7FAFC"/>
                <path d="M140 220 L 160 220 L 155 240 L 145 240 Z" fill="#2D3748"/>

                {/* Head */}
                <g transform="translate(0, -5)">
                    <path d="M110 70 C 90 100, 90 150, 110 180 L 190 180 C 210 150, 210 100, 190 70 Z" fill="#fbd38d"/>
                    <path d="M110 70 C 110 50, 190 50, 190 70 L 180 60 C 170 45, 130 45, 120 60 Z" fill="#2D3748" />
                    
                    {/* Eyes & Glasses */}
                    <g className="avatar-eyes-open">
                      <circle cx="135" cy="115" r="5" fill="#2D3748"/>
                      <circle cx="165" cy="115" r="5" fill="#2D3748"/>
                    </g>
                    <path d="M115 115 L 185 115 M147 115 L 153 115" stroke="#4A5568" strokeWidth="2" fill="none"/>
                    <circle cx="135" cy="115" r="10" stroke="#4A5568" strokeWidth="2" fill="none"/>
                    <circle cx="165" cy="115" r="10" stroke="#4A5568" strokeWidth="2" fill="none"/>
                    
                    {/* Eyebrows */}
                    <path d="M128 100 C 132 97, 140 97, 142 100" stroke="#2D3748" strokeWidth="2" fill="none"/>
                    <path d="M158 100 C 162 97, 170 97, 172 100" stroke="#2D3748" strokeWidth="2" fill="none"/>

                    {/* Mouth */}
                    <g className="avatar-mouth">
                      <path d="M140 150 Q 150 155, 160 150" stroke="#4A5568" strokeWidth="2" fill="none"/>
                    </g>
                </g>
                
                {/* Left Arm (from viewer's perspective) */}
                 <g style={{ transform: gesture === 'point' ? 'rotate(-35deg)' : (gesture === 'explain' ? 'rotate(-15deg)' : 'rotate(-5deg)'), transition: 'transform 0.4s ease', transformOrigin: '105px 165px' }}>
                    <path d="M105 165 C 95 210, 85 280, 90 320 L 110 325 L 120 170 Z" fill="#4A5568"/>
                </g>
              </g>
            </svg>
          </div>

          {/* Back of Avatar */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <svg viewBox="0 0 300 360" className="w-full h-full" aria-label="Back of teacher avatar">
              <g>
                <path d="M105 165 L 195 165 L 180 170 L 190 325 L 210 320 L 205 165 M105 165 C 95 210, 85 280, 90 320 L 110 325 L 120 170 Z" fill="#4A5568" />
                <path d="M100 360 L 100 170 C 100 150, 120 130, 150 130 C 180 130, 200 150, 200 170 L 200 360 Z" fill="#667284"/>
                <g transform="translate(0, -5)">
                    <path d="M110 70 C 90 100, 90 150, 110 180 L 190 180 C 210 150, 210 100, 190 70 Z" fill="#fbd38d"/>
                    <path d="M110 70 C 110 40, 190 40, 190 70 L 190 120 C 190 160, 110 160, 110 120 Z" fill="#2D3748" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
