import { PIC } from './project';

export type KategoriSaldo = 'Operasional' | 'Cadangan' | 'Liburan' | 'Gaji Eksekutif';

export interface Transaksi {
  id: string;
  jasaId: string;
  jasaNama: string;
  nominal: number;
  catatan?: string;
  createdAt: Date;
  pembagian: {
    operasional: number;
    cadangan: number;
    liburan: number;
    gajiEksekutif: number;
  };
  gajiPerOrang: {
    firdaus: number;
    faza: number;
    rafah: number;
    haikal: number;
  };
}

export interface TransaksiInput {
  jasaId: string;
  jasaNama: string;
  nominal: number;
  catatan?: string;
}

export interface Saldo {
  kategori: KategoriSaldo;
  jumlah: number;
  updatedAt: Date;
}

export interface SaldoPersonal {
  nama: PIC;
  jumlah: number;
  updatedAt: Date;
}
