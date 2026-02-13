import { motion, AnimatePresence } from "framer-motion";

export default function OrderStack({ orderQueue, visible }) {
  if (!visible) return null;
  return (
    <div className="order-stack">
      <AnimatePresence>
        {orderQueue.map((rule, i) => (
          <motion.div
            key={rule.id}
            className="order-stack-slip"
            style={{
              bottom: `${i * 8}px`,
              left: `${i * 3}px`,
            }}
            initial={{ opacity: 1, x: 0 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <span className="character">{rule.order}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
