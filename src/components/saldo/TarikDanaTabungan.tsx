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
import { tarikDanaTabungan } from '@/lib/firestore';
import { ArrowDownCircle } from 'lucide-react';

interface TarikDanaTabunganProps {
  currentTotal: number;
  isDaruratTerpenuhi: boolean;
}

export default function TarikDanaTabungan({ currentTotal, isDaruratTerpenuhi }: TarikDanaTabunganProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jumlah, setJumlah] = useState<number>(0);
  const [keterangan, setKeterangan] = useState<string>('');

  const sisaSaldo = currentTotal - jumlah;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (jumlah <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }

    if (jumlah > currentTotal) {
      alert('Dana Tabungan tidak mencukupi');
      return;
    }

    setLoading(true);

    try {
      await tarikDanaTabungan(jumlah, keterangan);
      setOpen(false);
      setJumlah(0);
      setKeterangan('');
      alert(`Berhasil tarik Dana Tabungan Rp ${jumlah.toLocaleString('id-ID')}`);
      window.location.reload();
    } catch (error: any) {
      console.error('Error tarik dana tabungan:', error);
      alert(error.message || 'Gagal menarik dana tabungan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${isDaruratTerpenuhi ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : 'border-slate-300 text-slate-400 cursor-not-allowed'}`}
          disabled={!isDaruratTerpenuhi}
        >
          <ArrowDownCircle size={16} />
          Tarik Dana
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tarik Dana Tabungan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Dana tersedia: <strong>Rp {currentTotal.toLocaleString('id-ID')}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="jumlah">Jumlah Tarik</Label>
            <Input
              id="jumlah"
              type="number"
              value={jumlah || ''}
              onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
              placeholder="Contoh: 500000"
              required
            />
          </div>

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Untuk keperluan apa..."
              rows={3}
              required
            />
          </div>

          {jumlah > 0 && (
            <div className={`border rounded-lg p-4 ${sisaSaldo < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className="text-sm font-semibold mb-2">Preview Penarikan:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Dana Sekarang:</span>
                  <span className="font-mono">Rp {currentTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Jumlah Tarik:</span>
                  <span className="font-mono">- Rp {jumlah.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Sisa Dana:</span>
                  <span className={`font-mono ${sisaSaldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rp {sisaSaldo.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {sisaSaldo < 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Dana tidak mencukupi.</strong> Kurangi jumlah penarikan.
              </p>
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
            <Button 
              type="submit" 
              disabled={loading || sisaSaldo < 0 || jumlah <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Memproses...' : 'Tarik Dana Tabungan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
