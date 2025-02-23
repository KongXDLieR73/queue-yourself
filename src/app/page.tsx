"use client";

import WhiteButton from "@/components/white-button";
import Clock from "@/components/clock";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString() + " " + now.toLocaleDateString());
    };

    updateTime(); // เซ็ตค่าครั้งแรก
    const interval = setInterval(updateTime, 1000);

    document.body.style.overflow = "hidden";
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white text-black overflow-hidden">
      {/* Timestamp and Status */}
      <div className="text-center mb-4">
        <p className="text-sm">{currentTime ? currentTime : "Loading..."}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <p className="text-sm">QYS Online</p>
        </div>
      </div>
      
      {/* Queue Number */}
      <h2 className="text-xl font-semibold">Your Queue</h2>
      <p className="text-6xl font-bold">17</p>
      
      {/* Buttons */}
      <button className="mt-4 px-6 py-2 bg-gray-300 text-gray-600 rounded-full cursor-not-allowed" disabled>
        Wait...
      </button>
      <button className="mt-2 px-6 py-2 border border-black rounded-full hover:bg-gray-100">
        Cancel
      </button>
      
    </div>
  );
}
