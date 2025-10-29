
import React from 'react';
import type { TranscriptMessage } from '../types';

interface TranscriptProps {
  messages: TranscriptMessage[];
}

export const Transcript: React.FC<TranscriptProps> = ({ messages }) => {
  return (
    <div className="w-full mt-4 h-32 bg-slate-700 bg-opacity-50 rounded-lg p-4 overflow-y-auto border border-slate-600">
      <div className="flex flex-col gap-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.author === 'teacher' && <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>}
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.author === 'user' ? 'bg-green-700' : 'bg-slate-600'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
             {msg.author === 'user' && <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center font-bold text-sm">You</div>}
          </div>
        ))}
        {messages.length === 0 && <p className="text-slate-400 text-center">Conversation will appear here...</p>}
      </div>
    </div>
  );
};
