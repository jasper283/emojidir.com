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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Load Comments
        </button>
      ) : (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">评论功能暂未启用</p>
        </div>
      )}
    </div>
  )
}
