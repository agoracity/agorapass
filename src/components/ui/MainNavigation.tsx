"use client"

import {  useCallback, useMemo } from "react"
import Link from 'next/link'
import { User, LogOut, UserCircle, HelpCircle } from 'lucide-react'
import { usePrivy, useLogin } from '@privy-io/react-auth'
import ProfileAvatar from "@/components/ui/ProfileAvatar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import AgoraLogo from "@/../public/agora.png"
import { siteName } from "@/config/site"
import { useWallets } from '@privy-io/react-auth';
import ZupassButton from "@/components/zupass/ui/ZupassButton";
import Swal from "sweetalert2"
import createUser from "@/utils/API/createUser"

export default function MainNavigation() {
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy()
  const isClient = typeof window !== 'undefined';
  const wallet = user?.wallet?.address || 'Unknown';
  const { wallets } = useWallets();
  const avatar = useMemo(() => isClient ? ProfileAvatar(wallet) : null, [wallet, isClient]);

  const handleNewUserCreation = useCallback(async (user: any) => {
    Swal.fire({
        title: 'Creating user...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to get access token. Please try again.'
        });
        return;
      }
        await createUser(user, accessToken);
        Swal.fire({
            icon: 'success',
            title: 'User created successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => window.location.reload());
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create user. Please try again.'
        });
    }
}, []);

  const { login } = useLogin({
    onComplete: async (user, isNewUser) => {
        if (isNewUser) await handleNewUserCreation(user);
    },
    onError: () => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Login failed. Please try again.'
        });
    },
});

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-transparent backdrop-blur-sm">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <Image src={AgoraLogo} alt={siteName} width={40} height={40} />
            <span className="text-xl font-bold text-primary hidden sm:inline">{siteName}</span>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          {ready && authenticated && user && (
            <ZupassButton user={user} text="Link Zupass" wallets={wallets} />
          )}
          {ready && authenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {avatar || (
                  <Avatar className="w-10 h-10 cursor-pointer transition-transform hover:scale-110">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User avatar" />
                    <AvatarFallback><User className="w-6 h-6" /></AvatarFallback>
                  </Avatar>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 text-white shadow-lg rounded-md border border-gray-700">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center hover:bg-gray-800 cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={"mailto:" + process.env.NEXT_PUBLIC_MAIL_SUPPORT} className='cursor-pointer'>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={logout} className="flex items-center text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={login} disabled={!ready || (ready && authenticated)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          )}
        </div>
      </nav>
      <div className="h-16"></div> {/* This div creates space for the fixed navbar */}
    </>
  )
}