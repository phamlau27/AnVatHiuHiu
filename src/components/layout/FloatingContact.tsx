"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ZALO_LINK = process.env.NEXT_PUBLIC_ZALO_LINK || "https://zalo.me/0123456789";
const MESSENGER_LINK = process.env.NEXT_PUBLIC_MESSENGER_LINK || "https://m.me/anvathuihiu";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Zalo */}
            <motion.a
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ delay: 0.05 }}
              href={ZALO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
              Zalo
            </motion.a>
            {/* Messenger */}
            <motion.a
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              href={MESSENGER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.37.27.6l.05 1.9c.02.55.55.91 1.07.72l2.12-.82c.18-.07.38-.08.57-.03.92.26 1.9.4 2.78.4 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.89 7.57l-2.9 4.6c-.46.73-1.44.92-2.12.4l-2.3-1.73c-.22-.16-.52-.16-.73 0L7.15 14.9c-.4.3-.92-.19-.66-.62l2.9-4.6c.46-.73 1.44-.92 2.12-.4l2.3 1.73c.22.16.52.16.73 0l2.7-2.05c.4-.3.92.19.66.62z" />
              </svg>
              Messenger
            </motion.a>
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-mint rounded-full shadow-lg flex items-center justify-center hover:bg-mint-dark transition-colors"
        aria-label="Liên hệ"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
