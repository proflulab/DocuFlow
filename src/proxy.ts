/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2024-11-06 18:35:00
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-16 03:33:55
 * @FilePath: /next_word_auto/src/middleware.ts
 * @Description: 路由中间件，处理密码验证
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // 获取当前路径
  const { pathname } = request.nextUrl

  // 检查是否配置了密码环境变量
  const password = process.env.NEXT_PUBLIC_PASSWORD

  // 如果没有配置密码环境变量，直接通过所有请求
  if (!password) {
    return NextResponse.next()
  }

  // 不需要验证的路径
  const publicPaths = ['/', '/password']

  // 如果是公开路径，直接通过
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // 检查是否已经验证
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value

  // 如果没有验证，重定向到密码页面
  if (isAuthenticated !== 'true') {
    return NextResponse.redirect(new URL('/password', request.url))
  }

  // 验证通过，继续访问
  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}