'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Log } from '@/types/log';

export function useRiwayat(limitCount: number = 50) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'logs'),
      orderBy('waktu', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Log[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            waktu: docData.waktu?.toDate() || new Date(),
            aksi: docData.aksi,
            objek: docData.objek,
            objekId: docData.objekId,
            ringkasan: docData.ringkasan,
          };
        });

        setLogs(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching logs:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { logs, loading, error };
}

export interface Penarikan {
  id: string;
  nama: string;
  nominal: number;
  catatan: string;
  createdAt: Date;
}

export function usePenarikan() {
  const [penarikanList, setPenarikanList] = useState<Penarikan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'penarikan'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Penarikan[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            nama: docData.nama,
            nominal: docData.nominal,
            catatan: docData.catatan || '',
            createdAt: docData.createdAt?.toDate() || new Date(),
          };
        });

        setPenarikanList(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching penarikan:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { penarikanList, loading, error };
}
