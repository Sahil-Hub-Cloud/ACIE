import React from 'react';
import { motion } from 'framer-motion';

interface RouteTransitionProps {
  children: React.ReactNode;
  routeKey: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children, routeKey }) => {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
export default RouteTransition;
