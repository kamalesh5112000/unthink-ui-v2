import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

const CollectionDetail = () => {
  const router = useRouter()
  const { collection_name } = router.query

  useEffect(() => {
    if (!router.isReady || !collection_name) return;
    router.replace(`/kiosk/collections/${collection_name}`);
  }, [collection_name, router]);

  return null
}
    
export default CollectionDetail
