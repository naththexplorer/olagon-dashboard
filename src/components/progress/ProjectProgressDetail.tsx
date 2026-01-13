'use client';

import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
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
import { createProgress, uploadProgressImage } from '@/lib/firestore';
import type { Project } from '@/types/project';
import type { ProgressInput } from '@/types/progress';
import { Plus, Calendar, Target, TrendingUp, MessageSquare, AlertCircle, Image as ImageIcon, X } from 'lucide-react';

interface ProjectProgressDetailProps {
  project: Project;
  createdBy: string;
  onBack: () => void;
}

export default function ProjectProgressDetail({ project, createdBy, onBack }: ProjectProgressDetailProps) {
  const { progressList } = useProgress();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProgressInput>({
    projectId: project.id,
    projectName: project.nama,
    judul: '',
    isi: '',
    kategori: 'Update',
    createdBy: createdBy,
  });

  const projectProgress = progressList.filter(p => p.projectId === project.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buat progress dulu untuk dapat ID
      const progressId = await createProgress(formData);

      // Upload gambar jika ada
      if (selectedFile) {
        const imageUrl = await uploadProgressImage(selectedFile, progressId);
        // Update progress dengan imageUrl
        await fetch('/api/updateProgressImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progressId, imageUrl }),
        });
      }

      setOpen(false);
      setFormData({
        projectId: project.id,
        projectName: project.nama,
        judul: '',
        isi: '',
        kategori: 'Update',
        createdBy: createdBy,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      alert('✅ Progress berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating progress:', error);
      alert(error.message || 'Gagal menambah progress');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (kategori: string) => {
    switch (kategori) {
      case 'Update': return <TrendingUp size={20} />;
      case 'Catatan': return <MessageSquare size={20} />;
      case 'Kendala': return <AlertCircle size={20} />;
      default: return <MessageSquare size={20} />;
    }
  };

  const getColor = (kategori: string) => {
    switch (kategori) {
      case 'Update': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Catatan': return 'bg-green-100 text-green-700 border-green-200';
      case 'Kendala': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-green-100 text-green-700 border-green-200';
      case 'Sedang Berjalan': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Kembali
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.nama}</h1>
            <p className="text-slate-600 mt-1">{project.deskripsi}</p>
          </div>
        </div>

        {/* Form Tambah Progress */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={20} />
              Tambah Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Progress - {project.nama}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <Label htmlFor="image">Upload Gambar (Opsional, Max 5MB)</Label>
                <div className="mt-2">
                  {!previewUrl ? (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Klik untuk upload gambar</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG (Max 5MB)</p>
                      </div>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Progress'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

{/* Info Project */}
<div className="bg-white p-6 rounded-lg border-2 border-slate-200">
  <div className="flex items-center gap-4 flex-wrap">
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
      {project.status}
    </span>
    <span className="text-sm text-slate-600 flex items-center gap-1">
      <Target size={16} />
      Prioritas: {project.prioritas}
    </span>
    {project.deadline && (
      <span className="text-sm text-slate-600 flex items-center gap-1">
        <Calendar size={16} />
        Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}
      </span>
    )}
    {project.effortLevel && (
      <span className="text-sm text-slate-600">
        Effort: {project.effortLevel} jam
      </span>
    )}
  </div>
  
  {/* Tampil semua penanggung jawab */}
  <div className="mt-4 pt-4 border-t border-slate-200">
    <p className="text-sm text-slate-600 mb-2">Tim Project:</p>
    <div className="flex flex-wrap gap-2">
      {project.penanggungJawab.map((nama) => (
        <span
          key={nama}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
        >
          {nama}
        </span>
      ))}
    </div>
  </div>
</div>

      {/* List Progress */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Progress ({projectProgress.length})
        </h2>

        {projectProgress.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600">Belum ada progress untuk project ini</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projectProgress.map((progress) => (
              <div
                key={progress.id}
                className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getColor(progress.kategori)}`}>
                    {getIcon(progress.kategori)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {progress.judul}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColor(progress.kategori)}`}>
                        {progress.kategori}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {progress.isi}
                    </p>
                    {progress.imageUrl && (
                      <img
                        src={progress.imageUrl}
                        alt={progress.judul}
                        className="mt-3 w-full max-w-md rounded-lg border border-slate-200"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500 pt-2">
                      <span>Oleh: <strong>{progress.createdBy}</strong></span>
                      <span>•</span>
                      <span>
                        {new Date(progress.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
