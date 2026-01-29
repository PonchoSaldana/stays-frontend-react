import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, FileText, CheckCircle, PenTool, Flag } from 'lucide-react';
import motocleStanding from '../assets/motocle-standing.png';
import motocleRunning from '../assets/motocle-running.png';
import motocleTrophy from '../assets/motocle-trophy.png';

export default function AvatarPath({ progress, currentStage }) {
    const [visualProgress, setVisualProgress] = useState(0);
    const [isMoving, setIsMoving] = useState(false);

    // Controla la animación de movimiento del avatar
    useEffect(() => {
        if (progress !== visualProgress) {
            setIsMoving(true);
            setVisualProgress(progress);
            const timer = setTimeout(() => {
                setIsMoving(false);
            }, 1000); // Matches animation duration
            return () => clearTimeout(timer);
        }
    }, [progress, visualProgress]);

    const milestones = [
        { pos: 0, icon: User, label: 'Inicio' },
        { pos: 30, icon: FileText, label: 'Documentación' },
        { pos: 50, icon: CheckCircle, label: 'Verificación' },
        { pos: 70, icon: FileText, label: 'Generados' },
        { pos: 90, icon: PenTool, label: 'Firma' },
        { pos: 100, icon: Flag, label: 'Meta' },
    ];

    return (
        <div className="path-container" style={{ paddingTop: '3rem' }}>
            <div className="path-track">
                {/* Progress Fill */}
                <motion.div
                    className="path-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${visualProgress}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* Milestones */}
                {milestones.map((m, idx) => (
                    <div
                        key={idx}
                        className={`milestone ${visualProgress >= m.pos ? 'active' : ''}`}
                        style={{ left: `${m.pos}%` }}
                    >
                        <div className="milestone-icon">
                            <m.icon size={14} />
                        </div>
                        <span className="milestone-label">
                            {m.label}
                        </span>
                    </div>
                ))}

                {/* Avatar Character */}
                <motion.div
                    style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}
                    animate={{ left: `${visualProgress}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                >
                    <div style={{ position: 'relative' }}>
                        <img
                            src={visualProgress >= 100 ? motocleTrophy : (isMoving ? motocleRunning : motocleStanding)}
                            alt="Motocle"
                            style={{
                                height: 80,
                                width: 'auto',
                                position: 'absolute',
                                bottom: 10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
