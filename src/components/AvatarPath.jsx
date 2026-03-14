import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, FileText, CheckCircle, PenTool, Flag, FileCheck } from 'lucide-react';
// imágenes del personaje según su estado de movimiento
import motocleStanding from '../assets/motocle-standing.png';
import motocleRunning from '../assets/motocle-running.png';
import motocleTrophy from '../assets/motocle-trophy.png';

// barra de progreso animada con un personaje (motocle) que se mueve según el avance
export default function AvatarPath({ progress }) {
    // progreso visual suavizado para la animación
    const [visualProgress, setVisualProgress] = useState(0);
    // indica si el motocle está en movimiento (cambia la imagen)
    const [isMoving, setIsMoving] = useState(false);

    // cuando el progreso externo cambia, animamos el personaje y lo ponemos en movimiento
    useEffect(() => {
        if (progress !== visualProgress) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMoving(true);
            setVisualProgress(progress);
            // después de 1 segundo, vuelve a la imagen de quieto
            const timer = setTimeout(() => {
                setIsMoving(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [progress, visualProgress]);

    // puntos de control visibles en la barra de progreso
    const milestones = [
        { pos: 0, icon: User, label: 'Inicio' },
        { pos: 30, icon: FileText, label: 'Documentación' },
        { pos: 50, icon: CheckCircle, label: 'Verificación' },
        { pos: 70, icon: FileText, label: 'Generados' },
        { pos: 90, icon: FileCheck, label: 'Aprobación' },
        { pos: 100, icon: Flag, label: 'Meta' },
    ];

    return (
        <div className="path-container">
            {/*
              path-track-wrapper agrega padding lateral para que la imagen del motocle
              (que sobresale fuera del borde de la barra) no quede cortada en los extremos.
              en móvil se usa un offset menor gracias a media queries en index.css.
            */}
            <div className="path-track-wrapper">
                <div className="path-track">
                    {/* barra de progreso que se llena de izquierda a derecha */}
                    <motion.div
                        className="path-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${visualProgress}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />

                    {/* puntos de etapa: se vuelven activos cuando el progreso los alcanza */}
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

                    {/* personaje animado que avanza según el porcentaje de progreso */}
                    <motion.div
                        className="avatar-character"
                        animate={{ left: `${visualProgress}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <div style={{ position: 'relative' }}>
                            {/* cambia imagen según estado: trophy al llegar al 100%, running si se mueve */}
                            <img
                                src={visualProgress >= 100 ? motocleTrophy : (isMoving ? motocleRunning : motocleStanding)}
                                alt="Motocle"
                                className="avatar-img"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
