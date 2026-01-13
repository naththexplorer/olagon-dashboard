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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, ProjectInput } from '../types/project';
import type { Transaksi, TransaksiInput } from '../types/saldo';
import type { Log, AksiLog, ObjekLog } from '../types/log';
import type { Progress, ProgressInput } from '../types/progress';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// Filter undefined values dari object
const removeUndefined = (obj: any): any => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
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
// TRANSAKSI & SALDO OPERATIONS
// ============================================

export const createTransaksi = async (input: TransaksiInput): Promise<string> => {
  const nominal = input.nominal;
  
  // Hitung pembagian otomatis
  const pembagian = {
    operasional: Math.floor(nominal * 0.4),
    cadangan: Math.floor(nominal * 0.1),
    liburan: Math.floor(nominal * 0.1),
    gajiEksekutif: Math.floor(nominal * 0.3),
  };

  // Hitung gaji per orang
  const perOrang = Math.floor(pembagian.gajiEksekutif / 4);
  const gajiPerOrang = {
    firdaus: perOrang,
    faza: perOrang,
    rafah: perOrang,
    haikal: perOrang,
  };

  // Simpan transaksi
  const transaksiData = removeUndefined({
    jasaId: input.jasaId,
    jasaNama: input.jasaNama,
    nominal: input.nominal,
    catatan: input.catatan,
    pembagian,
    gajiPerOrang,
    createdAt: Timestamp.now(),
  });

  const docRef = await addDoc(collection(db, 'transaksi'), transaksiData);

  // Update saldo kategori dengan ID yang konsisten
  await updateSaldoKategori('operasional', 'Operasional', pembagian.operasional);
  await updateSaldoKategori('cadangan', 'Cadangan', pembagian.cadangan);
  await updateSaldoKategori('liburan', 'Liburan', pembagian.liburan);
  await updateSaldoKategori('gaji_eksekutif', 'Gaji Eksekutif', pembagian.gajiEksekutif);

  // Update saldo personal
  await updateSaldoPersonal('firdaus', 'Firdaus', gajiPerOrang.firdaus);
  await updateSaldoPersonal('faza', 'Faza', gajiPerOrang.faza);
  await updateSaldoPersonal('rafah', 'Rafah', gajiPerOrang.rafah);
  await updateSaldoPersonal('haikal', 'Haikal', gajiPerOrang.haikal);

  await createLog('Tambah', 'Transaksi', docRef.id, `Pemasukan ${formatRupiah(nominal)} dari ${input.jasaNama}`);
  
  return docRef.id;
};

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper: Update saldo kategori dengan setDoc (bukan addDoc)
const updateSaldoKategori = async (
  docId: string,
  kategori: string,
  tambahan: number
): Promise<void> => {
  const docRef = doc(db, 'saldo', docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const currentJumlah = docSnap.data().jumlah || 0;
    await updateDoc(docRef, {
      jumlah: currentJumlah + tambahan,
      updatedAt: Timestamp.now(),
    });
  } else {
    // Buat document dengan ID spesifik
    await setDoc(docRef, {
      kategori,
      jumlah: tambahan,
      updatedAt: Timestamp.now(),
    });
  }
};

// Helper: Update saldo personal dengan setDoc
const updateSaldoPersonal = async (
  docId: string,
  nama: string,
  tambahan: number
): Promise<void> => {
  const docRef = doc(db, 'saldo_personal', docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const currentJumlah = docSnap.data().jumlah || 0;
    await updateDoc(docRef, {
      jumlah: currentJumlah + tambahan,
      updatedAt: Timestamp.now(),
    });
  } else {
    // Buat document dengan ID spesifik
    await setDoc(docRef, {
      nama,
      jumlah: tambahan,
      updatedAt: Timestamp.now(),
    });
  }
};

// Tarik saldo personal
export const tarikSaldoPersonal = async (
  nama: string,
  nominal: number,
  catatan?: string
): Promise<void> => {
  // Cari document saldo personal
  const q = query(collection(db, 'saldo_personal'));
  const snapshot = await getDocs(q);
  const docSnap = snapshot.docs.find(d => d.data().nama === nama);

  if (!docSnap) {
    throw new Error('Saldo personal tidak ditemukan');
  }

  const currentJumlah = docSnap.data().jumlah || 0;

  if (currentJumlah < nominal) {
    throw new Error('Saldo tidak mencukupi');
  }

  const docId = docSnap.id; // ← Simpan ID dulu

  // Update saldo
  await updateDoc(doc(db, 'saldo_personal', docId), {
    jumlah: currentJumlah - nominal,
    updatedAt: Timestamp.now(),
  });

  // Simpan log penarikan
  await addDoc(collection(db, 'penarikan'), {
    nama,
    nominal,
    catatan: catatan || '',
    createdAt: Timestamp.now(),
  });

  // Fix: Pakai docId yang sudah disimpan
  await createLog('Tarik', 'Saldo Personal', docId, `${nama} menarik ${formatRupiah(nominal)}`);
};

// Tambahkan di bagian SALDO OPERATIONS (setelah createPemasukan)
export const tarikSaldo = async (anggota: string, jumlah: number): Promise<void> => {
  // ❌ SALAH: const saldoPersonalRef = doc(db, 'saldoPersonal', anggota);
  
  // ✅ BENAR: Sesuaikan dengan collection yang kamu pakai
  const saldoPersonalRef = doc(db, 'saldo_personal', anggota.toLowerCase());
  const saldoDoc = await getDoc(saldoPersonalRef);

  if (!saldoDoc.exists()) {
    throw new Error(`Saldo ${anggota} tidak ditemukan`);
  }

  const currentSaldo = saldoDoc.data().jumlah || 0;

  if (jumlah > currentSaldo) {
    throw new Error(
      `Saldo ${anggota} tidak mencukupi. Saldo saat ini: Rp ${currentSaldo.toLocaleString('id-ID')}`
    );
  }

  const newSaldo = currentSaldo - jumlah;

  await updateDoc(saldoPersonalRef, {
    jumlah: newSaldo,
    updatedAt: Timestamp.now(),
  });

  await createLog(
    'Tarik',
    'Saldo',
    anggota,
    `${anggota} menarik Rp ${jumlah.toLocaleString('id-ID')}`
  );
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

// 🔥 TAMBAHKAN INI:
export const deleteProgress = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'progress', id));
  await createLog('Hapus', 'Progress', id, `Menghapus progress`);
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
