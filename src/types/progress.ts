export interface Progress {
  id: string;
  projectId: string;
  projectName: string;
  judul: string;
  isi: string;
  kategori: 'Update' | 'Catatan' | 'Kendala';
  createdBy: string;
  imageUrl?: string;  // ✅ Tambah field gambar
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressInput {
  projectId: string;
  projectName: string;
  judul: string;
  isi: string;
  kategori: 'Update' | 'Catatan' | 'Kendala';
  createdBy: string;
  imageUrl?: string;  // ✅ Tambah field gambar
}
