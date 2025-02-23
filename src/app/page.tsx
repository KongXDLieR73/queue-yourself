"use client";

import WhiteButton from "@/components/white-button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-950">
      <div className="flex items-center justify-center border h-[3rem] w-[5rem] rounded-full bg-white">
        <div className="text-black">React</div>
      </div>
    </div>
  );
}
