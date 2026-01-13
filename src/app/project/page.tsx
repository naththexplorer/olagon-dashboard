'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectForm from '@/components/project/ProjectForm';
import ProjectDetailModal from '@/components/project/ProjectDetailModal';
import type { Project } from '@/types/project';
import { ChevronRight, User } from 'lucide-react';

const ANGGOTA = ['Firdaus', 'Faza', 'Rafah', 'Haikal'];

export default function ProjectPage() {
  const { projects, loading, error } = useProjects();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Jika belum pilih orang
  if (!selectedPerson) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project</h1>
          <p className="text-slate-600 mt-1">Pilih anggota untuk melihat project</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ANGGOTA.map((nama) => {
            const projectCount = projects.filter(p =>
              p.penanggungJawab.includes(nama as any)
            ).length;

            return (
              <div
                key={nama}
                onClick={() => setSelectedPerson(nama)}
                className="bg-white p-8 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <User size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{nama}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {projectCount} project
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Filter project berdasarkan penanggung jawab
  const filteredProjects = projects.filter(p =>
    p.penanggungJawab.includes(selectedPerson as any)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedPerson(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Kembali
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Project {selectedPerson}
            </h1>
            <p className="text-slate-600 mt-1">
              {filteredProjects.length} project aktif
            </p>
          </div>
        </div>
        <ProjectForm penanggungJawabDefault={selectedPerson} />
      </div>

      {/* List Project */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600">
            Belum ada project untuk {selectedPerson}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white p-8 rounded-lg border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                    {project.nama}
                  </h3>

                  {project.deskripsi && (
                    <p className="text-slate-600 leading-relaxed">
                      {project.deskripsi}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-4 py-2 rounded-full font-medium ${
                        project.status === 'Selesai'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'Sedang dikerjakan'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.status}
                    </span>

                    <span
                      className={`px-4 py-2 rounded-full font-medium ${
                        project.prioritas === 'Tinggi'
                          ? 'bg-red-100 text-red-700'
                          : project.prioritas === 'Sedang'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.prioritas}
                    </span>

                    <span className="text-slate-600">
                      Effort: {project.effortLevel}/5
                    </span>
                  </div>
                </div>

                {project.deadline && (
                  <div className="text-right shrink-0 bg-slate-50 p-4 rounded-lg">
                    <div className="font-medium text-slate-900">Deadline</div>
                    <div className="mt-2 text-slate-600">
                      {new Date(project.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
