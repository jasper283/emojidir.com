import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

// 图像元数据 - Next.js 会自动生成多种尺寸
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// SVG 图标路径 - 使用网站品牌色
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20%',
        }}
      >
        <div
          style={{
            fontSize: 200,
            display: 'flex',
          }}
        >
          😀
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
