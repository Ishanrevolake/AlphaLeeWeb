"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Phone, Download } from 'lucide-react';
import { useFunnelStore } from '@/store/funnelStore';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function SuccessPage() {
  const { name } = useFunnelStore();

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    setMounted(true);
    // Cleanup funnel stored data on successful arrival (but might want to keep it if they refresh)
    // clearFunnel();
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto mb-16 absolute top-12">
        <ProgressBar currentStep={3} totalSteps={3} />
      </div>

      <motion.div 
        className="text-center max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            className="text-green-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 size={100} strokeWidth={2} />
          </motion.div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black mb-6 font-outfit text-gray-900 tracking-tight">
          You&apos;re officially part of Alpha Lee&apos;s program 💪
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 font-medium">
          Welcome to the family, {name || 'future athlete'}. The next step is downloading the Alpha App, where your personalized training plan and diet await.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="flex items-center text-lg gap-2 shadow-lg shadow-black/10 bg-black hover:bg-gray-800 text-white">
            <Download size={20} /> App Store
          </Button>
          <Button size="lg" className="flex items-center text-lg gap-2 shadow-lg shadow-black/10 bg-black hover:bg-gray-800 text-white">
            <Download size={20} /> Google Play
          </Button>
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
          <Phone className="text-primary mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2 text-gray-900">Need direct access?</h3>
          <p className="text-gray-600 font-medium mb-4">Send a WhatsApp message to your coach to get started right now.</p>
          <Button variant="outline">
            Message Alpha Lee
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
