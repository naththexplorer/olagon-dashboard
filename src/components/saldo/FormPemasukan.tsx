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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPemasukanWithDistribution } from '@/lib/firestore';
import { useProjects } from '@/hooks/useProjects';
import type { PemasukanInput } from '@/types/saldo';
import { Plus, DollarSign } from 'lucide-react';

export default function FormPemasukan() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { projects } = useProjects();
  
  const [formData, setFormData] = useState<PemasukanInput>({
    jumlah: 0,
    sumber: 'Project',
    tanggal: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.jumlah <= 0) {
      alert('Jumlah pemasukan harus lebih dari 0');
      return;
    }

    if (formData.sumber === 'Project' && !formData.projectId) {
      alert('Pilih project terlebih dahulu');
      return;
    }

    if (formData.sumber === 'Lainnya' && !formData.dariLainnya) {
      alert('Isi sumber pemasukan lainnya');
      return;
    }

    setLoading(true);

    try {
      await createPemasukanWithDistribution(formData);
      setOpen(false);
      setFormData({
        jumlah: 0,
        sumber: 'Project',
        tanggal: new Date(),
      });
      alert('Pemasukan berhasil ditambahkan dan didistribusikan!');
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating pemasukan:', error);
      alert(error.message || 'Gagal menambah pemasukan');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(p => p.id === projectId);
    setFormData({
      ...formData,
      projectId,
      projectName: selectedProject?.nama || '',
      dariLainnya: undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus size={20} />
          Tambah Pemasukan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign size={24} className="text-green-600" />
            Tambah Pemasukan
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jumlah">Jumlah Pemasukan</Label>
            <Input
              id="jumlah"
              type="number"
              value={formData.jumlah || ''}
              onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
              placeholder="2000000"
              required
            />
            {formData.jumlah > 0 && (
              <p className="text-sm text-slate-600 mt-1">
                Rp {formData.jumlah.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="sumber">Sumber Pemasukan</Label>
            <Select
              value={formData.sumber}
              onValueChange={(value: any) => setFormData({ 
                ...formData, 
                sumber: value,
                projectId: undefined,
                projectName: undefined,
                dariLainnya: undefined,
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project">Dari Project</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.sumber === 'Project' && (
            <div>
              <Label htmlFor="project">Pilih Project</Label>
              {projects.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  Belum ada project tersedia
                </div>
              ) : (
                <Select value={formData.projectId} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {formData.sumber === 'Lainnya' && (
            <div>
              <Label htmlFor="dariLainnya">Sumber Lainnya</Label>
              <Input
                id="dariLainnya"
                value={formData.dariLainnya || ''}
                onChange={(e) => setFormData({ ...formData, dariLainnya: e.target.value })}
                placeholder="Contoh: Freelance, Donasi, dll"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              type="date"
              value={formData.tanggal.toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, tanggal: new Date(e.target.value) })}
            />
          </div>

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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Menyimpan...' : 'Simpan Pemasukan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
