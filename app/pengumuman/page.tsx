'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { announcementsData } from '@/lib/data';

export default function PengumumanPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="rounded-2xl p-5 shadow-md bg-white">
            <h3 className="font-semibold text-[#1a4731] text-[19px] mb-4">📢 Semua Pengumuman</h3>
            <div className="space-y-4">
              {announcementsData.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`p-4 rounded-xl bg-[#edf7f0] border-l-4 
                    ${announcement.priority === 'high' ? 'border-[#2d6a4f]' : 
                      announcement.priority === 'medium' ? 'border-[#74a892]' : 'border-[#b7e4c7]'}`}
                >
                  <p className="font-medium text-[#1a4731] text-sm">{announcement.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}