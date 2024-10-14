import React from 'react'
import { UserGrid } from '@/components/ui/UserGrid'
import { communityData } from '@/config/site'
import { EnsNameSearch } from '@/components/ui/SearchBar'
import SeasonInfo from '@/components/ui/SeasonInfo'

function page() {
  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SeasonInfo />
      <EnsNameSearch
                  graphql={communityData.graphql}
                  platform={communityData.platform}
                  schema={communityData.schema}
                  chain={communityData.chainId}
                  verifyingContract={communityData.verifyingContract}
                />
        <UserGrid communityData={communityData}/>
      </div>
    </div>
  )
}

export default page