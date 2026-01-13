'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTransaksi } from '@/lib/firestore';
import { formatRupiah } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function InputPemasukanForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jasaNama, setJasaNama] = useState('');
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');

  const calculatePembagian = (amount: number) => {
    return {
      operasional: Math.floor(amount * 0.4),
      cadangan: Math.floor(amount * 0.1),
      liburan: Math.floor(amount * 0.1),
      gajiEksekutif: Math.floor(amount * 0.3),
    };
  };

  const calculateGajiPerOrang = (gajiEksekutif: number) => {
    const perOrang = Math.floor(gajiEksekutif / 4);
    return {
      firdaus: perOrang,
      faza: perOrang,
      rafah: perOrang,
      haikal: perOrang,
    };
  };

  const nominalNumber = Number(nominal.replace(/\D/g, '')) || 0;
  const pembagian = calculatePembagian(nominalNumber);
  const gajiPerOrang = calculateGajiPerOrang(pembagian.gajiEksekutif);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jasaNama || nominalNumber === 0) {
      alert('Masukkan nama jasa/project dan nominal!');
      return;
    }

    setLoading(true);

    try {
      await createTransaksi({
        jasaId: '',
        jasaNama: jasaNama,
        nominal: nominalNumber,
        catatan,
      });

      setOpen(false);
      setJasaNama('');
      setNominal('');
      setCatatan('');
    } catch (error) {
      console.error('Error creating transaksi:', error);
      alert('Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  const formatNominal = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          Input Pemasukan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Input Pemasukan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jasaNama">Nama Jasa / Project *</Label>
            <Input
              id="jasaNama"
              value={jasaNama}
              onChange={(e) => setJasaNama(e.target.value)}
              placeholder="Contoh: Jasa Pembuatan Website, Project X"
              required
            />
          </div>

          <div>
            <Label htmlFor="nominal">Nominal Pemasukan *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                Rp
              </span>
              <Input
                id="nominal"
                value={nominal}
                onChange={(e) => setNominal(formatNominal(e.target.value))}
                placeholder="0"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan transaksi (opsional)"
              rows={2}
            />
          </div>

          {nominalNumber > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Preview Pembagian Otomatis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Pemasukan:</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(nominalNumber)}</span>
                </div>
                <div className="border-t border-blue-200 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Operasional (40%):</span>
                  <span className="font-medium">{formatRupiah(pembagian.operasional)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cadangan (10%):</span>
                  <span className="font-medium">{formatRupiah(pembagian.cadangan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Liburan (10%):</span>
                  <span className="font-medium">{formatRupiah(pembagian.liburan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gaji Eksekutif (30%):</span>
                  <span className="font-medium">{formatRupiah(pembagian.gajiEksekutif)}</span>
                </div>
                <div className="border-t border-blue-200 my-2"></div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>• Firdaus:</span>
                    <span>{formatRupiah(gajiPerOrang.firdaus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Faza:</span>
                    <span>{formatRupiah(gajiPerOrang.faza)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Rafah:</span>
                    <span>{formatRupiah(gajiPerOrang.rafah)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Haikal:</span>
                    <span>{formatRupiah(gajiPerOrang.haikal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Pemasukan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
