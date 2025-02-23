"use client";

import WhiteButton from "@/components/default-button";
import Clock from "@/components/clock";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Kanit } from "next/font/google";
import { supabase } from "@/lib/supabase";

enum state {
  Home,
  Queuing,
  Confirming,
  Finished
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<state>(state.Home);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchQueueNumber = async () => {
      const { count, error } = await supabase
        .from("queues")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Error fetching queue number:", error);
      } else {
        setQueueNumber(count ?? 0);
      }
    };

    fetchQueueNumber();

    const subscription = supabase
      .channel("queues")
      .on("postgres_changes", { event: "*", schema: "public", table: "queues" }, fetchQueueNumber)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className={"flex flex-col items-center min-h-screen w-screen bg-white text-black overflow-hidden"}>
      {/* Timestamp and Status */}
      <div className="text-center mt-[30vh] mb-12">
        <p className="flex text-sm select-none">{currentTime ? currentTime : "Loading..."}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <p className="text-sm select-none">QYS Online</p>
        </div>
      </div>
      {
        currentState == state.Home && <>
          <div className={"flex flex-col items-center font-kanit font-weight-[100]" }>
            <p className={"text-6xl font-bold mb-14 mt-4 select-none "}>อ่านทำควยไรอะ</p>

            <button className="mt-3 mb-32 px-auto py-3 w-[12rem] font-bold border-[2px] border-black text-1xl rounded-full active:bg-black active:text-white select-none transition-all ease-out duration-100" onClick={setCurrentState => state.Queuing}>
              กดตรงนี้ๆ
            </button>
          </div>
        </>
      }
        
      {
        currentState == state.Queuing && (<>
          {/* Queue Number */}
          <h2 className="text-3xl font-semibold select-none">Your Queue</h2>
          <p className="text-6xl font-bold mb-14 mt-4 select-none">{queueNumber !== null ? queueNumber : "Loading..."}</p>

          {/* Buttons */}
          <button className="px-auto py-3 w-[12rem] font-bold border border-gray-300 bg-gray-300 text-gray-500 text-1xl rounded-full cursor-not-allowed select-none">
            WAITING...
          </button>
          <button className="mt-3 mb-32 px-auto py-3 w-[12rem] font-bold border-[2px] border-black text-1xl rounded-full active:bg-black active:text-white select-none transition-all ease-out duration-100">
            CANCEL
          </button>
        </>)
      }
    </div>
  );
}
