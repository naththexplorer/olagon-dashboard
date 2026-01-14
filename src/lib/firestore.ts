import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import type { Project, ProjectInput } from '../types/project';
import type { Log, AksiLog, ObjekLog } from '../types/log';
import type { Progress, ProgressInput } from '../types/progress';
import type { 
  Pemasukan,
  PemasukanInput,
  Operasional,
  OperasionalInput,
  SaldoPersonal,
  RiwayatPenarikan,
  NamaEksekutif,
  PembagianOtomatis,
  DanaDarurat,
  DanaTabungan,
} from '../types/saldo';

// Upload gambar ke Firebase Storage
export const uploadProgressImage = async (file: File, progressId: string): Promise<string> => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal 5MB');
  }

  const storageRef = ref(storage, `progress/${progressId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const toDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date();
};

const removeUndefined = (obj: any): any => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// ============================================
// PROJECT OPERATIONS
// ============================================

export const createProject = async (input: ProjectInput): Promise<string> => {
  const docData = removeUndefined({
    nama: input.nama,
    deskripsi: input.deskripsi,
    status: input.status,
    deadline: input.deadline ? Timestamp.fromDate(input.deadline) : undefined,
    prioritas: input.prioritas,
    effortLevel: input.effortLevel,
    penanggungJawab: input.penanggungJawab,
    catatan: input.catatan,
    kendala: input.kendala,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const docRef = await addDoc(collection(db, 'projects'), docData);
  
  await createLog('Tambah', 'Project', docRef.id, `Menambah project "${input.nama}"`);
  return docRef.id;
};

export const updateProject = async (id: string, input: Partial<ProjectInput>): Promise<void> => {
  const docRef = doc(db, 'projects', id);
  
  const updateData = removeUndefined({
    ...input,
    deadline: input.deadline ? Timestamp.fromDate(input.deadline) : undefined,
    updatedAt: Timestamp.now(),
  });
  
  await updateDoc(docRef, updateData);
  await createLog('Edit', 'Project', id, `Mengubah project`);
};

export const deleteProject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'projects', id));
  await createLog('Hapus', 'Project', id, `Menghapus project`);
};

export const getProject = async (id: string): Promise<Project | null> => {
  const docSnap = await getDoc(doc(db, 'projects', id));
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    nama: data.nama,
    deskripsi: data.deskripsi,
    status: data.status,
    deadline: data.deadline ? toDate(data.deadline) : undefined,
    prioritas: data.prioritas,
    effortLevel: data.effortLevel,
    penanggungJawab: data.penanggungJawab || [],
    catatan: data.catatan,
    kendala: data.kendala,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as Project;
};

export const getAllProjects = async (): Promise<Project[]> => {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      nama: data.nama,
      deskripsi: data.deskripsi,
      status: data.status,
      deadline: data.deadline ? toDate(data.deadline) : undefined,
      prioritas: data.prioritas,
      effortLevel: data.effortLevel,
      penanggungJawab: data.penanggungJawab || [],
      catatan: data.catatan,
      kendala: data.kendala,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as Project;
  });
};

// ============================================
// PROGRESS OPERATIONS
// ============================================

export const createProgress = async (input: ProgressInput): Promise<string> => {
  const progressData = removeUndefined({
    projectId: input.projectId,
    projectName: input.projectName,
    judul: input.judul,
    isi: input.isi,
    kategori: input.kategori,
    createdBy: input.createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const docRef = await addDoc(collection(db, 'progress'), progressData);
  
  await createLog('Tambah', 'Progress', docRef.id, `${input.createdBy} menambah ${input.kategori.toLowerCase()} di project "${input.projectName}"`);
  return docRef.id;
};

export const updateProgress = async (id: string, input: Partial<ProgressInput>): Promise<void> => {
  const updateData = removeUndefined({
    ...input,
    updatedAt: Timestamp.now(),
  });

  await updateDoc(doc(db, 'progress', id), updateData);
  await createLog('Edit', 'Progress', id, `Mengubah progress`);
};

export const deleteProgress = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'progress', id));
  await createLog('Hapus', 'Progress', id, `Menghapus progress`);
};

// ============================================
// FUNGSI PEMBAGIAN OTOMATIS (BARU)
// ============================================

export function hitungPembagian(pemasukan: number, operasional: number): PembagianOtomatis {
  const sisa = pemasukan - operasional;
  const gajiEksekutif = Math.floor(sisa * 0.4);
  const gajiPerOrang = Math.floor(gajiEksekutif / 4);
  const danaDarurat = Math.floor(sisa * 0.3);
  const danaTabungan = Math.floor(sisa * 0.3);

  return {
    sisaSetelahOperasional: sisa,
    gajiEksekutif,
    gajiPerOrang,
    danaDarurat,
    danaTabungan,
  };
}

// ============================================
// PEMASUKAN + DISTRIBUSI OTOMATIS (UPDATED)
// ============================================

export const createPemasukanWithDistribution = async (data: PemasukanInput): Promise<string> => {
  // 1. Hitung total operasional bulan ini
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const operasionalSnap = await getDocs(
    query(
      collection(db, 'operasional'),
      where('tanggal', '>=', Timestamp.fromDate(startOfMonth)),
      where('tanggal', '<=', Timestamp.fromDate(endOfMonth))
    )
  );
  
  const totalOperasional = operasionalSnap.docs.reduce(
    (sum, doc) => sum + doc.data().jumlah,
    0
  );

  // 2. CEK: Operasional harus sudah ada
  if (totalOperasional === 0) {
    throw new Error('Input operasional bulan ini terlebih dahulu sebelum menambah pemasukan');
  }

  // 3. Hitung pembagian
  const pembagian = hitungPembagian(data.jumlah, totalOperasional);

  if (pembagian.sisaSetelahOperasional <= 0) {
    throw new Error(`Saldo tidak cukup setelah dipotong operasional. Operasional bulan ini: Rp ${totalOperasional.toLocaleString('id-ID')}`);
  }

  // 4. Buat batch write
  const batch = writeBatch(db);

  // 5. Simpan pemasukan
  const pemasukanRef = doc(collection(db, 'pemasukan'));
  
  const pemasukanData: any = {
    jumlah: data.jumlah,
    sumber: data.sumber,
    tanggal: Timestamp.fromDate(data.tanggal),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (data.projectId) pemasukanData.projectId = data.projectId;
  if (data.projectName) pemasukanData.projectName = data.projectName;
  if (data.dariLainnya) pemasukanData.dariLainnya = data.dariLainnya;
  if (data.keterangan) pemasukanData.keterangan = data.keterangan;

  batch.set(pemasukanRef, pemasukanData);

  // 6. Distribusi gaji ke 4 eksekutif
  const executives: NamaEksekutif[] = ['Firdaus', 'Rafah', 'Faza', 'Haykal'];
  
  for (const nama of executives) {
    const personalRef = doc(db, 'saldoPersonal', nama.toLowerCase());
    const personalSnap = await getDoc(personalRef);
    
    const currentSaldo = personalSnap.exists() ? (personalSnap.data().saldo || 0) : 0;
    const currentRiwayat = personalSnap.exists() ? (personalSnap.data().riwayat || []) : [];

    const newRiwayat = {
      id: crypto.randomUUID(),
      tanggal: Timestamp.now(),
      jumlah: pembagian.gajiPerOrang,
      tipe: 'gaji',
      keterangan: `Gaji dari ${data.sumber === 'Project' ? data.projectName : data.dariLainnya}`,
    };

    batch.set(personalRef, {
      id: nama.toLowerCase(),
      nama,
      saldo: currentSaldo + pembagian.gajiPerOrang,
      riwayat: [...currentRiwayat, newRiwayat],
      createdAt: personalSnap.exists() ? personalSnap.data().createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  // 7. Tambah dana darurat
  const daruratRef = doc(db, 'danaDarurat', 'main');
  const daruratSnap = await getDoc(daruratRef);
  
  const currentDarurat = daruratSnap.exists() ? (daruratSnap.data().total || 0) : 0;
  const daruratRiwayat = daruratSnap.exists() ? (daruratSnap.data().riwayat || []) : [];
  const daruratTarget = daruratSnap.exists() ? (daruratSnap.data().target || 900000) : 900000;

  const newDaruratRiwayat = {
    id: crypto.randomUUID(),
    tanggal: Timestamp.now(),
    jumlah: pembagian.danaDarurat,
    tipe: 'tambah',
    keterangan: `Dari ${data.sumber === 'Project' ? data.projectName : data.dariLainnya}`,
  };

  batch.set(daruratRef, {
    total: currentDarurat + pembagian.danaDarurat,
    target: daruratTarget,
    riwayat: [...daruratRiwayat, newDaruratRiwayat],
  });

  // 8. Tambah dana tabungan
  const tabunganRef = doc(db, 'danaTabungan', 'main');
  const tabunganSnap = await getDoc(tabunganRef);
  
  const currentTabungan = tabunganSnap.exists() ? (tabunganSnap.data().total || 0) : 0;
  const tabunganRiwayat = tabunganSnap.exists() ? (tabunganSnap.data().riwayat || []) : [];

  const newTabunganRiwayat = {
    id: crypto.randomUUID(),
    tanggal: Timestamp.now(),
    jumlah: pembagian.danaTabungan,
    tipe: 'tambah',
    keterangan: `Dari ${data.sumber === 'Project' ? data.projectName : data.dariLainnya}`,
  };

  batch.set(tabunganRef, {
    total: currentTabungan + pembagian.danaTabungan,
    riwayat: [...tabunganRiwayat, newTabunganRiwayat],
  });

  // 9. Commit batch
  await batch.commit();

  // 10. Log
  await createLog(
    'Tambah',
    'Pemasukan' as ObjekLog,
    pemasukanRef.id,
    `Pemasukan Rp ${data.jumlah.toLocaleString('id-ID')} → Operasional: Rp ${totalOperasional.toLocaleString('id-ID')}, Gaji: Rp ${pembagian.gajiEksekutif.toLocaleString('id-ID')}, Darurat: Rp ${pembagian.danaDarurat.toLocaleString('id-ID')}, Tabungan: Rp ${pembagian.danaTabungan.toLocaleString('id-ID')}`
  );

  return pemasukanRef.id;
};

// ==========================================
// OPERASIONAL (TETAP SAMA)
// ==========================================

export const createOperasional = async (data: OperasionalInput): Promise<string> => {
  const operasionalData = {
    ...data,
    tanggal: Timestamp.fromDate(data.tanggal),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'operasional'), operasionalData);

  await createLog(
    'Tambah',
    'Operasional' as ObjekLog,
    docRef.id,
    `Operasional ${data.jenisPengeluaran} Rp ${data.jumlah.toLocaleString('id-ID')}`
  );

  return docRef.id;
};

export const updateOperasional = async (id: string, data: Partial<OperasionalInput>): Promise<void> => {
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.tanggal) {
    updateData.tanggal = Timestamp.fromDate(data.tanggal);
  }

  await updateDoc(doc(db, 'operasional', id), updateData);
  await createLog('Edit', 'Operasional' as ObjekLog, id, `Edit operasional`);
};

export const deleteOperasional = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'operasional', id));
  await createLog('Hapus', 'Operasional' as ObjekLog, id, 'Hapus operasional');
};

// ==========================================
// TARIK SALDO PERSONAL (UPDATED)
// ==========================================

export const tarikSaldoPersonal = async (
  nama: NamaEksekutif,
  jumlah: number,
  keterangan?: string
): Promise<void> => {
  const personalRef = doc(db, 'saldoPersonal', nama.toLowerCase());
  const personalSnap = await getDoc(personalRef);

  if (!personalSnap.exists()) {
    throw new Error(`Saldo ${nama} tidak ditemukan`);
  }

  const currentSaldo = personalSnap.data().saldo || 0;

  if (jumlah > currentSaldo) {
    throw new Error(
      `Saldo ${nama} tidak mencukupi. Saldo saat ini: Rp ${currentSaldo.toLocaleString('id-ID')}`
    );
  }

  const currentRiwayat = personalSnap.data().riwayat || [];
  const newRiwayat = {
    id: crypto.randomUUID(),
    tanggal: Timestamp.now(),
    jumlah,
    tipe: 'penarikan',
    keterangan: keterangan || 'Penarikan saldo',
  };

  await updateDoc(personalRef, {
    saldo: currentSaldo - jumlah,
    riwayat: [...currentRiwayat, newRiwayat],
    updatedAt: Timestamp.now(),
  });

  await createLog(
    'Tarik',
    'Saldo' as ObjekLog,
    nama.toLowerCase(),
    `${nama} menarik Rp ${jumlah.toLocaleString('id-ID')}`
  );
};

// Alias untuk backward compatibility
export const tarikSaldo = tarikSaldoPersonal;

// ==========================================
// TARIK DANA DARURAT (BARU)
// ==========================================

export const tarikDanaDarurat = async (jumlah: number, keterangan?: string): Promise<void> => {
  const daruratRef = doc(db, 'danaDarurat', 'main');
  const daruratSnap = await getDoc(daruratRef);

  if (!daruratSnap.exists()) {
    throw new Error('Dana Darurat tidak ditemukan');
  }

  const currentTotal = daruratSnap.data().total || 0;

  if (jumlah > currentTotal) {
    throw new Error(
      `Dana Darurat tidak mencukupi. Saldo saat ini: Rp ${currentTotal.toLocaleString('id-ID')}`
    );
  }

  const currentRiwayat = daruratSnap.data().riwayat || [];
  const newRiwayat = {
    id: crypto.randomUUID(),
    tanggal: Timestamp.now(),
    jumlah,
    tipe: 'tarik',
    keterangan: keterangan || 'Penarikan dana darurat',
  };

  await updateDoc(daruratRef, {
    total: currentTotal - jumlah,
    riwayat: [...currentRiwayat, newRiwayat],
  });

  await createLog(
    'Tarik',
    'Saldo' as ObjekLog,
    'dana_darurat',
    `Tarik Dana Darurat Rp ${jumlah.toLocaleString('id-ID')}`
  );
};

// ==========================================
// TARIK DANA TABUNGAN (BARU)
// ==========================================

export const tarikDanaTabungan = async (jumlah: number, keterangan?: string): Promise<void> => {
  const tabunganRef = doc(db, 'danaTabungan', 'main');
  const tabunganSnap = await getDoc(tabunganRef);

  if (!tabunganSnap.exists()) {
    throw new Error('Dana Tabungan tidak ditemukan');
  }

  const currentTotal = tabunganSnap.data().total || 0;

  if (jumlah > currentTotal) {
    throw new Error(
      `Dana Tabungan tidak mencukupi. Saldo saat ini: Rp ${currentTotal.toLocaleString('id-ID')}`
    );
  }

  const currentRiwayat = tabunganSnap.data().riwayat || [];
  const newRiwayat = {
    id: crypto.randomUUID(),
    tanggal: Timestamp.now(),
    jumlah,
    tipe: 'tarik',
    keterangan: keterangan || 'Penarikan dana tabungan',
  };

  await updateDoc(tabunganRef, {
    total: currentTotal - jumlah,
    riwayat: [...currentRiwayat, newRiwayat],
  });

  await createLog(
    'Tarik',
    'Saldo' as ObjekLog,
    'dana_tabungan',
    `Tarik Dana Tabungan Rp ${jumlah.toLocaleString('id-ID')}`
  );
};

// ==========================================
// UPDATE TARGET DANA DARURAT (BARU)
// ==========================================

export const updateTargetDanaDarurat = async (target: number): Promise<void> => {
  const daruratRef = doc(db, 'danaDarurat', 'main');
  const daruratSnap = await getDoc(daruratRef);

  if (daruratSnap.exists()) {
    await updateDoc(daruratRef, {
      target,
    });
  } else {
    await setDoc(daruratRef, {
      total: 0,
      target,
      riwayat: [],
    });
  }

  await createLog(
    'Edit',
    'Saldo' as ObjekLog,
    'dana_darurat',
    `Target Dana Darurat diubah jadi Rp ${target.toLocaleString('id-ID')}`
  );
};
// Hapus pemasukan
export const deletePemasukanById = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'pemasukan', id));
  await createLog('Hapus', 'Pemasukan' as ObjekLog, id, 'Hapus pemasukan');
};

// Hapus operasional
export const deleteOperasionalById = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'operasional', id));
  await createLog('Hapus', 'Operasional' as ObjekLog, id, 'Hapus operasional');
};


// ============================================
// LOG OPERATIONS
// ============================================

export const createLog = async (
  aksi: AksiLog,
  objek: ObjekLog,
  objekId: string,
  ringkasan: string
): Promise<void> => {
  await addDoc(collection(db, 'logs'), {
    waktu: Timestamp.now(),
    aksi,
    objek,
    objekId,
    ringkasan,
  });
};

export const getAllLogs = async (limitCount: number = 50): Promise<Log[]> => {
  const q = query(
    collection(db, 'logs'),
    orderBy('waktu', 'desc')
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.slice(0, limitCount).map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      waktu: toDate(data.waktu),
    } as Log;
  });
};
