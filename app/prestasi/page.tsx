'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Star, Zap } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { achievementsData } from '@/lib/data';

const iconMap = {
  award: Award,
  star: Star,
  zap: Zap,
};

const colorMap = {
  yellow: 'from-yellow-50 to-amber-50 border-yellow-200',
  blue: 'from-blue-50 to-cyan-50 border-blue-200',
  green: 'from-green-50 to-emerald-50 border-green-200',
};

const iconColorMap = {
  yellow: '#d97706',
  blue: '#3b82f6',
  green: '#16a34a',
};

export default function PrestasiPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4faf6]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 lg:ml-0 min-h-screen">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-6">🏆 Prestasi Saya</h2>
          <div className="space-y-4">
            {achievementsData.map((achievement) => {
              const Icon = iconMap[achievement.icon];
              return (
                <div 
                  key={achievement.id} 
                  className={`rounded-xl p-5 bg-gradient-to-r shadow-sm border ${colorMap[achievement.color as keyof typeof colorMap]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon 
                      className="w-6 h-6 flex-shrink-0 mt-0.5" 
                      style={{ color: iconColorMap[achievement.color as keyof typeof iconColorMap] }}
                    />
                    <div>
                      <p className="font-medium text-[#1a4731]">{achievement.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{achievement.date} • {achievement.category}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}