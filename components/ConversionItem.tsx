
import React from 'react';
import { Conversion } from '../types';

interface ConversionItemProps {
  conversion: Conversion;
}

const ConversionItem: React.FC<ConversionItemProps> = ({ conversion }) => {
  const { video, status, progress } = conversion;

  return (
    <div className="glass-effect rounded-xl p-4 mb-4 border-l-4 border-l-red-500">
      <div className="flex items-center gap-4">
        <div className="w-16 h-10 rounded overflow-hidden shrink-0">
          <img src={video.thumbnail} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-medium truncate">{video.title}</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-400">
              {status === 'processing' ? 'Convertendo áudio...' : 'Pronto para download'}
            </span>
            <span className="text-xs font-mono text-red-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {status === 'completed' && (
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(`Simulando download do arquivo MP3 para: ${video.title}`);
            }}
            className="p-3 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/30 transition-colors"
          >
            <i className="fas fa-check"></i>
          </a>
        )}
      </div>
    </div>
  );
};

export default ConversionItem;
