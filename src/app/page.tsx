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
      <h2 className="text-3xl font-semibold">Your Queue</h2>
      <p className="text-8xl font-bold mb-8 mt-4">17</p>
      
      {/* Buttons */}
      <button className="px-auto py-3 w-[12rem] border border-gray-300 bg-gray-300 text-gray-600 text-1xl rounded-full cursor-not-allowed">
        WAITING...
      </button>
      <button className="mt-3 px-auto py-3 w-[12rem] border border-black text-1xl rounded-full hover:bg-gray-100">
        CANCEL
      </button>
      
    </div>
  );
}
