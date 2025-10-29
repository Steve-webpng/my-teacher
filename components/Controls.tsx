
import React, { useRef } from 'react';

interface ControlsProps {
  onFileUpload: (file: File) => void;
  onStartSession: () => void;
  onStopSession: () => void;
  isSessionActive: boolean;
  documentLoaded: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onFileUpload,
  onStartSession,
  onStopSession,
  isSessionActive,
  documentLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md"
      />
      <button
        onClick={handleUploadClick}
        disabled={isSessionActive}
        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Upload Document
      </button>

      {isSessionActive ? (
        <button
          onClick={onStopSession}
          className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
        >
          End Class
        </button>
      ) : (
        <button
          onClick={onStartSession}
          disabled={!documentLoaded}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Start Class
        </button>
      )}
    </div>
  );
};
