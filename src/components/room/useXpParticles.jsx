// useXpParticles.jsx
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";


function getPoint(target) {
    if (!target) return { x: 0, y: 0 };

    if (typeof target === "string") {
        const el = document.querySelector(target);
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    if (target instanceof Element) {
        const r = target.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    // assume {x, y}
    if (typeof target.x === "number" && typeof target.y === "number") {
        return target;
    }

    return { x: 0, y: 0 };
}

export function useXpParticles() {
    const [particles, setParticles] = useState([]);
    const idRef = useRef(0);

    const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const burst = useCallback((from, to, opts = {}) => {
        const {
            count = 20,
            color = "limegreen",
            size = 8,
            duration = [1.4, 2],  // seconds [min, max]
            scatter = 30,           // px
        } = opts;

        const src = getPoint(from);
        const dst = getPoint(to);

        const newOnes = Array.from({ length: count }).map(() => {
        const id = idRef.current++;
        const dx = (Math.random() - 0.5) * scatter;
        const dy = (Math.random() - 0.5) * scatter;
        const life = prefersReduced ? 0.01 : (duration[0] + Math.random() * (duration[1] - duration[0]));
        const scale = 0.85 + Math.random() * 0.3;
        return {
            id,
            from: { x: src.x + dx, y: src.y + dy },
            to: dst,
            scale,
            life,
            size,
            color,
        };
        });

        setParticles(prev => [...prev, ...newOnes]);

        // Cleanup after max duration
        const maxLife = Math.max(...newOnes.map(n => n.life));
        const t = setTimeout(() => {
            setParticles(prev => prev.filter(p => !newOnes.some(n => n.id === p.id)));
        }, (maxLife + 0.05) * 1000);

        return () => clearTimeout(t);
    }, [prefersReduced]);

    const Overlay = useCallback(() => {
        if (!particles.length) return null;
        return createPortal(
        <div
            style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            }}
        >
            {particles.map(p => {
            const tx = p.to.x - p.from.x;
            const ty = p.to.y - p.from.y;
            return (
                <motion.div
                key={p.id}
                initial={{ x: p.from.x, y: p.from.y, opacity: 1, scale: p.scale }}
                animate={{ x: p.from.x + tx, y: p.from.y + ty, opacity: 0.2, scale: 0.6 }}
                transition={{ duration: p.life, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: "fixed",
                    width: p.size,
                    height: p.size,
                    borderRadius: 999,
                    background: p.color,
                    boxShadow: "0 0 10px rgba(0,255,0,0.8)",
                }}
                />
            );
            })}
        </div>,
        document.body
        );
    }, [particles]);

    return { burst, Overlay };
}
