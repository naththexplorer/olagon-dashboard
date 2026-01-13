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
import { createProgress } from '@/lib/firestore';
import { useProjects } from '@/hooks/useProjects';
import type { ProgressInput } from '@/types/progress';
import { Plus } from 'lucide-react';

interface ProgressFormProps {
  createdBy: string;
}

export default function ProgressForm({ createdBy }: ProgressFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { projects } = useProjects();
  
  // Filter project yang di-assign ke orang ini (AMAN untuk array atau string)
  const userProjects = projects.filter(p => {
    const pj = p.penanggungJawab as any;
    if (Array.isArray(pj)) {
      return pj.includes(createdBy);
    }
    return pj === createdBy;
  });

  const [formData, setFormData] = useState<ProgressInput>({
    projectId: '',
    projectName: '',
    judul: '',
    isi: '',
    kategori: 'Update',
    createdBy: createdBy,
  });

  const handleProjectChange = (projectId: string) => {
    const selectedProject = userProjects.find(p => p.id === projectId);
    setFormData({
      ...formData,
      projectId: projectId,
      projectName: selectedProject?.nama || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      alert('Pilih project terlebih dahulu!');
      return;
    }

    setLoading(true);

    try {
      await createProgress({
        ...formData,
        createdBy: createdBy,
      });
      setOpen(false);
      setFormData({
        projectId: '',
        projectName: '',
        judul: '',
        isi: '',
        kategori: 'Update',
        createdBy: createdBy,
      });
    } catch (error) {
      console.error('Error creating progress:', error);
      alert('Gagal menambah progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={20} />
          Tambah Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Progress - {createdBy}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project">Pilih Project *</Label>
            {userProjects.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Belum ada project untuk {createdBy}
              </div>
            ) : (
              <Select value={formData.projectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih project..." />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="kategori">Kategori *</Label>
            <Select
              value={formData.kategori}
              onValueChange={(value: any) => setFormData({ ...formData, kategori: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Update">Update</SelectItem>
                <SelectItem value="Catatan">Catatan</SelectItem>
                <SelectItem value="Kendala">Kendala</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="judul">Judul *</Label>
            <Input
              id="judul"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Contoh: Meeting dengan klien"
              required
            />
          </div>

          <div>
            <Label htmlFor="isi">Isi / Detail *</Label>
            <Textarea
              id="isi"
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              placeholder="Jelaskan detail progress..."
              rows={5}
              required
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
            <Button type="submit" disabled={loading || userProjects.length === 0}>
              {loading ? 'Menyimpan...' : 'Simpan Progress'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
