'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Progress } from '@/types/progress';

export function useProgress() {
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'progress'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Progress[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            projectId: docData.projectId || '',
            projectName: docData.projectName || '',
            judul: docData.judul,
            isi: docData.isi,
            kategori: docData.kategori,
            createdBy: docData.createdBy,
            createdAt: docData.createdAt?.toDate() || new Date(),
            updatedAt: docData.updatedAt?.toDate() || new Date(),
          };
        });

        setProgressList(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching progress:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { progressList, loading, error };
}
