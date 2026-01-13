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
import { updateProgress, deleteProgress } from '@/lib/firestore';
import type { Progress } from '@/types/progress';
import { Trash2 } from 'lucide-react';

interface ProgressDetailModalProps {
  progress: Progress;
  open: boolean;
  onClose: () => void;
}

export default function ProgressDetailModal({ progress, open, onClose }: ProgressDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(progress);

  useEffect(() => {
    setFormData(progress);
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProgress(progress.id, {
        judul: formData.judul,
        isi: formData.isi,
        kategori: formData.kategori,
        projectId: formData.projectId,
        projectName: formData.projectName,
        createdBy: formData.createdBy,
      });
      onClose();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Gagal mengubah progress');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus progress "${progress.judul}"?`)) return;

    setLoading(true);
    try {
      await deleteProgress(progress.id);
      onClose();
    } catch (error) {
      console.error('Error deleting progress:', error);
      alert('Gagal menghapus progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📁 Project: <strong>{progress.projectName}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="kategori">Kategori</Label>
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
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="isi">Isi / Detail</Label>
            <Textarea
              id="isi"
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              rows={5}
              required
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
            <p>Dibuat oleh: <strong>{progress.createdBy}</strong></p>
            <p className="mt-1">
              {new Date(progress.createdAt).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="flex justify-between pt-4">
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
