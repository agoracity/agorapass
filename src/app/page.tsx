import React from 'react'
import { UserGrid } from '@/components/ui/UserGrid'
import { communityData } from '@/config/site'

function page() {
  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <UserGrid communityData={communityData}/>
      </div>
    </div>
  )
}

export default page