import { NextRequest, NextResponse } from 'next/server'
import { listBlobFiles } from '@/utils/blob'
import path from 'path'

// 允许的外部下载域名白名单（可通过环境变量扩展）
const DEFAULT_ALLOWED_DOMAINS = ['blob.vercel-storage.com', 'your-cdn.com']
const ENV_ALLOWED = process.env.ALLOWED_BLOB_DOMAINS
  ? process.env.ALLOWED_BLOB_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
  : []
const ALLOWED_DOMAINS = [...new Set([...DEFAULT_ALLOWED_DOMAINS, ...ENV_ALLOWED])]

function isUrlAllowed(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url)
    // 仅允许 HTTPS，且域名必须在白名单中（支持子域名）
    return protocol === 'https:' && ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
}

// 通过 pathname 代理下载并回传 DOCX 文件，避免前端直链 404
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const pathname = searchParams.get('pathname')
    // 同时兼容 directUrl 和 url 两种参数名
    const directUrl = searchParams.get('directUrl') || searchParams.get('url')
    const providedName = searchParams.get('name')

    if (!pathname) {
      return NextResponse.json(
        { success: false, error: '缺少 pathname 参数' },
        { status: 400 }
      )
    }

    // 如果提供了直接 URL（通常是 downloadUrl），优先使用它
    let targetUrl: string | undefined = directUrl || undefined

    // 校验直接传入的 URL，防止 SSRF
    if (directUrl && !isUrlAllowed(directUrl)) {
      return NextResponse.json(
        { success: false, error: '不允许的 URL' },
        { status: 400 }
      )
    }

    // 否则，使用列表查询定位到指定 pathname 的 Blob，再取其 downloadUrl
    if (!targetUrl) {
      const dir = path.dirname(pathname)
      const prefix = dir && dir !== '.' ? `${dir}/` : undefined
      const result = await listBlobFiles(prefix ? { prefix } : undefined)
      const blob = result?.blobs?.find((b: any) => b.pathname === pathname)
      if (!blob) {
        return NextResponse.json(
          { success: false, error: '未找到指定模板文件' },
          { status: 404 }
        )
      }
      targetUrl = blob.downloadUrl || blob.url
    }
    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: '未获取到可下载地址' },
        { status: 404 }
      )
    }

    // 最终下载地址再做一次域名/协议校验，双保险
    if (!isUrlAllowed(targetUrl)) {
      return NextResponse.json(
        { success: false, error: '不允许的目标地址' },
        { status: 400 }
      )
    }

    const resp = await fetch(targetUrl)
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return NextResponse.json(
        { success: false, error: `下载失败: ${resp.status} ${resp.statusText}`, detail: text },
        { status: resp.status }
      )
    }

    const buf = await resp.arrayBuffer()
    let fileName = providedName || (pathname ? pathname.split('/').pop() : undefined) || 'template.docx'
    if (!providedName && directUrl) {
      try {
        const u = new URL(directUrl)
        const base = path.basename(u.pathname)
        if (base) fileName = base
      } catch {}
    }

    // 直接返回为 DOCX，统一前端渲染类型
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('模板预览代理失败:', error)
    return NextResponse.json(
      { success: false, error: '模板预览代理失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}