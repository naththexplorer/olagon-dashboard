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
import { createOperasional } from '@/lib/firestore';
import type { OperasionalInput } from '@/types/saldo';
import { Plus, CreditCard } from 'lucide-react';

export default function FormOperasional() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<OperasionalInput>({
    jumlah: 0,
    jenisPengeluaran: '',
    tanggal: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.jumlah <= 0) {
      alert('Jumlah operasional harus lebih dari 0');
      return;
    }

    if (!formData.jenisPengeluaran.trim()) {
      alert('Isi jenis pengeluaran');
      return;
    }

    setLoading(true);

    try {
      await createOperasional(formData);
      setOpen(false);
      setFormData({
        jumlah: 0,
        jenisPengeluaran: '',
        tanggal: new Date(),
      });
      alert('✅ Operasional berhasil ditambahkan!');
      window.location.reload(); // Refresh data
    } catch (error: any) {
      console.error('Error creating operasional:', error);
      alert(error.message || 'Gagal menambah operasional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
          <Plus size={20} />
          Tambah Operasional
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={24} className="text-orange-600" />
            Tambah Operasional
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis Pengeluaran */}
          <div>
            <Label htmlFor="jenisPengeluaran">Jenis Pengeluaran *</Label>
            <Input
              id="jenisPengeluaran"
              value={formData.jenisPengeluaran}
              onChange={(e) => setFormData({ ...formData, jenisPengeluaran: e.target.value })}
              placeholder="Contoh: Wifi, Listrik, Sewa Kantor"
              required
            />
          </div>

          {/* Jumlah */}
          <div>
            <Label htmlFor="jumlah">Jumlah *</Label>
            <Input
              id="jumlah"
              type="number"
              value={formData.jumlah || ''}
              onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
              placeholder="200000"
              required
            />
            {formData.jumlah > 0 && (
              <p className="text-sm text-slate-600 mt-1">
                Rp {formData.jumlah.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              type="date"
              value={formData.tanggal.toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, tanggal: new Date(e.target.value) })}
            />
          </div>

          {/* Keterangan */}
          <div>
            <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan || ''}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? 'Menyimpan...' : 'Simpan Operasional'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
