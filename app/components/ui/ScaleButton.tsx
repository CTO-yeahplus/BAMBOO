'use client';
import { motion } from 'framer-motion';
import { useUISound } from '../../hooks/useUISound';

export const ScaleButton = ({ onClick, children, className, disabled }: any) => {
    const { playTick } = useUISound();

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }} // 👈 누를 때 쫀득하게 작아짐
            onClick={(e) => {
                if (!disabled) {
                    playTick(); // 🎵 클릭음 자동 재생
                    onClick && onClick(e);
                }
            }}
            disabled={disabled}
            className={`${className} transition-colors`}
        >
            {children}
        </motion.button>
    );
};