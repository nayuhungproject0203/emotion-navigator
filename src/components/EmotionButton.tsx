import React from 'react';
import { motion } from 'motion/react';
import { MoveRight } from 'lucide-react';

const EmotionButton: React.FC<{
  label: string;
  onClick: () => void;
  delay?: number;
}> = ({ label, onClick, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full p-4 sm:p-5 mb-2 sm:mb-3 glass-button rounded-xl text-left group relative overflow-hidden"
  >
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-blue-500/40 group-hover:bg-blue-400 transition-colors shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <span className="text-base sm:text-lg font-light tracking-wide text-slate-200 group-hover:text-white transition-colors break-words">{label}</span>
      </div>
      <MoveRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </div>
    {/* Subtle scanline effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  </motion.button>
);

export default EmotionButton;
