
import React, { useState, useCallback } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  Image as ImageIcon,
  PenTool,
  CheckCircle,
  Loader2,
  Download,
  Hash,
  RotateCcw,
  ArrowLeft,
  X
} from 'lucide-react';
import { 
  BidangType, 
  PeringkatType, 
  PencapaianType, 
  KategoriJawatan, 
  ReportData 
} from './types';
import { THEMES } from './constants';
import { generateObjectives, generateSummary } from './services/geminiService';
import SignaturePad from './components/SignaturePad';
import ReportTemplate from './components/ReportTemplate';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const MAX_CHAR_COUNT = 500;

const SUB_KATEGORI_OPTIONS: Record<KategoriJawatan, string[]> = {
  [KategoriJawatan.PENGETUA]: ['Tidak Berkenaan'],
  [KategoriJawatan.PENOLONG_KANAN]: ['Tidak Berkenaan'],
  [KategoriJawatan.GKMP]: ['Sains Kemasyarakatan', 'Sains dan Matematik', 'Bahasa'],
  [KategoriJawatan.GURU]: ['Sains', 'Matematik', 'Bahasa Inggeris', 'Bahasa Melayu', 'Pendidikan Jasmani', 'Pendidikan Islam', 'Pendidikan Moral'],
  [KategoriJawatan.JURULATIH]: ['Seni Muzik', 'Seni Visual', 'Seni Teater', 'Seni Tari']
};

const INITIAL_STATE: ReportData = {
  bidang: BidangType.KURIKULUM,
  peringkat: PeringkatType.SEKOLAH,
  tajuk: '',
  lokasi: '',
  anjuran: '',
  isDateRange: false,
  tarikhMula: '',
  tarikhTamat: '',
  masaType: 'range',
  masaMula: '',
  masaTamat: '',
  objektif: '',
  impak: '',
  penglibatan: '',
  pencapaian: PencapaianType.TIDAK_BERKENAAN,
  pencapaianDetail: '',
  namaPenyedia: '',
  kategoriPenyedia: KategoriJawatan.GURU,
  subKategoriPenyedia: SUB_KATEGORI_OPTIONS[KategoriJawatan.GURU][0],
  signature: '',
  images: [],
  tahun: new Date().getFullYear().toString()
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<ReportData>(INITIAL_STATE);
  const [loadingAI, setLoadingAI] = useState<{obj: boolean, impak: boolean}>({obj: false, impak: false});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const theme = THEMES[formData.bidang];
  const logoUrl = "https://lh3.googleusercontent.com/d/1tyJ5QLBbqarYBYAzkFmPJ7ZBZ0fYp97u";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'kategoriPenyedia') {
      const jawatan = value as KategoriJawatan;
      const options = SUB_KATEGORI_OPTIONS[jawatan];
      setFormData(prev => ({ 
        ...prev, 
        kategoriPenyedia: jawatan,
        subKategoriPenyedia: options[0] || ''
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    if (window.confirm("Adakah anda pasti untuk mengosongkan semua data dan memulakan pelaporan baharu?")) {
      setFormData(INITIAL_STATE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages = (Array.from(files) as File[]).slice(0, 4 - formData.images.length);
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 4)
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const callAIObjectives = async () => {
    if (!formData.tajuk) return alert("Sila isi Tajuk Program dahulu!");
    setLoadingAI(prev => ({ ...prev, obj: true }));
    const result = await generateObjectives(formData.tajuk);
    setFormData(prev => ({ ...prev, objektif: result.slice(0, MAX_CHAR_COUNT) }));
    setLoadingAI(prev => ({ ...prev, obj: false }));
  };

  const callAISummary = async () => {
    if (!formData.tajuk) return alert("Sila isi Tajuk Program dahulu!");
    setLoadingAI(prev => ({ ...prev, impak: true }));
    const result = await generateSummary(formData.tajuk);
    setFormData(prev => ({ ...prev, impak: result.slice(0, MAX_CHAR_COUNT) }));
    setLoadingAI(prev => ({ ...prev, impak: false }));
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    
    const element = document.getElementById('report-template-hidden');
    if (!element) {
        setIsGeneratingPDF(false);
        return;
    }

    try {
      await new Promise(r => setTimeout(r, 800));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SSEMJ_OPR_${formData.tajuk.replace(/\s+/g, '_') || 'Laporan'}.pdf`);
    } catch (error) {
      console.error("PDF Ralat:", error);
      alert("Gagal menjana PDF. Sila cuba lagi.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out pb-20 bg-slate-50`}>
      <div className={`h-3 transition-all duration-500 ${theme.gradient} sticky top-0 z-50 shadow-md`}></div>
      
      <header className="bg-white shadow-sm border-b px-4 py-8 md:py-10 mb-6 md:mb-10 relative overflow-hidden flex flex-col items-center">
        <div className={`absolute inset-0 opacity-10 ${theme.gradient}`}></div>
        <div className="relative z-10 flex flex-col items-center gap-4 md:gap-5">
          <div className="bg-white p-2 rounded-2xl shadow-xl border">
            <img src={logoUrl} alt="SSEMJ" className="h-16 md:h-24 w-auto" />
          </div>
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 uppercase leading-none">
              SSEMJ <span className={`bg-clip-text text-transparent ${theme.gradient}`}>ONE PAGE REPORT</span>
            </h1>
            <p className="mt-2 md:mt-4 text-xs md:text-xl text-gray-700 font-black tracking-[0.2em] md:tracking-[0.4em] uppercase opacity-80">SISTEM PELAPORAN DIGITAL PANTAS DAN EFISIEN</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
          <div className="p-6 md:p-14">
            <form className="space-y-10 md:space-y-14" onSubmit={(e) => e.preventDefault()}>
              
              {/* Section 1: Bidang & Peringkat */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <PlusCircle className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">1. Bidang & Peringkat</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-black transition-colors">Bidang Pelaporan</label>
                    <select 
                      name="bidang"
                      value={formData.bidang}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-opacity-20 ${theme.border} border-2 p-4 md:p-5 font-bold transition-all text-black text-base md:text-lg uppercase`}
                    >
                      <option value={BidangType.PENTADBIRAN}>PENTADBIRAN</option>
                      <option value={BidangType.HEM}>HEM</option>
                      <option value={BidangType.KURIKULUM}>KURIKULUM</option>
                      <option value={BidangType.KOKURIKULUM}>KOKURIKULUM</option>
                      <option value={BidangType.KESENIAN}>KESENIAN</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-black transition-colors">Peringkat Program</label>
                    <select 
                      name="peringkat"
                      value={formData.peringkat}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-opacity-20 ${theme.border} border-2 p-4 md:p-5 font-bold transition-all text-black text-base md:text-lg`}
                    >
                      {Object.values(PeringkatType).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-black transition-colors flex items-center gap-2">
                       <Hash className="w-4 h-4" /> Tahun
                    </label>
                    <input 
                      type="text" 
                      name="tahun"
                      value={formData.tahun}
                      onChange={handleInputChange}
                      placeholder="2026"
                      className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-opacity-20 ${theme.border} border-2 p-4 md:p-5 font-bold transition-all text-black text-base md:text-lg`}
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Maklumat Program */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <FileText className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">2. Maklumat Program</h2>
                </div>
                <div className="space-y-6 md:space-y-8">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-black transition-colors">Tajuk Program / Aktiviti</label>
                    <input 
                      type="text" 
                      name="tajuk"
                      value={formData.tajuk}
                      onChange={handleInputChange}
                      placeholder="Tajuk program..."
                      className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] shadow-sm border-2 p-4 md:p-6 font-black text-lg md:text-2xl uppercase focus:ring-4 focus:ring-opacity-20 ${theme.border} transition-all text-black placeholder:opacity-30`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="group">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-black transition-colors flex items-center gap-2">
                        <MapPin className="w-5 h-5" /> Lokasi / Tempat
                      </label>
                      <input 
                        type="text" 
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        placeholder="Lokasi..."
                        className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] shadow-sm border-2 p-4 md:p-5 font-bold text-base md:text-lg uppercase focus:ring-4 focus:ring-opacity-20 ${theme.border} transition-all text-black`}
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 md:mb-3 group-hover:text-black transition-colors flex items-center gap-2">
                        <Users className="w-5 h-5" /> Anjuran / Unit
                      </label>
                      <input 
                        type="text" 
                        name="anjuran"
                        value={formData.anjuran}
                        onChange={handleInputChange}
                        placeholder="Anjuran..."
                        className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] shadow-sm border-2 p-4 md:p-5 font-bold text-base md:text-lg uppercase focus:ring-4 focus:ring-opacity-20 ${theme.border} transition-all text-black`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Tarikh & Masa */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <Calendar className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">3. Tarikh & Masa</h2>
                </div>
                <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] space-y-6 md:space-y-8 border-2 md:border-4 border-dashed border-gray-200">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          name="isDateRange" 
                          checked={formData.isDateRange}
                          onChange={handleInputChange}
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border-gray-300 focus:ring-4 focus:ring-opacity-20 transition-all cursor-pointer`} 
                        />
                      </div>
                      <span className="text-base md:text-lg font-black text-gray-700 uppercase tracking-widest group-hover:text-black">Program Melebihi Sehari</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{formData.isDateRange ? 'Tarikh Mula' : 'Tarikh Program'}</label>
                      <input 
                        type="date" 
                        name="tarikhMula"
                        value={formData.tarikhMula}
                        onChange={handleInputChange}
                        className="w-full bg-white border-gray-200 rounded-xl md:rounded-[1.25rem] shadow-sm border-2 p-3 md:p-4 font-bold focus:ring-4 focus:ring-opacity-20 transition-all text-black"
                      />
                    </div>
                    {formData.isDateRange && (
                      <div>
                        <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tarikh Tamat</label>
                        <input 
                          type="date" 
                          name="tarikhTamat"
                          value={formData.tarikhTamat}
                          onChange={handleInputChange}
                          className="w-full bg-white border-gray-200 rounded-xl md:rounded-[1.25rem] shadow-sm border-2 p-3 md:p-4 font-bold focus:ring-4 focus:ring-opacity-20 transition-all text-black"
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Jenis Masa
                      </label>
                      <select 
                        name="masaType"
                        value={formData.masaType}
                        onChange={handleInputChange}
                        className="w-full bg-white border-gray-200 rounded-xl md:rounded-[1.25rem] shadow-sm border-2 p-3 md:p-4 font-bold focus:ring-4 focus:ring-opacity-20 transition-all text-black"
                      >
                        <option value="range">Masa Spesifik (Mula - Akhir)</option>
                        <option value="sepanjang_hari">Sepanjang Hari</option>
                        <option value="sepanjang_program">Sepanjang Program</option>
                      </select>
                    </div>
                    {formData.masaType === 'range' && (
                      <div className="flex gap-4 md:gap-6 items-end">
                        <div className="flex-1">
                          <label className="block text-[8px] md:text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Mula</label>
                          <input type="time" name="masaMula" value={formData.masaMula} onChange={handleInputChange} className="w-full bg-white border-gray-200 rounded-xl md:rounded-[1.25rem] border-2 p-3 md:p-4 font-bold text-black" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[8px] md:text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Tamat</label>
                          <input type="time" name="masaTamat" value={formData.masaTamat} onChange={handleInputChange} className="w-full bg-white border-gray-200 rounded-xl md:rounded-[1.25rem] border-2 p-3 md:p-4 font-bold text-black" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 4: Kandungan AI */}
              <section className="space-y-8 md:space-y-10">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">4. Kandungan Laporan (500 Aksara)</h2>
                </div>
                
                <div className="space-y-10 md:space-y-12">
                  <div className="group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-black">Objektif Program</label>
                      <button 
                        type="button" 
                        onClick={callAIObjectives}
                        disabled={loadingAI.obj}
                        className={`flex items-center gap-3 text-xs md:text-sm px-5 py-2.5 md:px-6 md:py-3 rounded-full ${theme.gradient} text-white font-black hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-50`}
                      >
                        {loadingAI.obj ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />}
                        JANA IDEA AI
                      </button>
                    </div>
                    <textarea 
                      name="objektif"
                      value={formData.objektif}
                      onChange={handleInputChange}
                      rows={5}
                      maxLength={MAX_CHAR_COUNT}
                      className="w-full bg-gray-50 border-gray-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner border-2 p-6 md:p-8 font-medium text-black leading-relaxed focus:ring-4 focus:ring-opacity-20 transition-all text-base md:text-lg"
                      placeholder="Objektif program..."
                    ></textarea>
                    <div className="text-right mt-2">
                       <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${formData.objektif.length >= MAX_CHAR_COUNT ? 'text-red-500' : 'text-gray-400'}`}>
                         {formData.objektif.length} / {MAX_CHAR_COUNT} Aksara
                       </span>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-black">Impak dan Rumusan</label>
                      <button 
                        type="button" 
                        onClick={callAISummary}
                        disabled={loadingAI.impak}
                        className={`flex items-center gap-3 text-xs md:text-sm px-5 py-2.5 md:px-6 md:py-3 rounded-full ${theme.gradient} text-white font-black hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-50`}
                      >
                        {loadingAI.impak ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />}
                        JANA IDEA AI
                      </button>
                    </div>
                    <textarea 
                      name="impak"
                      value={formData.impak}
                      onChange={handleInputChange}
                      rows={5}
                      maxLength={MAX_CHAR_COUNT}
                      className="w-full bg-gray-50 border-gray-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner border-2 p-6 md:p-8 font-medium text-black leading-relaxed focus:ring-4 focus:ring-opacity-20 transition-all text-base md:text-lg"
                      placeholder="Impak dan rumusan..."
                    ></textarea>
                    <div className="text-right mt-2">
                       <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${formData.impak.length >= MAX_CHAR_COUNT ? 'text-red-500' : 'text-gray-400'}`}>
                         {formData.impak.length} / {MAX_CHAR_COUNT} Aksara
                       </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Penglibatan & Pencapaian */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">5. Penglibatan & Pencapaian</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Butiran Penglibatan Utama</label>
                    <input 
                      type="text" 
                      name="penglibatan"
                      value={formData.penglibatan}
                      onChange={handleInputChange}
                      placeholder="Penglibatan..."
                      className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] border-2 p-4 md:p-5 font-black uppercase transition-all text-black text-base md:text-lg focus:ring-4 focus:ring-opacity-20 ${theme.border}`}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Pencapaian Utama</label>
                    <div className="space-y-4">
                      <select 
                        name="pencapaian"
                        value={formData.pencapaian}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] border-2 p-4 md:p-5 font-bold transition-all text-black text-base md:text-lg focus:ring-4 focus:ring-opacity-20 ${theme.border}`}
                      >
                        {Object.values(PencapaianType).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {(formData.pencapaian === PencapaianType.ANUGERAH_KHAS || formData.pencapaian === PencapaianType.LAIN_LAIN) && (
                        <input 
                          type="text" 
                          name="pencapaianDetail"
                          value={formData.pencapaianDetail}
                          onChange={handleInputChange}
                          placeholder="Nyatakan pencapaian..."
                          className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] border-2 p-4 md:p-5 font-black uppercase transition-all text-black text-base md:text-lg focus:ring-4 focus:ring-opacity-20 ${theme.border}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6: Gambar Landskap */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <ImageIcon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">6. Lampiran Gambar</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[16/10] border-4 md:border-8 border-white shadow-xl rounded-xl md:rounded-[1.5rem] overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" alt="Activity" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)}
                          className="bg-white text-red-600 rounded-full p-2 md:p-4 transform scale-0 group-hover:scale-100 transition-all hover:bg-red-600 hover:text-white active:scale-90"
                        >
                          <PlusCircle className="w-6 h-6 md:w-8 md:h-8 rotate-45" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.images.length < 4 && (
                    <label className="aspect-[16/10] border-2 md:border-4 border-dashed border-gray-200 rounded-xl md:rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all group overflow-hidden relative">
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 ${theme.gradient}`}></div>
                      <ImageIcon className={`w-8 h-8 md:w-14 md:h-14 text-gray-300 group-hover:scale-110 transition-all duration-500`} />
                      <span className="text-[8px] md:text-xs text-gray-400 mt-2 md:mt-4 uppercase font-black tracking-widest group-hover:text-black">Gambar {formData.images.length + 1}</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </section>

              {/* Section 7: Penyedia & Tandatangan */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4 pb-3 border-b-2 md:border-b-4 border-gray-50">
                  <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${theme.gradient} text-white shadow-lg`}>
                    <PenTool className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">7. Penyedia Laporan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                  <div className="space-y-6 md:space-y-8">
                    <div className="group">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nama Penuh</label>
                      <input 
                        type="text" 
                        name="namaPenyedia"
                        value={formData.namaPenyedia}
                        onChange={handleInputChange}
                        placeholder="Nama penuh..."
                        className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] border-2 p-4 md:p-5 font-black uppercase transition-all text-black text-base md:text-lg focus:ring-4 focus:ring-opacity-20 ${theme.border}`}
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Kategori Jawatan</label>
                      <select 
                        name="kategoriPenyedia"
                        value={formData.kategoriPenyedia}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] border-2 p-4 md:p-5 font-bold transition-all text-black text-base md:text-lg focus:ring-4 focus:ring-opacity-20 ${theme.border}`}
                      >
                        {Object.values(KategoriJawatan).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Sub Unit / Bidang</label>
                      <select 
                        name="subKategoriPenyedia"
                        value={formData.subKategoriPenyedia}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50 border-gray-200 rounded-xl md:rounded-[1.5rem] border-2 p-4 md:p-5 font-bold transition-all text-black text-base md:text-lg focus:ring-4 focus:ring-opacity-20 ${theme.border}`}
                      >
                        {SUB_KATEGORI_OPTIONS[formData.kategoriPenyedia].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 border-dashed border-gray-200 relative">
                    <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 md:mb-6 text-center italic">Tandatangan Digital</label>
                    <SignaturePad 
                      onSave={(dataUrl) => setFormData(prev => ({ ...prev, signature: dataUrl }))} 
                      initialValue={formData.signature}
                    />
                  </div>
                </div>
              </section>
            </form>
          </div>

          <div className="bg-slate-50 px-6 md:px-14 py-8 md:py-12 flex flex-col md:flex-row gap-6 md:gap-10 justify-between items-center border-t-2 border-gray-100">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10 order-2 md:order-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-red-500 hover:text-red-700 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                ISI PELAPORAN BAHARU
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-gray-500 hover:text-black font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
              >
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
                {showPreview ? 'SEMBUNYI PREVIEW' : 'PREVIEW LAPORAN'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className={`w-full md:w-auto px-8 md:px-16 py-5 md:py-7 ${theme.gradient} text-white font-black rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 hover:brightness-110 transition-all flex items-center justify-center gap-4 disabled:opacity-70 uppercase tracking-[0.2em] text-base md:text-lg active:scale-95 order-1 md:order-2`}
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" />
                  PROSES PDF...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                  SAHKAN & JANA PDF
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Floating Preview Area */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-95 backdrop-blur-2xl flex flex-col items-center">
          {/* STICKY HEADER FOR PREVIEW */}
          <div className="sticky top-0 w-full z-[70] bg-black bg-opacity-50 border-b border-white border-opacity-10 backdrop-blur-md px-4 py-3 md:py-6 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-2 md:gap-4">
               <button 
                onClick={() => setShowPreview(false)}
                className="bg-white text-black p-2 md:p-3 rounded-full hover:bg-slate-200 transition-all active:scale-90 flex items-center gap-2 pr-4"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-black text-[10px] md:text-sm uppercase tracking-widest hidden sm:inline">KEMBALI</span>
              </button>
              <h3 className="text-white font-black text-xs md:text-2xl uppercase tracking-[0.1em] md:tracking-[0.4em] flex items-center gap-2 md:gap-4">
                <Download className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" /> PREVIEW EKSKLUSIF
              </h3>
            </div>
            
            <button 
              onClick={() => setShowPreview(false)}
              className="text-white hover:text-red-500 transition-all p-2"
            >
              <X className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          </div>

          {/* PREVIEW CONTENT */}
          <div className="p-4 md:p-14 w-full flex flex-col items-center gap-12 pb-24">
            <div className="transform scale-[0.38] origin-top sm:scale-[0.6] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-transform duration-700 shadow-[0_0_100px_rgba(255,255,255,0.15)] rounded-lg">
              <ReportTemplate data={formData} id="report-template" />
            </div>

            {/* BOTTOM CLOSE BUTTON FOR SMARTPHONE USERS */}
            <button 
              onClick={() => setShowPreview(false)}
              className="bg-white text-black font-black px-10 py-6 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-3xl active:scale-95 flex items-center gap-4 text-sm md:text-lg uppercase tracking-[0.3em] border-4 border-white border-opacity-20"
            >
              <RotateCcw className="w-6 h-6" />
              TUTUP PREVIEW & EDIT SEMULA
            </button>
          </div>
        </div>
      )}

      {/* Hidden container for PDF capture */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none">
        <ReportTemplate data={formData} id="report-template-hidden" />
      </div>

      <footer className="mt-12 md:mt-24 text-center text-gray-400 font-black uppercase tracking-[0.3em] md:tracking-[0.6em] pb-10 md:pb-16 text-[8px] md:text-xs opacity-50 px-4">
        <p>&copy; 2026 SSEMJ DIGITAL OPR SYSTEM | DEVELOPED BY DZURRI</p>
      </footer>
    </div>
  );
};

export default App;
