import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  PenTool, 
  Search, 
  Sparkles, 
  FileText,
  Download,
  Activity,
  Check,
  BookOpen,
  Scale,
  GitMerge,
  Scissors,
  ArrowRight
} from 'lucide-react';
import { processRequest } from './services/geminiService';
import { AppMode, AssistantResponse, AnalysisOption } from './types';
import AgentCard from './components/AgentCard';

const SAMPLE_TEXT = `Atatürk'ün eğitim alanındaki çalışmaları bence gerçekten muazzam bir önem taşımaktadır. Bu bağlamda, Latin alfabesinin kabulü 1928 yılında yapılmıştır. Halkın okuma yazma öğrenmesi için Millet Mektepleri açılmıştır. Aslında bakarsanız, bazı tarihçiler bunun yeterli olmadığını düşünmektedir. Eğitim reformları modern Türkiye'nin temellerini atmıştır.`;

const AGENT_OPTIONS: AnalysisOption[] = [
  { id: 'formal', label: 'Resmi Dil ve Nesnellik Analizi', description: 'Sübjektif ve pasif ifadeleri düzeltir.', selected: true },
  { id: 'conciseness', label: 'Sözcük Ekonomisi ve Kısalık', description: 'Gereksiz dolgu kelimeleri temizler.', selected: true },
  { id: 'flow', label: 'Mantıksal Akış ve Geçiş Kontrolü', description: 'Bağlaç ve paragraf geçişlerini güçlendirir.', selected: true },
  { id: 'apa', label: 'APA 7 Standart Denetimi', description: 'Kaynak eksikliklerini raporlar.', selected: true },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DRAFTING);
  const [agents, setAgents] = useState<AnalysisOption[]>(AGENT_OPTIONS);
  const [activeTab, setActiveTab] = useState<'text' | 'analysis'>('text');
  
  const [inputText, setInputText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [analysisItems, setAnalysisItems] = useState<AssistantResponse['analysis']>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear inputs when switching modes for a clean slate
  useEffect(() => {
    setInputText('');
    setGeneratedText('');
    setAnalysisItems([]);
    setError(null);
    if (mode === AppMode.ANALYSIS) {
        // Optional: Pre-fill specific sample only if explicitly demo-ing
    }
  }, [mode]);

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, selected: !agent.selected } : agent
    ));
  };

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysisItems([]);
    
    try {
      const response = await processRequest(inputText, mode, agents);
      
      setGeneratedText(response.generated_text);
      setAnalysisItems(response.analysis);
      
      // Auto switch tabs based on result content
      if (mode === AppMode.ANALYSIS && response.analysis.length > 0) {
        setActiveTab('analysis');
      } else {
        setActiveTab('text');
      }

    } catch (err: any) {
      setError("İşlem sırasında bir hata oluştu. Lütfen API anahtarınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText || inputText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = mode === AppMode.DRAFTING ? "akademik_taslak.txt" : "duzenlenmis_metin.txt";
    document.body.appendChild(element); 
    element.click();
  };

  return (
    <div className="flex flex-col h-full bg-academic-light font-sans text-academic-dark">
      
      {/* --- HEADER --- */}
      <header className="bg-academic-navy text-white shadow-xl z-20 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none font-serif">Akademik Asistan <span className="text-academic-accent font-light">Pro</span></h1>
              <p className="text-[10px] text-gray-300 font-medium tracking-[0.2em] uppercase mt-1.5 opacity-80">Profesyonel Editör</p>
            </div>
          </div>
          
          {/* Mode Navigation (Tabs) */}
          <div className="flex bg-black/20 p-1.5 rounded-xl backdrop-blur-md border border-white/5">
            <button
              onClick={() => setMode(AppMode.DRAFTING)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                mode === AppMode.DRAFTING 
                  ? 'bg-academic-accent text-white shadow-lg shadow-orange-900/20' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>İçerik Üretimi</span>
            </button>
            <div className="w-px bg-white/10 mx-1"></div>
            <button
              onClick={() => setMode(AppMode.ANALYSIS)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                mode === AppMode.ANALYSIS 
                  ? 'bg-academic-accent text-white shadow-lg shadow-orange-900/20' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Metin Analizi</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row max-w-screen-2xl mx-auto">
          
          {/* LEFT COLUMN: Input & Configuration */}
          <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col border-r border-gray-200 bg-white h-full shadow-lg z-10 relative">
            
            <div className="p-8 flex-1 flex flex-col overflow-y-auto">
              
              {/* Context Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-academic-navy font-serif mb-1 flex items-center">
                   {mode === AppMode.DRAFTING ? <PenTool className="w-5 h-5 mr-2"/> : <Search className="w-5 h-5 mr-2"/>}
                   {mode === AppMode.DRAFTING ? 'Taslak Oluştur' : 'Metni Düzenle'}
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === AppMode.DRAFTING 
                    ? 'Oluşturmak istediğiniz makalenin konusunu veya başlığını aşağıya girin.' 
                    : 'Analiz edilecek akademik metni aşağıya yapıştırın ve kriterleri seçin.'}
                </p>
              </div>

              {/* HIGH CONTRAST TEXTAREA */}
              <div className="mb-6 relative group">
                <textarea
                  className="w-full h-64 lg:h-72 p-6 text-lg text-[#1A1A1A] bg-white border-2 border-gray-200 rounded-xl focus:border-academic-navy focus:ring-4 focus:ring-academic-navy/5 focus:outline-none transition-all resize-none font-serif leading-relaxed placeholder:text-gray-300 shadow-inner"
                  placeholder={mode === AppMode.DRAFTING 
                    ? "Örn: Atatürk'ün dış politika ilkeleri ve bölgesel barışa katkıları..." 
                    : "Analiz için metninizi buraya yapıştırın..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-300 font-medium pointer-events-none bg-white px-2 py-1 rounded">
                  {inputText.length} karakter
                </div>
              </div>

              {/* Conditional Options Panel (Only for Analysis) */}
              {mode === AppMode.ANALYSIS && (
                <div className="mb-8 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Aktif Denetim Ajanları
                    </label>
                    <span className="text-[10px] bg-academic-light px-2 py-1 rounded-full text-gray-600 font-medium">Çoklu Seçim</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {agents.map((agent) => (
                      <div 
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className={`group flex items-center p-3.5 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                          agent.selected 
                            ? 'border-academic-navy bg-indigo-50/50 shadow-sm' 
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3.5 transition-colors shrink-0 ${
                          agent.selected ? 'bg-academic-navy border-academic-navy' : 'bg-white border-gray-300 group-hover:border-orange-400'
                        }`}>
                          {agent.selected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${agent.selected ? 'text-academic-navy' : 'text-gray-600'}`}>
                            {agent.label}
                          </div>
                        </div>
                        <div className={`text-gray-400 ${agent.selected ? 'text-academic-accent' : ''}`}>
                           {agent.id === 'apa' && <BookOpen className="w-4 h-4" />}
                           {agent.id === 'formal' && <Scale className="w-4 h-4" />}
                           {agent.id === 'conciseness' && <Scissors className="w-4 h-4" />}
                           {agent.id === 'flow' && <GitMerge className="w-4 h-4" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleProcess}
                disabled={loading || !inputText.trim()}
                className={`mt-auto w-full flex items-center justify-center space-x-3 py-4 rounded-xl font-bold text-white shadow-lg shadow-academic-navy/20 transition-all transform active:scale-[0.98] ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-academic-navy hover:bg-[#003388] hover:shadow-academic-navy/30'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-orange-200" />
                    <span>{mode === AppMode.DRAFTING ? 'Akademik Taslak Oluştur' : 'Analiz Et ve Düzenle'}</span>
                    <ArrowRight className="w-4 h-4 opacity-60 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & Tabs */}
          <div className="w-full lg:w-7/12 xl:w-2/3 bg-[#F8FAFC] flex flex-col h-full overflow-hidden relative">
            
            {/* Placeholder Empty State */}
            {(!generatedText && analysisItems.length === 0 && !loading) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 opacity-60">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <Bot className="w-12 h-12 text-academic-navy/30" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2 font-serif">Asistan Hazır</h3>
                <p className="text-center max-w-md text-gray-500">
                  {mode === AppMode.DRAFTING 
                    ? 'Konunuzu girin, sizin için kapsamlı bir akademik taslak oluşturalım.' 
                    : 'Metninizi yapıştırın, akademik standartlara göre denetleyip iyileştirelim.'}
                </p>
              </div>
            )}

            {/* Content Area (Only if data exists) */}
            {(generatedText || analysisItems.length > 0) && (
              <>
                {/* Result Tabs */}
                <div className="bg-white border-b border-gray-200 px-8 pt-6 flex items-end justify-between shadow-sm z-10">
                   <div className="flex space-x-8">
                      <button 
                        onClick={() => setActiveTab('text')}
                        className={`pb-4 px-1 text-sm font-bold border-b-[3px] transition-colors flex items-center space-x-2.5 ${
                          activeTab === 'text' 
                            ? 'border-academic-accent text-academic-navy' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <FileText className={`w-4 h-4 ${activeTab === 'text' ? 'text-academic-accent' : ''}`} />
                        <span>{mode === AppMode.DRAFTING ? 'Oluşturulan Taslak' : 'Düzenlenmiş Metin'}</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`pb-4 px-1 text-sm font-bold border-b-[3px] transition-colors flex items-center space-x-2.5 ${
                          activeTab === 'analysis' 
                            ? 'border-academic-accent text-academic-navy' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Activity className={`w-4 h-4 ${activeTab === 'analysis' ? 'text-academic-accent' : ''}`} />
                        <span>Analiz Raporu</span>
                        {analysisItems.length > 0 && (
                          <span className="ml-1.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                            {analysisItems.length}
                          </span>
                        )}
                      </button>
                   </div>
                   
                   {activeTab === 'text' && (
                     <button onClick={handleExport} className="mb-4 text-gray-400 hover:text-academic-navy transition-colors flex items-center space-x-1 text-xs font-bold uppercase tracking-wider">
                       <span>Dışa Aktar</span>
                       <Download className="w-4 h-4" />
                     </button>
                   )}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth bg-[#F8FAFC]">
                  
                  {/* TEXT TAB */}
                  <div className={activeTab === 'text' ? 'block' : 'hidden'}>
                     <div className="max-w-4xl mx-auto bg-white p-10 lg:p-14 shadow-lg shadow-gray-200/50 border border-gray-100 min-h-full rounded-xl">
                        <div className="prose prose-lg prose-slate max-w-none font-serif text-[#1A1A1A] leading-8">
                           {generatedText.split('\n').map((para, i) => (
                              <p key={i} className="mb-6 text-justify">{para}</p>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* ANALYSIS TAB */}
                  <div className={activeTab === 'analysis' ? 'block' : 'hidden'}>
                     <div className="max-w-3xl mx-auto">
                        {analysisItems.length > 0 ? (
                          <div className="space-y-6">
                            <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl flex items-start space-x-4 shadow-sm">
                               <div className="bg-orange-100 p-2 rounded-full">
                                 <Search className="w-5 h-5 text-orange-600" />
                               </div>
                               <div>
                                 <h4 className="font-bold text-academic-navy text-sm mb-1">Analiz Özeti</h4>
                                 <p className="text-sm text-gray-700 leading-relaxed">
                                   Metninizde toplam <span className="font-bold text-orange-600">{analysisItems.length}</span> adet geliştirme alanı tespit edildi. Sistem bu hataları otomatik olarak düzelterek "Düzenlenmiş Metin" sekmesine yansıttı.
                                 </p>
                               </div>
                            </div>
                            
                            {analysisItems.map((item, index) => (
                              <AgentCard key={index} report={item} />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                             <div className="bg-green-50 p-4 rounded-full mb-4">
                                <Check className="w-8 h-8 text-green-500" />
                             </div>
                             <p className="font-bold text-xl text-academic-navy">Harika İş!</p>
                             <p className="text-sm mt-1">Seçilen kriterlere göre herhangi bir sorun bulunamadı.</p>
                          </div>
                        )}
                     </div>
                  </div>

                </div>
              </>
            )}
          </div>

        </div>

        {/* Error Notification */}
        {error && (
          <div className="absolute bottom-6 right-6 max-w-md bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start space-x-4 animate-slide-up z-50">
            <div className="bg-white/20 p-2 rounded-full">!</div>
            <div className="flex-1">
               <h4 className="font-bold text-sm">Hata Oluştu</h4>
               <p className="text-xs mt-1 opacity-90 leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-white/60 hover:text-white transition-colors">✕</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
