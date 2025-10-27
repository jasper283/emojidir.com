import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // 从R2获取文件
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch asset' },
        { status: response.status }
      );
    }

    // 获取文件内容
    const blob = await response.blob();

    // 从URL中提取文件名
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split('/').pop() || 'emoji.png';

    // 返回文件，设置正确的headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download asset' },
      { status: 500 }
    );
  }
}

