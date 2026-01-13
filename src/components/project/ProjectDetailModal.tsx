'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { updateProject, deleteProject } from '@/lib/firestore';
import type { Project } from '@/types/project';
import { Trash2 } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, open, onClose }: ProjectDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(project);

  useEffect(() => {
    setFormData(project);
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProject(project.id, {
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        status: formData.status,
        deadline: formData.deadline,
        prioritas: formData.prioritas,
        effortLevel: formData.effortLevel,
        penanggungJawab: formData.penanggungJawab,
      });
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Gagal mengubah project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus project "${project.nama}"?`)) return;

    setLoading(true);
    try {
      await deleteProject(project.id);
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Gagal menghapus project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Project */}
          <div>
            <Label htmlFor="nama">Nama Project *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi || ''}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              rows={3}
            />
          </div>

          {/* Grid 3 kolom: Status, Prioritas, Effort */}
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

            <div>
              <Label htmlFor="effortLevel">Effort (1-5)</Label>
              <Select
                value={formData.effortLevel.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, effortLevel: parseInt(value) as 1 | 2 | 3 | 4 | 5 })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={
                formData.deadline
                  ? new Date(formData.deadline).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
            />
          </div>

          {/* Penanggung Jawab - READ ONLY */}
          <div>
            <Label>Penanggung Jawab</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              {formData.penanggungJawab.map((nama) => (
                <span
                  key={nama}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {nama}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Penanggung jawab tidak dapat diubah
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Hapus
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
