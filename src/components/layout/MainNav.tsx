"use client"
import React from 'react'
import Link from 'next/link'
import ProfileAvatar from '@/components/auth/ProfileAvatar'
import Logo from "../../../public/agora.png";
import Image from 'next/image';
import { navSections } from '@/config/siteConfig';
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react'

import { useState } from 'react';

function MainNav() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <div className='flex flex-col'>
            <div className='flex flex-row w-full items-center gap-1 p-4'>
                <div className='sm:w-full flex justify-start'>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger className="lg:hidden">
                            <Menu className="h-6 w-6" />
                        </SheetTrigger>
                        <SheetContent side="left">
                            <div className='flex flex-col gap-4 mt-8'>
                                {navSections.map((section, index) => (
                                    <Link
                                        key={index}
                                        href={section.href}
                                        className={`${section.className} ${pathname === section.href ? 'text-accentdark font-medium' : 'text-muted-foreground'} text-lg`}
                                        onClick={handleLinkClick}
                                    >
                                        {section.label}
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Link
                        href="/"
                        className="hidden lg:flex items-center gap-2 text-lg font-semibold md:text-base shrink-0"
                    >
                        <Image
                            src={Logo}
                            alt="Company Logo"
                            width={20}
                            height={20}
                        />
                        <span>Agora Pass </span>
                        <sup>Beta</sup>
                    </Link>
                </div>
                <div className='w-full flex justify-center'>
                    <div className='hidden lg:flex flex-row bg-white rounded-full border border-gray-200 font-medium shadow-md lg:gap-4 lg:text-lg'>
                        {navSections.map((section, index) => (
                            <Link
                                key={index}
                                href={section.href}
                                className={`${section.className} ${pathname === section.href ? 'text-accentdark bg-primarydark font-medium hover:text-white' : 'text-muted-foreground'} text-nowrap py-1 px-2 rounded-full`}
                            >
                                {section.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className='min-w-[24px] sm:w-full flex justify-end'><ProfileAvatar /></div>

            </div>
        </div>
    )
}

export default MainNav