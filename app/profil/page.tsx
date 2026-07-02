'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function ProfilPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="rounded-2xl p-6 shadow-md text-center bg-white">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image
                src="https://images.pexels.com/photos/31274806/pexels-photo-31274806.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Portrait of a young woman in a school uniform adjusting her glasses"
                fill
                className="rounded-full object-cover shadow-md"
              />
            </div>
            <h2 className="text-xl font-bold text-[#1a4731]">Rina Permata</h2>
            <p className="text-sm text-[#74a892] mt-1">Murid — XII IPA 2 — Paket Premium</p>

            <div className="mt-6 text-left space-y-3 max-w-xs mx-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">rina@rimbun.id</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Telepon</span>
                <span className="font-medium">0812-3456-7890</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kelas</span>
                <span className="font-medium">XII IPA 2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paket</span>
                <span className="font-medium">Premium (Mat+Fis+Eng)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bergabung</span>
                <span className="font-medium">Januari 2025</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}