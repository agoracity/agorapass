"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image";
import SearchBar from "@/components/ui/users/searchBar";
import Link from "next/link";
export default function Page() {
  return (
    <div className="flex items-center justify-center flex-grow ">
      <HeroHighlight className="flex-grow">
        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: [20, -5, 0],
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto"
        >
          <Card className=" bg-white bg-opacity-90 shadow-lg mt-8 flex flex-col items-center justify-center w-full">
            <CardHeader className="items-center justify-center w-full">
              <Image
                src="/agora.png"
                alt="Logo"
                width={130}
                height={130}
                className="select-none pointer-events-none"
              />
              <CardTitle className="text-center uppercase tracking-[3.5px] text-4xl font-extralight pb-4">Agorapass</CardTitle>
              <SearchBar />
              <CardDescription className="text-center w-full flex justify-evenly items-center flex-col gap-y-2">
                <Link href='/agora/profiles' className="underline">Or check some profiles</Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </motion.h1>
      </HeroHighlight>
    </div>
  );
}
