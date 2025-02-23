"use client";

type ButtonProps = {
  text: string;
  onClick: () => void;
  classname: string;
};

const DefaultButton: React.FC<ButtonProps> = ({ text, onClick, classname}) => {
  return (
    <button
      className={"px-6 py-3 text-black bg-white border border-gray-300 rounded-xl shadow-md transition-all " + classname}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default DefaultButton;