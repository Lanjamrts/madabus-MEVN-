import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const types = {
  success: { bg: "#dcfce7", border: "#86efac", color: "#166534", icon: "✓" },
  error: { bg: "#fff1f2", border: "#fecdd3", color: "#c8102e", icon: "✕" },
  info: { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", icon: "ℹ" },
};

const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const t = types[type] || types.info;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 20px",
            borderRadius: "12px",
            border: `1px solid ${t.border}`,
            background: t.bg,
            color: t.color,
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            maxWidth: "400px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          <span style={{ fontSize: "16px", fontWeight: 700 }}>{t.icon}</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
