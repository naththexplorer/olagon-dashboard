export type ProjectStatus = 'Belum Mulai' | 'Sedang Berjalan' | 'Selesai';
export type ProjectPriority = 'Rendah' | 'Sedang' | 'Tinggi';

export interface Project {
  id: string;
  nama: string;
  deskripsi: string;
  penanggungJawab: string | string[];
  status: ProjectStatus;
  deadline?: Date;
  prioritas: ProjectPriority;
  effortLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectInput {
  nama: string;
  deskripsi: string;
  penanggungJawab: string | string[];
  status: ProjectStatus;
  deadline?: Date;
  prioritas: ProjectPriority;
  effortLevel?: number;
}
