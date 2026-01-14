import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  SaldoPersonal, 
  DanaDarurat, 
  DanaTabungan,
  Pemasukan,
  Operasional 
} from '@/types/saldo';

const toDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date();
};

// Hook untuk saldo personal (4 eksekutif)
export function useSaldoPersonal() {
  const [data, setData] = useState<SaldoPersonal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const executives = ['firdaus', 'rafah', 'faza', 'haykal'];
        const result: SaldoPersonal[] = [];

        for (const nama of executives) {
          const docRef = doc(db, 'saldoPersonal', nama);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            result.push({
              id: docSnap.id,
              nama: data.nama,
              saldo: data.saldo || 0,
              riwayat: (data.riwayat || []).map((r: any) => ({
                ...r,
                tanggal: toDate(r.tanggal),
              })),
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
            });
          } else {
            result.push({
              id: nama,
              nama: nama.charAt(0).toUpperCase() + nama.slice(1) as any,
              saldo: 0,
              riwayat: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        setData(result);
      } catch (error) {
        console.error('Error fetching saldo personal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { saldoPersonal: data, loading };
}

// Hook untuk dana darurat
export function useDanaDarurat() {
  const [data, setData] = useState<DanaDarurat>({ total: 0, target: 900000, riwayat: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'danaDarurat', 'main');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const raw = docSnap.data();
        setData({
          total: raw.total || 0,
          target: raw.target || 900000,
          riwayat: (raw.riwayat || []).map((r: any) => ({
            ...r,
            tanggal: toDate(r.tanggal),
          })),
        });
      } else {
        setData({ total: 0, target: 900000, riwayat: [] });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { danaDarurat: data, loading };
}

// Hook untuk dana tabungan
export function useDanaTabungan() {
  const [data, setData] = useState<DanaTabungan>({ total: 0, riwayat: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'danaTabungan', 'main');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const raw = docSnap.data();
        setData({
          total: raw.total || 0,
          riwayat: (raw.riwayat || []).map((r: any) => ({
            ...r,
            tanggal: toDate(r.tanggal),
          })),
        });
      } else {
        setData({ total: 0, riwayat: [] });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { danaTabungan: data, loading };
}

// Hook untuk pemasukan
export function usePemasukan() {
  const [data, setData] = useState<Pemasukan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pemasukan'), orderBy('tanggal', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          jumlah: raw.jumlah,
          sumber: raw.sumber,
          projectId: raw.projectId,
          projectName: raw.projectName,
          dariLainnya: raw.dariLainnya,
          keterangan: raw.keterangan,
          tanggal: toDate(raw.tanggal),
          createdAt: toDate(raw.createdAt),
          updatedAt: toDate(raw.updatedAt),
        } as Pemasukan;
      });
      setData(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { pemasukan: data, loading };
}

// Hook untuk operasional
export function useOperasional() {
  const [data, setData] = useState<Operasional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'operasional'), orderBy('tanggal', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          jumlah: raw.jumlah,
          jenisPengeluaran: raw.jenisPengeluaran,
          keterangan: raw.keterangan,
          tanggal: toDate(raw.tanggal),
          createdAt: toDate(raw.createdAt),
          updatedAt: toDate(raw.updatedAt),
        } as Operasional;
      });
      setData(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { operasional: data, loading };
}
