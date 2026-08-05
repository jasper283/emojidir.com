'use client'

import siteMetadata from '@/data/siteMetadata'
import { useState } from 'react'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  // 如果没有配置评论系统，直接返回 null
  if (!siteMetadata.comments?.provider) {
    return null
  }

  // 简化版评论组件
  return (
    <div className="mt-8">
      {!loadComments ? (
        <button
          onClick={() => setLoadComments(true)}
          className="clay-button-press cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Load Comments
        </button>
      ) : (
        <div className="clay-card-soft p-4">
          <p className="text-sm font-semibold text-muted-foreground">评论功能暂未启用</p>
        </div>
      )}
    </div>
  )
}
