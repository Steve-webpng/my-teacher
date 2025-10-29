
import React from 'react';

interface BlackboardProps {
  content: string;
}

export const Blackboard: React.FC<BlackboardProps> = ({ content }) => {
  return (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-900 border-8 border-yellow-800 rounded-lg shadow-2xl p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-yellow-100 border-b-2 border-yellow-200 pb-2 mb-4 font-mono">Lecture Notes</h2>
      <pre className="text-lg text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
        {content || "Upload a document to begin the class..."}
      </pre>
    </div>
  );
};
