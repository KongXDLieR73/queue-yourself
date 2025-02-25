"use client";

import { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient'; // ใส่ที่ตั้งของไฟล์ supabaseClient
import { v4 as uuidv4 } from "uuid";


enum State {
  Home,
  Queuing,
  Confirming,
  Finished
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<State>(State.Home);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [cancelPrompt, setCancelPrompt] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ✅ ตั้งค่าเวลาให้เป็น real-time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString() + " " + now.toLocaleDateString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ เช็ค session ID และสร้างใหม่ถ้าไม่มี
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem("sessionId", newSessionId);
    }
  }, []);

  // ✅ ดึงเลขคิวจาก Supabase ตาม session ID
  type QueueData = {
    session_id: string;
    queue_number: number;
  };

  useEffect(() => {
    if (!sessionId) return;

    const fetchQueueNumber = async () => {
      const { data, error } = await supabase
        .from('queues')
        .select('queue_number')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        
      } else if (data) {
        setQueueNumber((data as QueueData).queue_number);
        setCurrentState(State.Queuing);
      }
    };

    fetchQueueNumber();

    const subscription = supabase
      .channel("queue_updates") // ตั้งชื่อ channel (อะไรก็ได้)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queues" },
        (payload) => {
          console.log("Realtime update:", payload);

          if ((payload.new as QueueData).session_id === sessionId) {
            setQueueNumber((payload.new as QueueData).queue_number);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionId]);

  // ✅ ฟังก์ชันเข้าคิว
  const handleQueue = async () => {
    if (!sessionId) return;

    // 1️⃣ ดึงคิวล่าสุด
    const { data: latestQueue, error } = await supabase
      .from('queues')
      .select('queue_number')
      .order('queue_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching queue:", error);
      return;
    }

    const newQueueNumber = latestQueue ? latestQueue.queue_number + 1 : 0;

    // 2️⃣ เพิ่ม row ใหม่ในคิว
    const { error: insertError } = await supabase
      .from('queues')
      .insert([{ session_id: sessionId, queue_number: newQueueNumber }]);

    if (insertError) {
      console.error("Error inserting queue:", insertError);
      return;
    }

    // 3️⃣ อัพเดต state
    setQueueNumber(newQueueNumber);
    setCurrentState(State.Queuing);
  };

  // ✅ ฟังก์ชันอัพเดตคิวทั้งหมดให้ลดลง (-1)
  const updateQueueNumbers = async () => {
    const { error } = await supabase.rpc('decrement_queue_numbers'); // เรียก SQL Function (อธิบายด้านล่าง)
    if (error) console.error("Error updating queue:", error);
  };

  // ✅ ฟังก์ชันยกเลิกคิว
  const handleCancelQueue = async () => {
    if (!sessionId) return;

    // 1️⃣ ลบคิวของตัวเอง
    const { error: deleteError } = await supabase
      .from('queues')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      console.error("Error deleting queue:", deleteError);
      return;
    }

    // 2️⃣ อัพเดตให้คิวทุกคนเลื่อนขึ้น
    await updateQueueNumbers();

    // 3️⃣ รีเซ็ตค่า
    setQueueNumber(null);
    setCurrentState(State.Home);
    setCancelPrompt(false);
  };

  return (
    <div className={"flex flex-col items-center min-h-screen w-screen bg-white text-black overflow-hidden"}>
      {/* Timestamp and Status */}
      <div className="flex flex-col text-center mt-[20vh] mb-12">
        <p className="text-sm select-none">Session ID: {sessionId}</p>
        <p className="text-sm select-none">{currentTime ? currentTime : "Loading..."}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <p className="text-sm select-none">QYS Online</p>
        </div>
      </div>
      {
        currentState == State.Home && <>
          <div className={"flex flex-col items-center font-kanit font-weight-[100]" }>
            <p className={"text-[3.5rem] font-bold mb- mt-4 select-none "}>ชอบคนอ่านคับ</p>
            <p className={"text-3xl font-bold mb- mt- select-none "}>ละอ่านทำฃวยไรหล่ะ</p>
            <p className={"text-2xl font-bold mb-14 mt-6 select-none "}>หยอกน้าเตงๆ</p>

            <button className="mt-3 mb-32 px-auto py-3 w-[12rem] font-bold border-[2px] border-black text-1xl rounded-full bg-black text-white active:text-black active:bg-white select-none transition-all ease-out duration-100" onClick={handleQueue}>
              กดตรงนี้ๆ
            </button>
          </div>
        </>
      }
        
      {
        currentState == State.Queuing && (<>
          {/* Queue Number */}
          <h2 className="text-3xl font-kanit select-none">กดหาพ่อมึงอะไอ่ต้าววว 😝</h2>
          <p className="text-6xl font-bold mb-14 mt-4 select-none font-kanit">{queueNumber !== null ? queueNumber : "Loading..."}</p>

          {/* Buttons */}
          <button className="px-auto py-3 w-[12rem] font-bold border border-gray-300 bg-gray-300 text-gray-500 rounded-full cursor-not-allowed font-kanit select-none">
            ไก่มาได้มับ
          </button>
          <button className="mt-3 mb-32 px-auto py-[0.85rem] w-[12rem] font-bold border-[2px] border-black text-[0.9rem] rounded-full active:bg-black active:text-white select-none font-kanit transition-all ease-out duration-100" onClick={() => setCancelPrompt(true)}>
            ยกเลิก
          </button>
          {
            cancelPrompt == true && (<>
              <div className="flex z-0 bg-black bg-opacity-20 min-h-screen w-screen justify-center items-center absolute">
                <span className="relative z-10 p-7 bg-white w-[22rem] h-[10rem] rounded-[3rem] text-black">
                  <h1 className="text-2xl font-kanit">
                    ไม่รักเราแล้วอ่อ?
                  </h1>
                  <div className="flex flex-row w-[18.6rem] absolute gap-3 bottom-6">
                    <button className="basis-1/2 px-auto py-[0.85rem] w-[8rem] font-bold border-[2px] text-red-500 border-red-500 text-[0.9rem] rounded-full active:bg-red-500 active:text-white select-none font-kanit transition-all ease-out duration-100" onClick={handleCancelQueue}>
                      ยกเลิก
                    </button>
                    <button className="basis-1/2 px-auto py-[0.85rem] w-[8rem] font-bold border-[2px] border-black text-1xl rounded-full active:bg-white active:text-black text-white bg-black select-none font-kanit transition-all ease-out duration-100" onClick={() => setCancelPrompt(false)}>
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
