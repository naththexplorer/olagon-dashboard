export type AksiLog = 'Tambah' | 'Edit' | 'Hapus' | 'Tarik';

export type ObjekLog = 
  | 'Project' 
  | 'Transaksi' 
  | 'Progress' 
  | 'Saldo' 
  | 'Saldo Personal';

export interface Log {
  id: string;
  waktu: Date;
  aksi: AksiLog;
  objek: ObjekLog;
  objekId: string;
  ringkasan: string;
}
