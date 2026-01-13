'use client';

import { useState } from 'react';
import { useRiwayat, usePenarikan } from '@/hooks/useRiwayat';
import { formatRupiah } from '@/lib/utils';
import { History, DollarSign, Plus, Edit, Trash2, ArrowDown } from 'lucide-react';

export default function RiwayatPage() {
  const { logs, loading: loadingLogs, error: errorLogs } = useRiwayat();
  const { penarikanList, loading: loadingPenarikan, error: errorPenarikan } = usePenarikan();
  const [activeTab, setActiveTab] = useState<'logs' | 'penarikan'>('logs');

  if (loadingLogs || loadingPenarikan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (errorLogs || errorPenarikan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {errorLogs || errorPenarikan}</p>
      </div>
    );
  }

  const getAksiIcon = (aksi: string) => {
    switch (aksi) {
      case 'Tambah': return <Plus size={18} className="text-green-600" />;
      case 'Edit': return <Edit size={18} className="text-blue-600" />;
      case 'Hapus': return <Trash2 size={18} className="text-red-600" />;
      case 'Tarik': return <ArrowDown size={18} className="text-orange-600" />;
      default: return <History size={18} className="text-slate-600" />;
    }
  };

  const getAksiColor = (aksi: string) => {
    switch (aksi) {
      case 'Tambah': return 'bg-green-50 border-green-200';
      case 'Edit': return 'bg-blue-50 border-blue-200';
      case 'Hapus': return 'bg-red-50 border-red-200';
      case 'Tarik': return 'bg-orange-50 border-orange-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat</h1>
        <p className="text-slate-600 mt-1">Log aktivitas dan riwayat penarikan saldo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'logs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <History size={18} />
            Log Aktivitas ({logs.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('penarikan')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'penarikan'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign size={18} />
            Penarikan Saldo ({penarikanList.length})
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'logs' ? (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-600">Belum ada log aktivitas</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`bg-white p-4 rounded-lg border ${getAksiColor(log.aksi)} flex items-start gap-3`}
              >
                <div className="mt-1">{getAksiIcon(log.aksi)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-slate-900">{log.ringkasan}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {log.objek} • {log.aksi}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.waktu).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {penarikanList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-600">Belum ada riwayat penarikan</p>
            </div>
          ) : (
            penarikanList.map((penarikan) => (
              <div
                key={penarikan.id}
                className="bg-white p-4 rounded-lg border border-slate-200 flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <ArrowDown size={24} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{penarikan.nama}</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {formatRupiah(penarikan.nominal)}
                      </p>
                      {penarikan.catatan && (
                        <p className="text-sm text-slate-600 mt-2">{penarikan.catatan}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(penarikan.createdAt).toLocaleString('id-ID', {
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
