"use client";
import { motion } from "framer-motion";
import { HeroHighlight } from "@/components/ui/hero-highlight";
import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import Image from "next/image";
import { FlipWords } from "@/components/ui/flip-words";
import { usePrivy, useLogin } from '@privy-io/react-auth';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Page() {
  const words = ["get_vouched", "gain_trust_scrore", "mint_pass", "vouch_new_members"];
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  const { login } = useLogin({
    onComplete: () => {
      if (ready) {
        router.push('/profiles');
      }
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Login failed. Please try again.'
      });
    },
  });

  const handleStartVouching = () => {
    if (!ready) {
      // Wait for authentication state to be ready
      return;
    }
    if (!authenticated) {
      login();
    } else {
      router.push('/profiles');
    }
  };

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
          <Card className="p-8 bg-white bg-opacity-90 shadow-lg mt-8 flex flex-col items-center justify-center w-full">
            <CardHeader className="items-center justify-center w-full">
              <Image
                src="/agora.png"
                alt="Logo"
                width={130}
                height={130}
                className="select-none pointer-events-none"
              />
              <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
                Agora Pass
              </div>
              <sup className="text-xs">
                Beta
              </sup>
            </CardHeader>

            <div className="text-center w-full flex justify-evenly items-center flex-col gap-y-2">
              <div className="text-xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
                <FlipWords words={words} />
              </div>
              <button onClick={handleStartVouching} className="px-8 py-0.5 border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]">
                Start vouching
              </button>
            </div>

          </Card>
        </motion.h1>
      </HeroHighlight>
    </div>
  );
}
