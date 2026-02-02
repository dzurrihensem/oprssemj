
import React from 'react';
import { ReportData, PencapaianType } from '../types';
import { THEMES } from '../constants';

interface ReportTemplateProps {
  data: ReportData;
  id: string;
}

const ReportTemplate: React.FC<ReportTemplateProps> = ({ data, id }) => {
  const theme = THEMES[data.bidang];
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMasa = () => {
    if (data.masaType === 'range') return `${data.masaMula} - ${data.masaTamat}`;
    return data.masaType.replace(/_/g, ' ').toUpperCase();
  };

  /**
   * Optimized font scaling for A4 PDF layout
   */
  const getDynamicFontSize = (text: string, baseSize: number, threshold: number, minSize: number) => {
    if (!text) return `${baseSize}pt`;
    const len = text.trim().length;
    if (len <= threshold) return `${baseSize}pt`;
    
    // Calculate scale: as length increases, size decreases
    const scale = threshold / len;
    const newSize = Math.max(minSize, baseSize * Math.pow(scale, 0.7));
    return `${newSize.toFixed(2)}pt`;
  };

  const logoUrl = "https://lh3.googleusercontent.com/d/1tyJ5QLBbqarYBYAzkFmPJ7ZBZ0fYp97u";

  return (
    <div 
      id={id} 
      className="report-preview-container bg-white text-black flex flex-col relative" 
      style={{ 
        width: '210mm', 
        height: '297mm', 
        padding: '10mm 12mm', 
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Top Banner Accent */}
      <div className={`absolute top-0 left-0 w-full h-3 ${theme.gradient}`}></div>

      {/* 1. HEADER SECTION (Height fixed approx 35mm) */}
      <div className="flex justify-between items-center mb-4 mt-2 h-[35mm]">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
             <img src={logoUrl} className="w-full h-full object-contain" alt="Logo SSEMJ" crossOrigin="anonymous" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[19pt] font-black text-gray-800 leading-none tracking-tighter">SEKOLAH SENI MALAYSIA JOHOR</h1>
            <h2 className={`text-[16pt] font-extrabold ${theme.text} tracking-[0.05em] uppercase mt-1`}>ONE PAGE REPORT</h2>
            <div className={`h-1 w-24 ${theme.gradient} rounded-full mt-1`}></div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`${theme.gradient} text-white px-6 py-2 rounded-2xl flex flex-col items-center shadow-lg`}>
            <span className="text-[8pt] font-bold uppercase tracking-widest opacity-80">Tahun</span>
            <span className="text-[22pt] font-black leading-none">{data.tahun || '2026'}</span>
          </div>
        </div>
      </div>

      {/* 2. TITLE & BIDANG (Height fixed approx 25mm) */}
      <div className="flex gap-3 mb-4 h-[25mm]">
        <div className={`flex-1 border-[1.5pt] ${theme.border} border-opacity-40 rounded-2xl p-3 bg-white flex flex-col justify-center relative overflow-hidden`}>
          <span className="text-[7pt] text-gray-400 font-bold uppercase absolute top-1.5 left-4">Tajuk Program / Aktiviti</span>
          <h3 
            className="font-black text-gray-900 uppercase leading-tight mt-1"
            style={{ fontSize: getDynamicFontSize(data.tajuk, 13, 40, 9) }}
          >
            {data.tajuk || 'NAMA PROGRAM'}
          </h3>
        </div>
        <div className={`${theme.gradient} w-[60mm] rounded-2xl p-2 flex flex-col items-center justify-center text-white shadow-md`}>
          <span className="text-[7pt] font-bold uppercase opacity-80 tracking-widest">Bidang</span>
          <span className="text-[13pt] font-black italic uppercase text-center leading-none tracking-widest">{data.bidang}</span>
        </div>
      </div>

      {/* 3. STATS ROW (Height fixed approx 15mm) */}
      <div className="grid grid-cols-5 gap-2 mb-4 h-[15mm]">
        {[
          { label: 'Tarikh', value: data.isDateRange ? `${formatDate(data.tarikhMula)} - ${formatDate(data.tarikhTamat)}` : formatDate(data.tarikhMula) },
          { label: 'Masa', value: formatMasa() },
          { label: 'Peringkat', value: data.peringkat.toUpperCase() },
          { label: 'Tempat', value: (data.lokasi || '-').toUpperCase() },
          { label: 'Pencapaian', value: (data.pencapaian === PencapaianType.ANUGERAH_KHAS || data.pencapaian === PencapaianType.LAIN_LAIN ? data.pencapaianDetail : data.pencapaian).toUpperCase() }
        ].map((stat, i) => (
          <div key={i} className={`border-[1pt] ${theme.border} border-opacity-20 rounded-xl p-1.5 flex flex-col justify-center bg-gray-50 bg-opacity-30 h-full overflow-hidden`}>
            <span className={`text-[6pt] font-bold ${theme.text} uppercase mb-0.5 tracking-tighter`}>{stat.label}</span>
            <span 
              className="font-black text-gray-800 leading-none uppercase"
              style={{ fontSize: getDynamicFontSize(stat.value, 7.5, 12, 5.5) }}
            >
              {stat.value || '-'}
            </span>
          </div>
        ))}
      </div>

      {/* 4. MAIN CONTENT AREA (Flex-1) */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="grid grid-cols-12 gap-4 h-full min-h-0">
          
          {/* Left: Objectives & Impact (Take 8/12) - PRIORITY */}
          <div className="col-span-8 flex flex-col gap-4 min-h-0">
            {/* Objectives */}
            <div className={`border-[1.5pt] ${theme.border} border-opacity-30 rounded-[2rem] p-6 flex-1 bg-white shadow-sm flex flex-col min-h-0`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1 h-4 ${theme.gradient} rounded-full`}></div>
                <h4 className={`text-[10pt] font-black ${theme.text} uppercase tracking-wider`}>Objektif Program</h4>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <p 
                  className="text-gray-800 whitespace-pre-wrap leading-[1.4] font-medium"
                  style={{ fontSize: getDynamicFontSize(data.objektif, 10, 200, 7.5) }}
                >
                  {data.objektif || 'Tiada objektif dinyatakan.'}
                </p>
              </div>
            </div>

            {/* Impact */}
            <div className={`border-[1.5pt] ${theme.border} border-opacity-30 rounded-[2rem] p-6 flex-1 bg-white shadow-sm flex flex-col min-h-0`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1 h-4 ${theme.gradient} rounded-full`}></div>
                <h4 className={`text-[10pt] font-black ${theme.text} uppercase tracking-wider`}>Impak & Rumusan</h4>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <p 
                  className="text-gray-800 whitespace-pre-wrap leading-[1.4] font-medium"
                  style={{ fontSize: getDynamicFontSize(data.impak, 10, 200, 7.5) }}
                >
                  {data.impak || 'Tiada impak atau rumusan dinyatakan.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Photos (Take 4/12) */}
          <div className="col-span-4 flex flex-col gap-2 min-h-0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 bg-gray-100 border-[1pt] border-gray-200 rounded-xl overflow-hidden relative aspect-[16/11]`}>
                {data.images[i] ? (
                  <img src={data.images[i]} className="w-full h-full object-cover" alt="Activity" crossOrigin="anonymous" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM DETAILS (Height fixed approx 18mm) */}
      <div className="grid grid-cols-2 gap-4 mt-4 h-[18mm]">
        <div className={`${theme.gradient} rounded-xl px-5 py-2 flex flex-col justify-center text-white shadow-md overflow-hidden`}>
           <span className="text-[6.5pt] font-bold uppercase opacity-80 mb-0.5 tracking-widest">Penglibatan Utama</span>
           <span 
             className="font-black uppercase tracking-tight leading-tight"
             style={{ fontSize: getDynamicFontSize(data.penglibatan, 10, 25, 7) }}
           >
             {data.penglibatan || '-'}
           </span>
        </div>
        <div className={`border-[1.5pt] ${theme.border} border-opacity-40 rounded-xl px-5 py-2 flex flex-col justify-center bg-white shadow-sm text-right overflow-hidden`}>
           <span className={`text-[6.5pt] font-bold ${theme.text} uppercase mb-0.5 tracking-widest`}>Anjuran / Unit</span>
           <span 
             className={`font-black ${theme.text} uppercase tracking-tight leading-tight`}
             style={{ fontSize: getDynamicFontSize(data.anjuran, 10, 25, 7) }}
           >
             {data.anjuran || '-'}
           </span>
        </div>
      </div>

      {/* Divider */}
      <div className={`w-full h-[1pt] ${theme.gradient} opacity-20 mt-4 mb-3`}></div>

      {/* 6. SIGNATURE SECTION (Height fixed approx 35mm) */}
      <div className="flex justify-between items-end h-[35mm] mb-1">
        <div className="flex flex-col w-[65%]">
          <span className="text-[8pt] font-black text-gray-400 uppercase tracking-widest italic">DISEDIAKAN OLEH;</span>
          
          <div className="relative h-14 w-52 mt-1">
             {data.signature && (
               <img 
                 src={data.signature} 
                 className="absolute bottom-[-2px] left-0 h-[125%] w-auto object-contain object-left mix-blend-multiply" 
                 alt="Signature" 
                 crossOrigin="anonymous" 
               />
             )}
             <div className="absolute bottom-0 left-0 w-full h-[1pt] bg-gray-800"></div>
          </div>
          
          <p className="font-black text-gray-900 leading-none uppercase tracking-tight mt-3 text-[13pt] truncate">
            {data.namaPenyedia || 'NAMA PENYEDIA'}
          </p>
          
          <p className="font-bold uppercase tracking-wide mt-1 text-[8.5pt]">
            <span className={theme.text}>{data.kategoriPenyedia}</span>
            {data.subKategoriPenyedia && data.subKategoriPenyedia !== 'Tidak Berkenaan' && (
               <span className="text-gray-500"> — {data.subKategoriPenyedia.toUpperCase()}</span>
            )}
            <span className="text-gray-800 font-black"> SSEMJ</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className={`${theme.gradient} text-white px-5 py-2.5 rounded-xl flex items-center shadow-lg`}>
             <span className="text-[9pt] font-black uppercase tracking-widest">SSEMJ OPR SYSTEM</span>
           </div>
           <span className="text-[6.5pt] text-gray-400 font-bold uppercase tracking-[0.3em]">COPYRIGHT@DZURRI@2026</span>
        </div>
      </div>

    </div>
  );
};

export default ReportTemplate;
