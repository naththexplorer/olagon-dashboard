export type AksiLog = 'Tambah' | 'Edit' | 'Hapus' | 'Tarik';

export type ObjekLog = 
  | 'Project' 
  | 'Progress' 
  | 'Transaksi' 
  | 'Saldo' 
  | 'Saldo Personal'
  | 'Pemasukan'      // ✅ TAMBAH INI
  | 'Operasional'    // ✅ TAMBAH INI
  | 'Settings';      // ✅ TAMBAH INI

export interface Log {
  id: string;
  waktu: Date;
  aksi: AksiLog;
  objek: ObjekLog;
  objekId: string;
  ringkasan: string;
}
