
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, VideoResult, Conversion } from './types';
import { searchVideos, getVideoInfoByUrl } from './services/geminiService';
import VideoCard from './components/VideoCard';
import ConversionItem from './components/ConversionItem';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load conversions from session storage (optional mockup)
  useEffect(() => {
    const saved = sessionStorage.getItem('conversions');
    if (saved) setConversions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    sessionStorage.setItem('conversions', JSON.stringify(conversions));
  }, [conversions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const data = await searchVideos(searchQuery);
      setResults(data);
    } catch (err) {
      setError('Falha ao buscar vídeos. Verifique sua conexão.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.includes('youtube.com') && !urlInput.includes('youtu.be')) {
      setError('Por favor, insira uma URL válida do YouTube.');
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const info = await getVideoInfoByUrl(urlInput);
      if (info) {
        setResults([info]);
      } else {
        setError('Não foi possível carregar os detalhes deste vídeo.');
      }
    } catch (err) {
      setError('Erro ao processar URL.');
    } finally {
      setIsSearching(false);
    }
  };

  const startConversion = (video: VideoResult) => {
    const id = `${video.id}-${Date.now()}`;
    const newConversion: Conversion = {
      id,
      video,
      status: 'processing',
      progress: 0,
      timestamp: Date.now()
    };
    
    setConversions(prev => [newConversion, ...prev]);
    
    // Simulate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setConversions(prev => prev.map(c => 
          c.id === id ? { ...c, status: 'completed', progress: 100 } : c
        ));
        clearInterval(interval);
      } else {
        setConversions(prev => prev.map(c => 
          c.id === id ? { ...c, progress: currentProgress } : c
        ));
      }
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <i className="fab fa-youtube text-5xl text-red-600 animate-pulse"></i>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            YouTube <span className="gradient-text">MP3 Pro</span>
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Converta seus vídeos favoritos para áudio de alta qualidade em segundos, alimentado por IA.
        </p>
      </header>

      <main className="glass-effect rounded-3xl p-6 md:p-8 shadow-2xl relative">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 mb-8 overflow-x-auto">
          {[
            { id: AppTab.SEARCH, label: 'Busca Inteligente', icon: 'fa-search' },
            { id: AppTab.URL, label: 'Converter URL', icon: 'fa-link' },
            { id: AppTab.HISTORY, label: 'Histórico', icon: 'fa-history' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AppTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                ? 'border-red-500 text-red-500' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Tab Content */}
        {activeTab === AppTab.SEARCH && (
          <div className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Busque por música, artista ou playlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 px-6 pl-14 text-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-slate-600"
              />
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-500 transition-colors"></i>
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {isSearching ? <i className="fas fa-spinner fa-spin"></i> : 'Buscar'}
              </button>
            </div>
            
            {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl text-sm"><i className="fas fa-exclamation-circle mr-2"></i>{error}</div>}

            <div className="grid grid-cols-1 gap-4 mt-8">
              {results.length > 0 ? (
                results.map(video => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    onConvert={startConversion}
                    isProcessing={conversions.some(c => c.video.id === video.id && c.status === 'processing')}
                  />
                ))
              ) : !isSearching && (
                <div className="text-center py-20 opacity-30">
                  <i className="fas fa-music text-6xl mb-4"></i>
                  <p>Comece buscando por algo incrível</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL Tab Content */}
        {activeTab === AppTab.URL && (
          <div className="space-y-6">
            <div className="bg-slate-800/30 p-8 rounded-2xl border border-dashed border-slate-700 text-center">
              <i className="fas fa-link text-4xl text-red-500/50 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Conversão Direta</h3>
              <p className="text-slate-400 text-sm mb-6">Cole o link completo do vídeo abaixo</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button 
                  onClick={handleUrlSubmit}
                  disabled={isSearching}
                  className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-slate-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  {isSearching ? 'Analisando...' : 'Obter Vídeo'}
                </button>
              </div>
            </div>

            {results.length > 0 && activeTab === AppTab.URL && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Resultado encontrado:</h4>
                <VideoCard 
                  video={results[0]} 
                  onConvert={startConversion}
                  isProcessing={conversions.some(c => c.video.id === results[0].id && c.status === 'processing')}
                />
              </div>
            )}
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === AppTab.HISTORY && (
          <div className="space-y-4">
            {conversions.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <i className="fas fa-history text-6xl mb-4"></i>
                <p>Nenhuma conversão recente</p>
              </div>
            ) : (
              conversions.map(c => <ConversionItem key={c.id} conversion={c} />)
            )}
          </div>
        )}
      </main>

      {/* Floating Active Conversions */}
      {conversions.some(c => c.status === 'processing') && (
        <div className="fixed bottom-6 right-6 w-80 z-50 animate-bounce-subtle">
           <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl p-4">
             <div className="flex items-center justify-between mb-3">
               <span className="text-xs font-bold uppercase text-red-500">Processando Áudio</span>
               <i className="fas fa-circle-notch fa-spin text-red-500"></i>
             </div>
             {conversions.filter(c => c.status === 'processing').slice(0, 1).map(c => (
               <div key={c.id} className="text-sm truncate text-slate-300">{c.video.title}</div>
             ))}
           </div>
        </div>
      )}

      <footer className="mt-16 text-center text-slate-500 text-sm space-y-4">
        <p>Desenvolvido com tecnologia de ponta para amantes da música.</p>
        <div className="flex justify-center gap-6 opacity-50">
          <i className="fab fa-github hover:text-white transition-colors cursor-pointer"></i>
          <i className="fab fa-twitter hover:text-white transition-colors cursor-pointer"></i>
          <i className="fab fa-discord hover:text-white transition-colors cursor-pointer"></i>
        </div>
        <p className="text-[10px] uppercase tracking-widest opacity-30">
          Aviso: Utilize apenas para conteúdos permitidos pelos termos de serviço.
        </p>
      </footer>
    </div>
  );
};

export default App;
