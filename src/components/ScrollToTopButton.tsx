import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      id="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#0A292C] text-white hover:bg-[#F05323] border border-slate-700/30 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};
