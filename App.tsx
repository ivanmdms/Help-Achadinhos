
import React, { useState, useRef, useCallback } from 'react';
import { SocialFormat } from './types';
import { FORMAT_DETAILS } from './constants';
import { processImage } from './services/geminiService';

const App: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(SocialFormat.INSTAGRAM_POST);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1350);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await processImage({
        image: originalImage,
        format: selectedFormat,
        customWidth: selectedFormat === SocialFormat.CUSTOM ? customWidth : undefined,
        customHeight: selectedFormat === SocialFormat.CUSTOM ? customHeight : undefined,
      });
      setProcessedImage(result);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao processar a imagem.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `resized-image-${selectedFormat.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">AI</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              SocialResize AI
            </h1>
          </div>
          <div className="hidden md:block text-sm text-slate-500 font-medium">
            Redimensionamento inteligente movido por Gemini
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-indigo-600">1.</span> Upload da Foto
            </h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${originalImage ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <div className="text-3xl">📁</div>
              <p className="text-sm font-medium text-slate-600 text-center">
                {originalImage ? 'Trocar imagem selecionada' : 'Clique ou arraste sua foto aqui'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG até 10MB</p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-indigo-600">2.</span> Escolha o Formato
            </h2>
            <div className="space-y-3">
              {(Object.keys(SocialFormat) as Array<keyof typeof SocialFormat>).map((key) => {
                const format = SocialFormat[key];
                const detail = FORMAT_DETAILS[format];
                const isActive = selectedFormat === format;
                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-4 transition-all text-left ${
                      isActive 
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{detail.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {detail.label}
                      </p>
                      <p className="text-xs text-slate-500">{detail.description}</p>
                    </div>
                    {isActive && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                  </button>
                );
              })}
            </div>

            {selectedFormat === SocialFormat.CUSTOM && (
              <div className="mt-4 grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Largura</label>
                  <input 
                    type="number" 
                    value={customWidth} 
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Altura</label>
                  <input 
                    type="number" 
                    value={customHeight} 
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}
          </section>

          <button
            onClick={handleGenerate}
            disabled={!originalImage || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              !originalImage || isLoading 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando com IA...
              </>
            ) : (
              <>🚀 Gerar Versão Redimensionada</>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}
        </aside>

        {/* Preview Area */}
        <section className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Resultado Visual</h2>
              {processedImage && (
                <button 
                  onClick={downloadImage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  📥 Baixar Imagem
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6">
              {/* Original Image Card */}
              <div className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex flex-col">
                <div className="p-2 text-center text-xs font-bold text-slate-400 bg-slate-200/50 uppercase">Original</div>
                <div className="flex-1 p-4 flex items-center justify-center min-h-[250px]">
                  {originalImage ? (
                    <img src={originalImage} alt="Original" className="max-w-full max-h-[400px] object-contain shadow-sm rounded-lg" />
                  ) : (
                    <div className="text-slate-300 text-sm italic">Nenhuma imagem carregada</div>
                  )}
                </div>
              </div>

              {/* AI Processed Card */}
              <div className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-indigo-100 flex flex-col relative">
                <div className="p-2 text-center text-xs font-bold text-indigo-400 bg-indigo-50 uppercase">IA Preview - {FORMAT_DETAILS[selectedFormat].label}</div>
                <div className="flex-1 p-4 flex items-center justify-center min-h-[250px]">
                  {processedImage ? (
                    <img src={processedImage} alt="Processada pela IA" className="max-w-full max-h-[400px] object-contain shadow-md rounded-lg animate-in fade-in duration-500" />
                  ) : isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-indigo-400 text-sm font-medium animate-pulse">A IA está reconstruindo sua foto...</p>
                    </div>
                  ) : (
                    <div className="text-slate-300 text-sm italic text-center p-8">
                      {originalImage 
                        ? 'Clique em "Gerar" para ver a mágica da IA preenchendo os espaços.' 
                        : 'Aguardando upload da imagem'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">✨</div>
                  <div>
                    <h4 className="text-sm font-bold">Outpainting</h4>
                    <p className="text-xs text-slate-500">A IA cria novos pixels para estender o cenário da sua foto.</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">🎯</div>
                  <div>
                    <h4 className="text-sm font-bold">Smart Focus</h4>
                    <p className="text-xs text-slate-500">O foco principal é mantido enquanto o fundo é adaptado.</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">⚡</div>
                  <div>
                    <h4 className="text-sm font-bold">Qualidade 2.5</h4>
                    <p className="text-xs text-slate-500">Usa Gemini 2.5 Flash Image para resultados rápidos e nítidos.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Persistent Status Bar for Mobile */}
      <footer className="fixed bottom-0 inset-x-0 glass border-t border-slate-200 lg:hidden p-4">
        <button 
          onClick={handleGenerate}
          disabled={!originalImage || isLoading}
          className={`w-full py-3 rounded-lg font-bold text-white shadow-lg ${
            !originalImage || isLoading ? 'bg-slate-300' : 'bg-indigo-600'
          }`}
        >
          {isLoading ? 'Processando...' : 'Gerar Imagem'}
        </button>
      </footer>
    </div>
  );
};

export default App;
