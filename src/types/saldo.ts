// Type untuk kategori saldo
export type KategoriSaldo = 'Gaji Eksekutif' | 'Dana Darurat' | 'Dana Tabungan';

// Type untuk sumber pemasukan
export type SumberPemasukan = 'Project' | 'Lainnya';

// Type untuk nama eksekutif
export type NamaEksekutif = 'Firdaus' | 'Rafah' | 'Faza' | 'Haykal';

// Saldo per kategori (yang sudah ada, tetap)
export interface Saldo {
  id: string;
  kategori: KategoriSaldo;
  jumlah: number;
  createdAt: Date;
  updatedAt: Date;
}

// Saldo personal per anggota (UPDATE: tambah riwayat)
export interface SaldoPersonal {
  id: string;
  nama: NamaEksekutif;
  saldo: number;
  riwayat: RiwayatSaldo[];
  createdAt: Date;
  updatedAt: Date;
}

// Riwayat saldo personal (gaji + penarikan)
export interface RiwayatSaldo {
  id: string;
  tanggal: Date;
  jumlah: number;
  tipe: 'gaji' | 'penarikan';
  keterangan?: string;
}

// Pemasukan
export interface Pemasukan {
  id: string;
  jumlah: number;
  sumber: SumberPemasukan;
  projectId?: string;
  projectName?: string;
  dariLainnya?: string;
  keterangan?: string;
  tanggal: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PemasukanInput {
  jumlah: number;
  sumber: SumberPemasukan;
  projectId?: string;
  projectName?: string;
  dariLainnya?: string;
  keterangan?: string;
  tanggal: Date;
}

// Operasional
export interface Operasional {
  id: string;
  jumlah: number;
  jenisPengeluaran: string;
  keterangan?: string;
  tanggal: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperasionalInput {
  jumlah: number;
  jenisPengeluaran: string;
  keterangan?: string;
  tanggal: Date;
}

// Dana Darurat (UPDATE: tambah riwayat)
export interface DanaDarurat {
  total: number;
  target: number;
  riwayat: RiwayatDana[];
}

// Dana Tabungan (BARU)
export interface DanaTabungan {
  total: number;
  riwayat: RiwayatDana[];
}

// Riwayat dana (darurat & tabungan)
export interface RiwayatDana {
  id: string;
  tanggal: Date;
  jumlah: number;
  tipe: 'tambah' | 'tarik';
  keterangan?: string;
}

// Pembagian otomatis (BARU)
export interface PembagianOtomatis {
  sisaSetelahOperasional: number;
  gajiEksekutif: number;
  gajiPerOrang: number;
  danaDarurat: number;
  danaTabungan: number;
}

// Settings Dana Darurat
export interface SettingsDanaDarurat {
  id: string;
  targetDanaDarurat: number;
  updatedAt: Date;
}

// Riwayat Penarikan (DEPRECATED - diganti RiwayatSaldo)
export interface RiwayatPenarikan {
  id: string;
  nama: string;
  jumlah: number;
  tanggal: Date;
  createdAt: Date;
}
