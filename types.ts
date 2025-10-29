
export interface TranscriptMessage {
  author: 'user' | 'teacher';
  text: string;
}

export interface AvatarState {
  isSpeaking: boolean;
  isTurned: boolean;
  emotion: 'neutral' | 'talking' | 'thinking';
  gesture: 'none' | 'point' | 'explain';
}

export type SessionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
