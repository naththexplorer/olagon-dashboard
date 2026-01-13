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
import { tarikSaldo } from '@/lib/firestore';
import { ArrowDownCircle } from 'lucide-react';

interface TarikSaldoFormProps {
  currentSaldo: number;
  selectedPerson: string;
}

export default function TarikSaldoForm({ currentSaldo, selectedPerson }: TarikSaldoFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jumlah, setJumlah] = useState<number>(0);

  const sisaSaldo = currentSaldo - jumlah;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (jumlah <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }

    if (jumlah > currentSaldo) {
      alert(`Saldo ${selectedPerson} tidak mencukupi!`);
      return;
    }

    setLoading(true);

    try {
      await tarikSaldo(selectedPerson, jumlah);
      setOpen(false);
      setJumlah(0);
      alert(`✅ Berhasil tarik Rp ${jumlah.toLocaleString('id-ID')}`);
    } catch (error: any) {
      console.error('Error tarik saldo:', error);
      alert(error.message || 'Gagal menarik saldo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowDownCircle size={20} />
          Tarik Saldo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tarik Saldo - {selectedPerson}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💰 Saldo tersedia: <strong>Rp {currentSaldo.toLocaleString('id-ID')}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="jumlah">Jumlah Tarik *</Label>
            <Input
              id="jumlah"
              type="number"
              value={jumlah || ''}
              onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
              placeholder="Contoh: 500000"
              required
            />
          </div>

          {jumlah > 0 && (
            <div className={`border rounded-lg p-4 ${sisaSaldo < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className="text-sm font-semibold mb-2">Preview Penarikan:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Saldo Sekarang:</span>
                  <span className="font-mono">Rp {currentSaldo.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Jumlah Tarik:</span>
                  <span className="font-mono">- Rp {jumlah.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Sisa Saldo:</span>
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
                ⚠️ <strong>Saldo tidak mencukupi!</strong> Kurangi jumlah penarikan.
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
            <Button type="submit" disabled={loading || sisaSaldo < 0 || jumlah <= 0}>
              {loading ? 'Memproses...' : 'Tarik Saldo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
