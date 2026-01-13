'use client';

import { useState } from 'react';
import { useSaldo, useSaldoPersonal } from '@/hooks/useSaldo';
import { formatRupiah } from '@/lib/utils';
import TarikSaldoForm from '@/components/saldo/TarikSaldoForm';
import InputPemasukanForm from '@/components/saldo/InputPemasukanForm';  // ✅ FIX INI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ANGGOTA_EKSEKUTIF } from '@/lib/constants';


export default function SaldoPage() {
  const { saldoKategori, loading, error } = useSaldo();
  const [selectedPerson, setSelectedPerson] = useState<string>('Firdaus');
  const { saldo: saldoPersonal, loading: loadingPersonal } = useSaldoPersonal(selectedPerson);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Memuat data saldo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Saldo</h1>
          <p className="text-slate-600 mt-1">Kelola keuangan tim</p>
        </div>
        <InputPemasukanForm />
      </div>

      {/* Saldo Kategori */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Saldo per Kategori</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {saldoKategori.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-600">Belum ada data saldo</p>
            </div>
          ) : (
            saldoKategori.map((saldo) => (
              <div
                key={saldo.id}
                className="bg-white p-6 rounded-lg border-2 border-slate-200 hover:shadow-lg transition-all"
              >
                <p className="text-sm font-medium text-slate-600 mb-2">{saldo.kategori}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatRupiah(saldo.jumlah)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saldo Personal */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Saldo Personal</h2>

        <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
          {/* Dropdown Pilih Anggota */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Pilih Anggota:</label>
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANGGOTA_EKSEKUTIF.map((nama) => (
                    <SelectItem key={nama} value={nama}>
                      {nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tombol Tarik Saldo */}
            {!loadingPersonal && saldoPersonal && (
              <TarikSaldoForm 
                currentSaldo={saldoPersonal.jumlah || 0} 
                selectedPerson={selectedPerson}
              />
            )}
          </div>

          {/* Tampilan Saldo */}
          {loadingPersonal ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-600">Memuat...</p>
              </div>
            </div>
          ) : saldoPersonal ? (
            <div>
              <p className="text-sm text-slate-600 mb-2">Saldo Tersedia:</p>
              <p className="text-4xl font-bold text-slate-900 mb-3">
                {formatRupiah(saldoPersonal.jumlah)}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                Saldo untuk <strong>{saldoPersonal.nama}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Data tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Pembagian */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-xl">!</span>
          Informasi Pembagian Saldo
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Operasional (40%)</strong> - Biaya operasional tim</p>
          <p>• <strong>Cadangan (10%)</strong> - Dana darurat dan cadangan</p>
          <p>• <strong>Liburan (10%)</strong> - Dana untuk mabok (wajib)</p>
          <p>• <strong>Gaji Eksekutif (30%)</strong> - Dibagi rata ke 4 anggota (7.5% per orang)</p>
        </div>
      </div>
    </div>
  );
}
