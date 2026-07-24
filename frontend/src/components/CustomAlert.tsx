import React from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

interface AlertProps {
  severity?: "success" | "error" | "warning" | "info";
  children?: React.ReactNode;
  onClose?: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  variant?: string;
  sx?: any;
  icon?: React.ReactNode;
}

const typeStyles = {
  success: "bg-green-100 text-green-800 border-green-300",
  error: "bg-red-100 text-red-800 border-red-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
};

const fadeInBlur = {
  initial: { opacity: 0, filter: "blur(10px)", y: 10, rotate: 0 },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    rotate: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const CustomAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ severity = "info", children, onClose, variant, sx, icon, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "border px-4 py-3 flex gap-x-2 items-center rounded-2xl text-sm w-full max-w-md shadow-lg",
          typeStyles[severity] || typeStyles.info
        )}
        role="alert"
        variants={fadeInBlur}
        initial="initial"
        animate="animate"
        whileHover={{
          scale: 1.01,
          rotate: 1,
          transition: {
            duration: 0.2,
            ease: "easeInOut",
          },
        }}
        whileTap={{
          scale: 0.99,
          transition: {
            duration: 0.2,
            ease: "easeInOut",
          },
        }}
        onClick={(e: any) => onClose && onClose(e)}
        style={{ cursor: onClose ? 'pointer' : 'default', ...sx }}
        {...rest}
      >
        <span className="font-bold capitalize">{severity}:</span>
        <span>{children}</span>
      </motion.div>
    );
  }
);

export default CustomAlert;
