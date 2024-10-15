"use client"

import { useCallback, useMemo, useEffect, useState } from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut, UserCircle, HelpCircle, Menu, Home, Info, GitBranch } from 'lucide-react'
import { usePrivy, useLogin, useWallets } from '@privy-io/react-auth'
import ProfileAvatar from "@/components/ui/ProfileAvatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import AgoraLogo from "@/../public/agora.png"
import { siteName } from "@/config/site"
import ZupassButton from "@/components/zupass/ui/ZupassButton"
import Swal from "sweetalert2"
import createUser from "@/utils/API/createUser"
import PODWrapper from "@/components/zupass/POD/Wrapper"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const menuItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/graph", icon: GitBranch, label: "Graph" },
  { href: "/about", icon: Info, label: "About" },
]

export default function MainNavigation() {
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy()
  const [hasZupass, setHasZupass] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [rankScore, setRankScore] = useState<number | null>(null)
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { wallets } = useWallets()

  const isClient = typeof window !== 'undefined'
  const wallet = user?.wallet?.address || 'Unknown'
  const avatar = useMemo(() => isClient ? ProfileAvatar(wallet) : null, [wallet, isClient])
  const neededScore = Number(process.env.NEXT_PUBLIC_NEEDED_SCORE) || 0

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.wallet?.address) {
        try {
          const response = await fetch(`/api/users/wallet/${user.wallet.address}`)
          if (response.ok) {
            const data = await response.json()
            setHasZupass(!!data.zupass)
            setRankScore(data.rankScore)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }

    if (authenticated && user) {
      fetchUserData()
    }
  }, [authenticated, user])

  useEffect(() => {
    const fetchAccessToken = async () => {
      if (authenticated && user) {
        const token = await getAccessToken()
        setAccessToken(token)
      }
    }

    fetchAccessToken()
  }, [authenticated, user, getAccessToken])

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
  }, [getAccessToken]);

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

  const handleLinkClick = useCallback(() => {
    setIsSheetOpen(false)
  }, [])

  const renderMobileMenu = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 text-lg ${pathname === item.href ? 'text-[#19473f] font-semibold' : 'text-foreground'}`}
              onClick={handleLinkClick}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )

  const renderDesktopMenu = () => (
    <div className="hidden lg:flex items-center space-x-4">
      {menuItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          asChild
        >
          <Link
            href={item.href}
            className={`flex items-center space-x-2 ${pathname === item.href ? 'bg-[#19473f] text-white' : ''}`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  )

  const renderUserActions = () => (
    <div className="flex items-center space-x-4">
      {ready && authenticated && user && (
        <ZupassButton
          user={user}
          text={hasZupass ? "Refresh Zupass" : "Link Zupass"}
          wallets={wallets}
        />
      )}
      {ready && authenticated && user && rankScore !== null && rankScore >= neededScore && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Get AgoraPass</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Get AgoraPass</DialogTitle>
            </DialogHeader>
            {accessToken ? (
              <PODWrapper user={user} accessToken={accessToken} />
            ) : (
              <div>Loading...</div>
            )}
          </DialogContent>
        </Dialog>
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href={`/address/${wallet}`} className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={"mailto:" + process.env.NEXT_PUBLIC_MAIL_SUPPORT} className='cursor-pointer flex items-center'>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={login} disabled={!ready || (ready && authenticated)}>
          Sign In
        </Button>
      )}
    </div>
  )

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
        <Link href="/">
          <div className="flex items-center space-x-2 relative">
            <Image src={AgoraLogo} alt={siteName} width={40} height={40} />
            <span className="text-xl font-bold text-primary hidden sm:inline">{siteName}</span>
            <span className="text-xs italic text-primary top-0 right-0 -mt-2">Beta</span>
          </div>
        </Link>

        {renderMobileMenu()}
        {renderDesktopMenu()}
        {renderUserActions()}
      </nav>

      <div className="h-16"></div> {/* Spacer for the fixed navbar */}
    </>
  )
}