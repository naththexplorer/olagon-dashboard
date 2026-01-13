'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SaldoKategori {
  id: string;
  kategori: string;
  jumlah: number;
  updatedAt: Date;
}

export interface SaldoPersonal {
  id: string;
  nama: string;
  jumlah: number;
  updatedAt: Date;
}

export function useSaldo() {
  const [saldoKategori, setSaldoKategori] = useState<SaldoKategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'saldo'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: SaldoKategori[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            kategori: docData.kategori || '',
            jumlah: docData.jumlah || 0,
            updatedAt: docData.updatedAt?.toDate() || new Date(),
          };
        });

        // Urutkan berdasarkan kategori
        const sortedData = data.sort((a, b) => {
          const order = ['Operasional', 'Cadangan', 'Liburan', 'Gaji Eksekutif'];
          return order.indexOf(a.kategori) - order.indexOf(b.kategori);
        });

        setSaldoKategori(sortedData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching saldo:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { saldoKategori, loading, error };
}

export function useSaldoPersonal(nama: string) {
  const [saldo, setSaldo] = useState<SaldoPersonal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'saldo_personal'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs.find(d => d.data().nama === nama);
        
        if (doc) {
          const docData = doc.data();
          setSaldo({
            id: doc.id,
            nama: docData.nama || '',
            jumlah: docData.jumlah || 0,
            updatedAt: docData.updatedAt?.toDate() || new Date(),
          });
        } else {
          setSaldo(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching saldo personal:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [nama]);

  return { saldo, loading, error };
}
