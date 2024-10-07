import React from 'react'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { UserGrid } from '@/components/ui/UserGrid'
import { communityData } from '@/config/site'

function page() {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundBeams />
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 z-10"> {/* Add padding-top and horizontal padding */}
        <div className="max-w-7xl mx-auto"> {/* Center content and limit max width */}
          <UserGrid communityData={communityData}/>
        </div>
      </main>
    </div>
  )
}

export default page