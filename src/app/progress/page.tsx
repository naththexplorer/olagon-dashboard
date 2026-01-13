'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useProgress } from '@/hooks/useProgress';
import ProjectProgressDetail from '@/components/progress/ProjectProgressDetail';
import { User, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

const ANGGOTA = ['Firdaus', 'Faza', 'Rafah', 'Haikal'];

export default function ProgressPage() {
  const { projects, loading: loadingProjects } = useProjects();
  const { progressList } = useProgress();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-green-100 text-green-700 border-green-200';
      case 'Sedang Berjalan': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case 'Tinggi': return 'text-red-600';
      case 'Sedang': return 'text-orange-600';
      default: return 'text-slate-600';
    }
  };

  // ✅ LEVEL 3: Detail project dengan progress (CEK DULU!)
  if (selectedProjectId && selectedPerson) {
    const project = projects.find(p => p.id === selectedProjectId);
    
    if (!project) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600">Project tidak ditemukan</p>
          <button
            onClick={() => setSelectedProjectId(null)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Kembali
          </button>
        </div>
      );
    }

    return (
      <ProjectProgressDetail
        project={project}
        createdBy={selectedPerson}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  // ✅ LEVEL 1: Pilih anggota
  if (!selectedPerson) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Progress</h1>
          <p className="text-slate-600 mt-1">Pilih anggota untuk melihat progress</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ANGGOTA.map((nama) => {
            const userProjects = projects.filter(p => {
              const pj = p.penanggungJawab as any;
              return Array.isArray(pj) ? pj.includes(nama) : pj === nama;
            });

            return (
              <div
                key={nama}
                onClick={() => setSelectedPerson(nama)}
                className="bg-white p-8 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <User size={32} className="text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{nama}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {userProjects.length} project
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ✅ LEVEL 2: Tampil list project
  const userProjects = projects.filter(p => {
    const pj = p.penanggungJawab as any;
    return Array.isArray(pj) ? pj.includes(selectedPerson) : pj === selectedPerson;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedPerson(null)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Kembali
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project {selectedPerson}</h1>
          <p className="text-slate-600 mt-1">Pilih project untuk melihat progress</p>
        </div>
      </div>

      {userProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600">Belum ada project untuk {selectedPerson}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {userProjects.map((project) => {
            const projectProgress = progressList.filter(p => p.projectId === project.id);

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="bg-white p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{project.nama}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{project.deskripsi}</p>
                  </div>
                  <ChevronRight size={24} className="text-slate-400 flex-shrink-0 ml-4" />
                </div>

                <div className="flex items-center gap-4 flex-wrap mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(project.prioritas)}`}>
                    Prioritas: {project.prioritas}
                  </span>
                  {project.deadline && (
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(project.deadline).toLocaleDateString('id-ID')}
                    </span>
                  )}
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <TrendingUp size={16} />
                    {projectProgress.length} progress
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
