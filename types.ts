
export interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  url: string;
}

export enum AppTab {
  SEARCH = 'search',
  URL = 'url',
  HISTORY = 'history'
}

export interface Conversion {
  id: string;
  video: VideoResult;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  timestamp: number;
  downloadUrl?: string;
}
