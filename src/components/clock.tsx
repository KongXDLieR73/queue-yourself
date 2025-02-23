import { useState, useEffect } from "react";

export default function clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 text-xl font-semibold bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
      {time.toLocaleTimeString()}
    </div>
  );
}
