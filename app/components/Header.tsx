'use client';

import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm">
      <button
        type="button"
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-[22px] h-[22px] text-[#1a4731]" />
      </button>
      <span className="font-semibold text-[#1a4731]">Rimbun Bimbel</span>
      <div className="w-8 h-8 rounded-full bg-[#b7e4c7] flex items-center justify-center text-green-dark font-semibold text-xs">
        RP
      </div>
    </header>
  );
}