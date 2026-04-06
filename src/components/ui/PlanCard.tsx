import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface PlanCardProps {
  letter: string;
  title: string;
  subtitle: string;
  oldPriceText?: string;
  strikeOldPrice?: boolean;
  price: string;
  footerText: string;
  isPopular?: boolean;
  isSelected: boolean;
  onClick?: () => void;
  onInfoClick: (e: React.MouseEvent) => void;
  onStartNow?: (e: React.MouseEvent) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  letter, title, subtitle, oldPriceText, strikeOldPrice, price, footerText, isPopular, isSelected, onClick, onInfoClick, onStartNow
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-[2.5rem] p-8 transition-all duration-500 bg-white ${
        isSelected ? 'border-2 border-[#FF0000] shadow-[0_20px_50px_rgba(255,0,0,0.15)] outline-none ring-1 ring-[#FF0000]/30 ring-offset-4' 
        : isPopular ? 'border-2 border-[#FF0000]/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-2xl'
        : 'border-2 border-transparent shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-2xl'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 overflow-hidden w-[100px] h-[100px] rounded-tr-[1.8rem]">
          <div className="absolute top-[22px] -right-[18px] bg-[#cca751] text-white text-[10px] font-bold px-10 py-[6px] uppercase tracking-widest rotate-45 transform origin-center shadow-sm">
            Popular
          </div>
        </div>
      )}
      
      <div className="text-[4rem] leading-none font-black text-[#FF0000] mb-2 font-outfit tracking-tighter">{letter}</div>
      <h3 className="text-[1.5rem] font-black text-gray-900 mb-1 font-outfit tracking-tight">{title}</h3>
      <div className="text-gray-400 font-bold mb-8 text-[15px] uppercase tracking-wider">{subtitle}</div>
      
      <div className="h-16 flex flex-col justify-end mb-4">
        {oldPriceText && (
          <div className={`text-[15px] text-gray-400 font-medium ${strikeOldPrice ? 'line-through decoration-gray-300' : ''}`}>
            {oldPriceText}
          </div>
        )}
        <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mt-1 font-outfit">
          {price}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-500 font-medium text-[15px]">{footerText}</div>
        <div 
          onClick={(e) => { e.stopPropagation(); onInfoClick(e); }}
          className="h-8 w-8 rounded-full border-[1.5px] border-gray-800 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors shrink-0 ml-4 font-serif italic text-lg leading-none cursor-pointer" title="More information">
          i
        </div>
      </div>
      
      {onStartNow && (
        <Button 
          onClick={(e) => { e.stopPropagation(); onStartNow(e); }} 
          size="lg" 
          className={`w-full mt-2 font-bold ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900 border-2 border-transparent hover:border-primary/20'}`}
        >
          Start Now
        </Button>
      )}
    </motion.div>
  );
};
