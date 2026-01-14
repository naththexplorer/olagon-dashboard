'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormPemasukan from '@/components/saldo/FormPemasukan';
import TarikDanaDarurat from '@/components/saldo/TarikDanaDarurat';
import TarikDanaTabungan from '@/components/saldo/TarikDanaTabungan';
import FormOperasional from '@/components/saldo/FormOperasional';
import TarikSaldoForm from '@/components/saldo/TarikSaldoForm';
import { 
  useSaldoPersonal, 
  useDanaDarurat, 
  useDanaTabungan,
  usePemasukan,
  useOperasional 
} from '@/hooks/useSaldo';
import { deletePemasukanById, deleteOperasionalById } from '@/lib/firestore';
import { Wallet, AlertCircle, PiggyBank, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

export default function SaldoPage() {
  const { saldoPersonal, loading: loadingPersonal } = useSaldoPersonal();
  const { danaDarurat, loading: loadingDarurat } = useDanaDarurat();
  const { danaTabungan, loading: loadingTabungan } = useDanaTabungan();
  const { pemasukan, loading: loadingPemasukan } = usePemasukan();
  const { operasional, loading: loadingOperasional } = useOperasional();

  const [activeTab, setActiveTab] = useState<'personal' | 'pemasukan' | 'operasional' | 'riwayat'>('personal');

  const isDaruratTerpenuhi = danaDarurat.total >= danaDarurat.target;
  const persentaseDarurat = Math.min((danaDarurat.total / danaDarurat.target) * 100, 100);

  const handleDeletePemasukan = async (id: string) => {
    if (confirm('Yakin hapus pemasukan ini?')) {
      try {
        await deletePemasukanById(id);
        alert('Pemasukan berhasil dihapus');
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus');
      }
    }
  };

  const handleDeleteOperasional = async (id: string) => {
    if (confirm('Yakin hapus operasional ini?')) {
      try {
        await deleteOperasionalById(id);
        alert('Operasional berhasil dihapus');
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus');
      }
    }
  };

  if (loadingPersonal || loadingDarurat || loadingTabungan) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-600">Memuat data saldo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Saldo</h1>
            <p className="text-slate-600 mt-1">Kelola pemasukan, operasional, dan distribusi saldo</p>
          </div>
          <div className="flex gap-3">
            <FormOperasional />
            <FormPemasukan />
          </div>
        </div>

        {/* Alert: Operasional Harus Diinput Dulu */}
        {operasional.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium">
              Input operasional bulan ini terlebih dahulu sebelum menambah pemasukan
            </p>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/* Dana Darurat */}
<Card className="border-orange-200 bg-orange-50">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
        <AlertCircle size={18} />
        Dana Darurat
      </CardTitle>
      <TarikDanaDarurat currentTotal={danaDarurat.total} />
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold text-orange-900">
      Rp {danaDarurat.total.toLocaleString('id-ID')}
    </p>
    <div className="mt-3">
      <div className="flex justify-between text-xs text-orange-700 mb-1">
        <span>Target: Rp {danaDarurat.target.toLocaleString('id-ID')}</span>
        <span>{persentaseDarurat.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-orange-600 transition-all"
          style={{ width: `${persentaseDarurat}%` }}
        />
      </div>
    </div>
    {isDaruratTerpenuhi && (
      <p className="text-xs text-orange-700 mt-2 font-medium">
        Target terpenuhi
      </p>
    )}
  </CardContent>
</Card>


{/* Dana Tabungan */}
<Card className={`border-blue-200 ${isDaruratTerpenuhi ? 'bg-blue-50' : 'bg-slate-100'}`}>
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className={`text-sm font-medium flex items-center gap-2 ${isDaruratTerpenuhi ? 'text-blue-800' : 'text-slate-500'}`}>
        <PiggyBank size={18} />
        Dana Tabungan
      </CardTitle>
      <TarikDanaTabungan 
        currentTotal={danaTabungan.total} 
        isDaruratTerpenuhi={isDaruratTerpenuhi}
      />
    </div>
  </CardHeader>
  <CardContent>
    <p className={`text-2xl font-bold ${isDaruratTerpenuhi ? 'text-blue-900' : 'text-slate-600'}`}>
      Rp {danaTabungan.total.toLocaleString('id-ID')}
    </p>
    {!isDaruratTerpenuhi && (
      <p className="text-xs text-slate-600 mt-2">
        Akses terbuka setelah Dana Darurat terpenuhi
      </p>
    )}
  </CardContent>
</Card>


          {/* Total Pemasukan & Operasional */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-800">
                Ringkasan Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <TrendingUp size={16} className="text-green-600" />
                  Pemasukan
                </span>
                <span className="text-sm font-semibold text-green-700">
                  Rp {pemasukan.reduce((sum, p) => sum + p.jumlah, 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <TrendingDown size={16} className="text-red-600" />
                  Operasional
                </span>
                <span className="text-sm font-semibold text-red-700">
                  Rp {operasional.reduce((sum, o) => sum + o.jumlah, 0).toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Tabs */}
        <div className="space-y-4">
          <div className="border-b border-slate-200">
            <div className="flex gap-1">
              {(['personal', 'pemasukan', 'operasional', 'riwayat'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'personal' ? 'Saldo Personal' : 
                   tab === 'pemasukan' ? 'Pemasukan' :
                   tab === 'operasional' ? 'Operasional' : 'Riwayat Dana'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content: Saldo Personal */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {saldoPersonal.map((person) => (
                <Card key={person.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wallet size={20} className="text-slate-600" />
                        {person.nama}
                      </CardTitle>
                      <TarikSaldoForm 
                        currentSaldo={person.saldo} 
                        selectedPerson={person.nama} 
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-slate-900">
                      Rp {person.saldo.toLocaleString('id-ID')}
                    </p>
                    {person.riwayat.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-slate-700">Riwayat Terakhir:</p>
                        {person.riwayat.slice(0, 3).map((r) => (
                          <div key={r.id} className="flex justify-between text-xs text-slate-600 border-b border-slate-100 pb-1">
                            <span>{r.tipe === 'gaji' ? 'Gaji' : 'Penarikan'}</span>
                            <span className={r.tipe === 'gaji' ? 'text-green-600' : 'text-red-600'}>
                              {r.tipe === 'gaji' ? '+' : '-'} Rp {r.jumlah.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab Content: Pemasukan */}
          {activeTab === 'pemasukan' && (
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pemasukan</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPemasukan ? (
                  <p className="text-slate-600">Memuat...</p>
                ) : pemasukan.length === 0 ? (
                  <p className="text-slate-600">Belum ada pemasukan</p>
                ) : (
                  <div className="space-y-2">
                    {pemasukan.map((p) => (
                      <div key={p.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {p.sumber === 'Project' ? p.projectName : p.dariLainnya}
                          </p>
                          <p className="text-xs text-slate-600">
                            {p.tanggal.toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-green-700">
                            Rp {p.jumlah.toLocaleString('id-ID')}
                          </p>
                          <button
                            onClick={() => handleDeletePemasukan(p.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab Content: Operasional */}
          {activeTab === 'operasional' && (
            <Card>
              <CardHeader>
                <CardTitle>Daftar Operasional</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOperasional ? (
                  <p className="text-slate-600">Memuat...</p>
                ) : operasional.length === 0 ? (
                  <p className="text-slate-600">Belum ada operasional</p>
                ) : (
                  <div className="space-y-2">
                    {operasional.map((o) => (
                      <div key={o.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{o.jenisPengeluaran}</p>
                          <p className="text-xs text-slate-600">
                            {o.tanggal.toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-red-700">
                            Rp {o.jumlah.toLocaleString('id-ID')}
                          </p>
                          <button
                            onClick={() => handleDeleteOperasional(o.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab Content: Riwayat Dana */}
          {activeTab === 'riwayat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Riwayat Dana Darurat</CardTitle>
                </CardHeader>
                <CardContent>
                  {danaDarurat.riwayat.length === 0 ? (
                    <p className="text-slate-600 text-sm">Belum ada riwayat</p>
                  ) : (
                    <div className="space-y-2">
                      {danaDarurat.riwayat.slice(0, 10).map((r) => (
                        <div key={r.id} className="flex justify-between text-sm border-b border-slate-100 pb-1">
                          <div>
                            <p className="text-slate-700 font-medium">{r.tipe === 'tambah' ? 'Tambah' : 'Tarik'}</p>
                            <p className="text-xs text-slate-500">{r.keterangan}</p>
                          </div>
                          <span className={r.tipe === 'tambah' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {r.tipe === 'tambah' ? '+' : '-'} Rp {r.jumlah.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Riwayat Dana Tabungan</CardTitle>
                </CardHeader>
                <CardContent>
                  {danaTabungan.riwayat.length === 0 ? (
                    <p className="text-slate-600 text-sm">Belum ada riwayat</p>
                  ) : (
                    <div className="space-y-2">
                      {danaTabungan.riwayat.slice(0, 10).map((r) => (
                        <div key={r.id} className="flex justify-between text-sm border-b border-slate-100 pb-1">
                          <div>
                            <p className="text-slate-700 font-medium">{r.tipe === 'tambah' ? 'Tambah' : 'Tarik'}</p>
                            <p className="text-xs text-slate-500">{r.keterangan}</p>
                          </div>
                          <span className={r.tipe === 'tambah' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {r.tipe === 'tambah' ? '+' : '-'} Rp {r.jumlah.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
