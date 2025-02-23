"use client";

import WhiteButton from "@/components/white-button";
import Clock from "@/components/clock";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home Page</title>
      </Head>
      <Clock/>
      <div className="flex items-center justify-center h-screen w-screen bg-gray-950">
        <div className="flex items-center justify-center border h-[3rem] w-[5rem] rounded-full bg-white">
          <div className="text-black">React</div>
        </div>
      </div>
      <h1 className="text-center text-3xl font-bold mt-10 text-white">Welcome to the Home Page</h1>
    </>
  );
}
