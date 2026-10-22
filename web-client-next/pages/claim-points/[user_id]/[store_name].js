import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

const ClaimPointContainer = () => {
  const router = useRouter()
  const { isReady, query, replace } = router

  useEffect(() => {
    if (!isReady) return

    replace({
      pathname: '/store-assistant',
      query: {
        tab: 'redeem',
        mode: 'points',
        user_id: query.user_id,
        store_name: query.store_name,
      },
    })
  }, [isReady, query.store_name, query.user_id, replace])

  return (
    <div />
  )
}

export default ClaimPointContainer
