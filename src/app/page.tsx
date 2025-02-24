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

enum cancel {
  Unmounted,
  Mounted
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<state>(state.Home);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [cancelPrompt, setCancelPrompt] = useState<cancel>(cancel.Unmounted)

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
      <div className="text-center mt-[20vh] mb-12">
        <p className="flex text-sm select-none">{currentTime ? currentTime : "Loading..."}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <p className="text-sm select-none">QYS Online</p>
        </div>
      </div>
      {
        currentState == state.Home && <>
          <div className={"flex flex-col items-center font-kanit font-weight-[100]" }>
            <p className={"text-[3.5rem] font-bold mb- mt-4 select-none "}>ชอบคนอ่านคับ</p>
            <p className={"text-3xl font-bold mb- mt- select-none "}>ละอ่านทำฃวยไรหล่ะ</p>
            <p className={"text-2xl font-bold mb-14 mt-6 select-none "}>หยอกน้าเตงๆ</p>

            <button className="mt-3 mb-32 px-auto py-3 w-[12rem] font-bold border-[2px] border-black text-1xl rounded-full bg-black text-white active:text-black active:bg-white select-none transition-all ease-out duration-100" onClick={() => setCurrentState(state.Queuing)}>
              กดตรงนี้ๆ
            </button>
          </div>
        </>
      }
        
      {
        currentState == state.Queuing && (<>
          {/* Queue Number */}
          <h2 className="text-3xl font-semibold select-none">Your Queue</h2>
          <p className="text-6xl font-bold mb-14 mt-4 select-none font-kanit">{queueNumber !== null ? queueNumber : "Loading..."}</p>

          {/* Buttons */}
          <button className="px-auto py-3 w-[12rem] font-bold border border-gray-300 bg-gray-300 text-gray-500 text-1xl rounded-full cursor-not-allowed font-kanit select-none">
            รอแปบๆ
          </button>
          <button className="mt-3 mb-32 px-auto py-[0.85rem] w-[12rem] font-bold border-[2px] border-black text-[0.9rem] rounded-full active:bg-black active:text-white select-none font-kanit transition-all ease-out duration-100" onClick={() => setCancelPrompt(cancel.Mounted)}>
            CANCEL
          </button>
          {
            cancelPrompt == cancel.Mounted && (<>
              <div className="flex z-0 bg-black bg-opacity-20 min-h-screen w-screen justify-center items-center absolute" onClick={() => setCancelPrompt(cancel.Unmounted)}>
                <span className="relative z-10 p-7 bg-white w-[22rem] h-[10rem] rounded-[3rem] text-black" onClick={() => setCancelPrompt(cancel.Mounted)}>
                  <h1 className="text-2xl font-kanit">
                    You're going to cancel?
                  </h1>
                  <div className="flex flex-row w-[18.6rem] absolute gap-3 bottom-6">
                    <button className="basis-1/2 px-auto py-[0.85rem] w-[8rem] font-bold border-[2px] text-red-500 border-red-500 text-[0.9rem] rounded-full active:bg-red-500 active:text-white select-none font-kanit transition-all ease-out duration-100" onClick={() => {setCurrentState(state.Home), setCancelPrompt(cancel.Unmounted)}}>
                      ยกเลิกคิว
                    </button>
                    <button className="basis-1/2 px-auto py-[0.85rem] w-[8rem] font-bold border-[2px] border-black text-1xl rounded-full active:bg-white active:text-black text-white bg-black select-none font-kanit transition-all ease-out duration-100" onClick={() => setCancelPrompt(cancel.Unmounted)}>
                      กลับ
                    </button>
                  </div>
                </span>
              </div>
            </>)
          }
        </>)
      }
    </div>
  );
}
