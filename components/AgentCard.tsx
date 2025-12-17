import React from 'react';
import { AnalysisItem } from '../types';
import { AlertTriangle, CheckCircle, BookOpen, Scissors, GitMerge, MapPin } from 'lucide-react';

interface AgentCardProps {
  report: AnalysisItem;
}

const AgentCard: React.FC<AgentCardProps> = ({ report }) => {
  const getIcon = () => {
    const typeLower = report.type.toLowerCase();
    if (typeLower.includes('apa')) return <BookOpen className="w-5 h-5" />;
    if (typeLower.includes('sözcük') || typeLower.includes('ekonomi') || typeLower.includes('conciseness')) return <Scissors className="w-5 h-5" />;
    if (typeLower.includes('resmi') || typeLower.includes('formal') || typeLower.includes('nesnellik')) return <CheckCircle className="w-5 h-5" />;
    if (typeLower.includes('akış') || typeLower.includes('geçiş') || typeLower.includes('flow')) return <GitMerge className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStyle = () => {
    const typeLower = report.type.toLowerCase();
    
    // APA (Turuncu/Kırmızı - Kritik)
    if (typeLower.includes('apa')) {
      return {
        border: 'border-orange-500',
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        iconColor: 'text-orange-600'
      };
    }
    // Resmi Dil (Lacivert)
    if (typeLower.includes('resmi') || typeLower.includes('nesnellik')) {
      return {
        border: 'border-indigo-800', // Laciverte yakın
        bg: 'bg-indigo-50',
        text: 'text-indigo-900',
        iconColor: 'text-indigo-800'
      };
    }
    // Diğerleri
    return {
      border: 'border-gray-400',
      bg: 'bg-white',
      text: 'text-gray-800',
      iconColor: 'text-gray-600'
    };
  };

  const style = getStyle();

  return (
    <div className={`p-5 mb-4 rounded-lg border-l-4 shadow-sm transition-all hover:shadow-md ${style.border} ${style.bg} ${style.text}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center space-x-2 font-bold text-sm uppercase tracking-wide ${style.iconColor}`}>
          {getIcon()}
          <span>{report.type}</span>
        </div>
        {report.location && (
             <div className="flex items-center space-x-1 text-[11px] font-medium opacity-60 bg-white px-2 py-1 rounded border border-gray-200">
                <MapPin className="w-3 h-3" />
                <span>{report.location}</span>
             </div>
        )}
      </div>
      
      <div className="mb-3 p-3 bg-white/80 rounded border border-black/5">
        <span className="text-[10px] font-bold opacity-60 block mb-1 uppercase tracking-wider">Tespit ({report.issue})</span>
        <p className="font-serif text-sm italic text-gray-900 leading-relaxed">"{report.original}"</p>
      </div>

      <div>
        <span className="text-[10px] font-bold opacity-60 block mb-1 uppercase tracking-wider">Akademik Öneri</span>
        <p className="text-sm font-medium leading-relaxed">{report.suggestion}</p>
      </div>
    </div>
  );
};

export default AgentCard;
