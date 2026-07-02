'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { scheduleData } from '@/lib/data';

export default function JadwalPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<typeof scheduleData[0]>([]);

  useEffect(() => {
    const today = new Date().getDay();
    setTodaySchedule(scheduleData[today] || []);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="rounded-2xl p-5 shadow-md bg-white">
            <h3 className="font-semibold text-[#1a4731] text-[19px] mb-4">📚 Jadwal Les Hari Ini</h3>
            <div className="space-y-3">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="p-4 rounded-xl bg-[#edf7f0] border-l-4 border-[#2d6a4f]"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[#1a4731] text-sm">{schedule.subject}</p>
                      <span className="text-xs text-gray-500">{schedule.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {schedule.teacher} • {schedule.room}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border-l-4 border-gray-300">
                  <p className="font-medium text-gray-500 text-sm">Tidak ada jadwal hari ini</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}