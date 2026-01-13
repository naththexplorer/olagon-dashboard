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
import { createProject } from '@/lib/firestore';
import { ANGGOTA_EKSEKUTIF } from '@/lib/constants';
import type { ProjectInput, PIC } from '@/types/project';
import { Plus, X } from 'lucide-react';

interface ProjectFormProps {
  penanggungJawabDefault?: string;
}

export default function ProjectForm({ penanggungJawabDefault }: ProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectInput>({
    nama: '',
    deskripsi: '',
    penanggungJawab: penanggungJawabDefault ? [penanggungJawabDefault as PIC] : [],
    status: 'Belum mulai',
    prioritas: 'Sedang',
    deadline: undefined,
    effortLevel: 3,
  });

  const handleAddPenanggungJawab = (nama: string) => {
    if (!formData.penanggungJawab.includes(nama as PIC)) {
      setFormData({
        ...formData,
        penanggungJawab: [...formData.penanggungJawab, nama as PIC],
      });
    }
  };

  const handleRemovePenanggungJawab = (nama: string) => {
    setFormData({
      ...formData,
      penanggungJawab: formData.penanggungJawab.filter(p => p !== nama),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.penanggungJawab.length === 0) {
      alert('Pilih minimal 1 penanggung jawab!');
      return;
    }

    setLoading(true);

    try {
      await createProject(formData);
      setOpen(false);
      setFormData({
        nama: '',
        deskripsi: '',
        penanggungJawab: penanggungJawabDefault ? [penanggungJawabDefault as PIC] : [],
        status: 'Belum mulai',
        prioritas: 'Sedang',
        deadline: undefined,
        effortLevel: 3,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Gagal menambah project');
    } finally {
      setLoading(false);
    }
  };

  const availableOptions = ANGGOTA_EKSEKUTIF.filter(
    nama => !formData.penanggungJawab.includes(nama as PIC)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          Tambah Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Project Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <Label htmlFor="nama">Nama Project *</Label>
    <Input
      id="nama"
      value={formData.nama}
      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
      placeholder="Contoh: Website Company Profile"
      required
    />
  </div>

  <div>
    <Label htmlFor="deskripsi">Deskripsi</Label>
    <Textarea
      id="deskripsi"
      value={formData.deskripsi || ''}
      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
      placeholder="Jelaskan detail project..."
      rows={3}
    />
  </div>

  {/* Multi-Select Penanggung Jawab - FIX SPACING */}
  <div>
    <Label className="mb-4 block">Penanggung Jawab * (Bisa pilih banyak)</Label>
    
    {/* Tampil yang sudah dipilih */}
    {formData.penanggungJawab.length > 0 && (
      <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
        {formData.penanggungJawab.map((nama) => (
          <div
            key={nama}
            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-blue-300"
          >
            <span className="text-sm font-medium">{nama}</span>
            <button
              type="button"
              onClick={() => handleRemovePenanggungJawab(nama)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    )}

    {/* Dropdown pilih tambahan */}
    {availableOptions.length > 0 && (
      <Select onValueChange={handleAddPenanggungJawab}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih penanggung jawab..." />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((nama) => (
            <SelectItem key={nama} value={nama}>
              + {nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  </div>

  {/* Grid Status & Prioritas */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="status">Status</Label>
      <Select
        value={formData.status}
        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Belum mulai">Belum mulai</SelectItem>
          <SelectItem value="Sedang dikerjakan">Sedang dikerjakan</SelectItem>
          <SelectItem value="Selesai">Selesai</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label htmlFor="prioritas">Prioritas</Label>
      <Select
        value={formData.prioritas}
        onValueChange={(value: any) => setFormData({ ...formData, prioritas: value })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Rendah">Rendah</SelectItem>
          <SelectItem value="Sedang">Sedang</SelectItem>
          <SelectItem value="Tinggi">Tinggi</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Grid Deadline & Effort */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="deadline">Deadline</Label>
      <Input
        id="deadline"
        type="date"
        value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value ? new Date(e.target.value) : undefined })}
      />
    </div>

    <div>
      <Label htmlFor="effort">Effort Level *</Label>
      <Select
        value={formData.effortLevel.toString()}
        onValueChange={(value) => setFormData({ 
          ...formData, 
          effortLevel: parseInt(value) as 1 | 2 | 3 | 4 | 5
        })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 - Sangat Mudah</SelectItem>
          <SelectItem value="2">2 - Mudah</SelectItem>
          <SelectItem value="3">3 - Sedang</SelectItem>
          <SelectItem value="4">4 - Sulit</SelectItem>
          <SelectItem value="5">5 - Sangat Sulit</SelectItem>
        </SelectContent>
      </Select>
    </div>
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
    <Button type="submit" disabled={loading || formData.penanggungJawab.length === 0}>
      {loading ? 'Menyimpan...' : 'Tambah Project'}
    </Button>
  </div>
</form>

      </DialogContent>
    </Dialog>
  );
}
