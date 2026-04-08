import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import AdieChatWindow from './AdieChatWindow';

export default function AdieFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  
  // Position state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('adie_position');
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {}
    }

    const handleOpenChat = () => {
      setIsOpen(true);
      setHasUnread(false);
    };

    window.addEventListener('open-adie-chat', handleOpenChat);
    return () => window.removeEventListener('open-adie-chat', handleOpenChat);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
    setPosition(newPos);
    localStorage.setItem('adie_position', JSON.stringify(newPos));
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleClick = () => {
    if (!isDragging.current) {
      setIsOpen(true);
      setHasUnread(false);
    }
  };

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={position}
        className="fixed z-[9999] touch-none"
        style={{
          bottom: 24,
          right: 24,
        }}
      >
        <motion.button
          onClick={handleClick}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 15,
          }}
          className="relative w-[52px] h-[52px] rounded-full bg-[#7C3AED] flex items-center justify-center hover:bg-[#6D28D9] transition-colors cursor-pointer border-none outline-none"
        >
          <Sparkles className="w-5 h-5 text-white" />
          {hasUnread && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-[#7C3AED]"></span>
            </span>
          )}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <AdieChatWindow 
            onClose={() => setIsOpen(false)} 
            position={position} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
