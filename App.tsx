
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { Avatar } from './components/Avatar';
import { Blackboard } from './components/Blackboard';
import { Controls } from './components/Controls';
import { Transcript } from './components/Transcript';
import { StatusIndicator } from './components/StatusIndicator';
import { encode, decode, decodeAudioData } from './utils/audio';
import type { TranscriptMessage, AvatarState, SessionStatus } from './types';

const App: React.FC = () => {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('disconnected');
  
  // Refactored avatar state for more granular control
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTurned, setIsTurned] = useState(false);
  const [isLaughing, setIsLaughing] = useState(false);
  const [gesture, setGesture] = useState<'none' | 'point' | 'explain'>('none');

  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setDocumentContent(text);
      setTranscripts([]);
    };
    reader.readAsText(file);
  };

  const stopSession = useCallback(async () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    if(inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if(outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      audioSourcesRef.current.forEach(source => source.stop());
      audioSourcesRef.current.clear();
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    setSessionStatus('disconnected');
    setIsSpeaking(false);
    setIsTurned(false);
    setGesture('none');
    setIsLaughing(false);
  }, []);

  const startSession = useCallback(async () => {
    if (!documentContent) {
      alert('Please upload a document first.');
      return;
    }
    setSessionStatus('connecting');
    setTranscripts([]);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    try {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are a very friendly and engaging teacher from Uganda. Your name is Ms. Akiiki. You have a warm, cheerful voice and a slight, pleasant Ugandan accent. You love to make your students laugh with relevant, funny jokes or amusing analogies related to the subject matter. When you make a joke, say "[laughs]" right after. Your primary task is to lecture and explain the following document to a student. Break it down into smaller, digestible parts. After explaining a part, ask the student warmly if they understand or have any questions, like "Does that make sense, dear?" or "Are you with me so far?". Wait for their response. Do not proceed until you get a response. Be conversational and encouraging. Here is the document: \n\n---DOCUMENT---\n${documentContent}\n---END DOCUMENT---`,
        },
        callbacks: {
          onopen: async () => {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
            setSessionStatus('connected');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              const textChunk = message.serverContent.outputTranscription.text;
              currentOutputTranscription += textChunk;
              if (textChunk.toLowerCase().includes('[laughs]')) {
                setIsLaughing(true);
                setTimeout(() => setIsLaughing(false), 2500); // Laugh for 2.5 seconds
              }
            }
            if (message.serverContent?.turnComplete) {
              if (currentInputTranscription.trim()) {
                setTranscripts(prev => [...prev, { author: 'user', text: currentInputTranscription.trim() }]);
              }
              if (currentOutputTranscription.trim()) {
                const cleanedText = currentOutputTranscription.trim().replace(/\[laughs\]/gi, '😂');
                setTranscripts(prev => [...prev, { author: 'teacher', text: cleanedText }]);
              }
              currentInputTranscription = '';
              currentOutputTranscription = '';
            }

            // Handle audio playback
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const decodedData = decode(audioData);
              const audioBuffer = await decodeAudioData(decodedData, outputAudioContextRef.current, 24000, 1);
              
              const currentTime = outputAudioContextRef.current.currentTime;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);

              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              
              source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                   setIsSpeaking(false);
                }
              };

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setSessionStatus('error');
            stopSession();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.');
            stopSession();
          },
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to start session:', error);
      setSessionStatus('error');
      await stopSession();
    }
  }, [documentContent, stopSession]);

  // Effect for managing avatar gestures while speaking
  useEffect(() => {
    let gestureInterval: ReturnType<typeof setInterval> | undefined;
    if (isSpeaking && !isLaughing) {
      gestureInterval = setInterval(() => {
        const gestures: Array<'point' | 'explain' | 'none'> = ['point', 'explain', 'none'];
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
        setGesture(randomGesture);
      }, 2000); // Change gesture every 2 seconds
    } else {
      setGesture('none'); // Reset gesture when not speaking or when laughing
    }
    return () => {
      if (gestureInterval) clearInterval(gestureInterval);
    };
  }, [isSpeaking, isLaughing]);

  // Effect for making the avatar turn to the board when idle
  useEffect(() => {
    let turnTimeout: ReturnType<typeof setTimeout> | undefined;
    if (!isSpeaking && sessionStatus === 'connected') {
      const randomDelay = Math.random() * 15000 + 8000; // 8-23 seconds
      turnTimeout = setTimeout(() => {
        setIsTurned(true);
        setTimeout(() => setIsTurned(false), 3500); // Look at board for 3.5 seconds
      }, randomDelay);
    }
    return () => {
      if (turnTimeout) clearTimeout(turnTimeout);
    };
  }, [isSpeaking, sessionStatus, transcripts]); // Rerun when a turn completes

  const avatarState: AvatarState = {
    isSpeaking,
    isTurned,
    gesture,
    emotion: isLaughing ? 'laughing' : (isSpeaking ? 'talking' : 'neutral'),
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-800 text-white overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at top, #4a5568, #2d3748, #1a202c)' }}>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-stone-700" style={{ perspective: '1500px' }}>
          <div className="absolute inset-0 bg-stone-800 transform rotate-x-60 origin-top" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '2rem 2rem' }}></div>
      </div>
      
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 gap-8 z-10 relative">
        <div className="w-full md:w-1/2 lg:w-3/5 h-full flex flex-col items-center justify-center">
          <Blackboard content={documentContent} />
          <Transcript messages={transcripts} />
        </div>
        <div className="w-full md:w-1/2 lg:w-2/5 h-full flex flex-col items-center justify-center gap-4">
          <Avatar state={avatarState} />
          <StatusIndicator status={sessionStatus} />
          <Controls
            onFileUpload={handleFileUpload}
            onStartSession={startSession}
            onStopSession={stopSession}
            isSessionActive={sessionStatus === 'connected' || sessionStatus === 'connecting'}
            documentLoaded={!!documentContent}
          />
        </div>
      </main>

       <footer className="w-full h-8 bg-stone-900 border-t-4 border-stone-600 z-10 flex items-center justify-center text-stone-400 text-sm">
        Gemini Avatar Teacher
      </footer>
    </div>
  );
};

export default App;
