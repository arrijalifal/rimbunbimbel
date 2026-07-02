'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { materialsData } from '@/lib/data';

export default function MateriPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-6">📚 Materi Pembelajaran</h2>
          <div className="space-y-4">
            {materialsData.map((material) => (
              <div 
                key={material.id} 
                className="rounded-xl p-4 bg-white shadow-sm border-l-4"
                style={{ borderColor: material.color }}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-[#1a4731]">{material.title}</p>
                  <span className="text-xs text-gray-500">
                    {material.progress > 0 ? `${material.progress}% selesai` : 'Belum dimulai'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${material.progress}%`,
                      backgroundColor: material.progress > 0 ? material.color : '#d1d5db'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}