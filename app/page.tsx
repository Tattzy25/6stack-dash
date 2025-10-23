"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const handleSecretClick = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative">
        <img
          src="https://i.imgur.com/7LSHoSe.png"
          alt="TAT App Landing"
          className="max-w-full max-h-screen object-contain"
        />
        {/* Secret entrance - hidden clickable area */}
        <div
          onClick={handleSecretClick}
          className="absolute top-[25%] left-[35%] w-[30%] h-[20%] cursor-pointer opacity-0 hover:opacity-10 bg-white transition-opacity duration-200"
          title="Enter TAT App"
        />
      </div>
    </div>
  )
}
