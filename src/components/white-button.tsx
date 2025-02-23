"use client";

import { motion } from "framer-motion";

type WhiteButtonProps = {
  text: string;
  onClick: () => void;
  classname: string;
};

const WhiteButton: React.FC<WhiteButtonProps> = ({ text, onClick, classname}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: "#f3f3f3" }}
      whileTap={{ scale: 0.9, backgroundColor: "#e0e0e0" }}
      className={"px-6 py-3 text-black bg-white border border-gray-300 rounded-xl shadow-md transition-all " + classname}
      onClick={onClick}
    >
      {text}
    </motion.button>
  );
};

export default WhiteButton;