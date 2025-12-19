
import React from 'react';
import { VideoResult } from '../types';

interface VideoCardProps {
  video: VideoResult;
  onConvert: (video: VideoResult) => void;
  isProcessing?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onConvert, isProcessing }) => {
  return (
    <div className="flex flex-col md:flex-row glass-effect rounded-xl overflow-hidden mb-4 transition-all hover:border-red-500/50 group">
      <div className="relative w-full md:w-48 h-28 shrink-0">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">
          {video.duration}
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-slate-400 text-sm">{video.channel}</p>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 italic">High Quality MP3</span>
          <button
            onClick={() => onConvert(video)}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              isProcessing 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/20'
            }`}
          >
            {isProcessing ? (
              <><i className="fas fa-circle-notch fa-spin"></i> Processando</>
            ) : (
              <><i className="fas fa-download"></i> Converter</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
