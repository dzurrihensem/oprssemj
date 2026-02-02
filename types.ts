
export enum BidangType {
  PENTADBIRAN = 'PENTADBIRAN',
  HEM = 'HEM',
  KURIKULUM = 'KURIKULUM',
  KOKURIKULUM = 'KOKURIKULUM',
  KESENIAN = 'KESENIAN'
}

export enum PeringkatType {
  SEKOLAH = 'Sekolah',
  DAERAH = 'Daerah',
  NEGERI = 'Negeri',
  KEBANGSAAN = 'Kebangsaan',
  ANTARABANGSA = 'Antarabangsa'
}

export enum PencapaianType {
  JOHAN = 'Johan',
  NAIB_JOHAN = 'Naib Johan',
  KETIGA = 'Ketiga',
  KEEMPAT = 'Keempat',
  KELIMA = 'Kelima',
  ANUGERAH_KHAS = 'Anugerah Khas',
  LAIN_LAIN = 'Lain-lain',
  TIDAK_BERKENAAN = 'Tidak Berkenaan'
}

export enum KategoriJawatan {
  PENGETUA = 'Pengetua',
  PENOLONG_KANAN = 'Penolong Kanan',
  GKMP = 'GKMP',
  GURU = 'Guru',
  JURULATIH = 'Jurulatih'
}

export interface ReportData {
  bidang: BidangType;
  peringkat: PeringkatType;
  tajuk: string;
  lokasi: string;
  anjuran: string;
  isDateRange: boolean;
  tarikhMula: string;
  tarikhTamat: string;
  masaType: 'range' | 'sepanjang_hari' | 'sepanjang_program';
  masaMula: string;
  masaTamat: string;
  objektif: string;
  impak: string;
  penglibatan: string;
  pencapaian: PencapaianType;
  pencapaianDetail: string;
  namaPenyedia: string;
  kategoriPenyedia: KategoriJawatan;
  subKategoriPenyedia: string;
  signature: string; // Base64
  images: string[]; // Base64 array
  tahun: string;
}
