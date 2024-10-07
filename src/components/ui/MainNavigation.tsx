"use client"

import { useState, useMemo } from "react"
import Link from 'next/link'
import { User, LogOut, UserCircle, HelpCircle } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
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

export default function MainNavigation() {
  const { ready, authenticated, login, user, logout } = usePrivy()
  const isClient = typeof window !== 'undefined';
  const wallet = user?.wallet?.address || 'Unknown';
  const avatar = useMemo(() => isClient ? ProfileAvatar(wallet) : null, [wallet, isClient]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-transparent">
      <Link href="/">
        <div className="flex items-center space-x-2">
          <Image src={AgoraLogo} alt={siteName} width={40} height={40} />
          <span className="text-xl font-bold text-primary">{siteName}</span>
        </div>
      </Link>
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
          <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg rounded-md border border-gray-200">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Contact Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem onClick={logout} className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50">
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
    </nav>
  )
}