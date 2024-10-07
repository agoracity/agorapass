import React from 'react'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { UserGrid } from '@/components/ui/UserGrid'
import { communityData } from '@/config/site'

function page() {
  return (
    <div className="min-h-screen flex flex-col bg-black"> {/* Add bg-black here */}
      <BackgroundBeams />
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <UserGrid communityData={communityData}/>
        </div>
      </main>
    </div>
  )
}

export default page