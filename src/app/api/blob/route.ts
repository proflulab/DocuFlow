/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-01-27 10:30:00
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-01-27 10:30:00
 * @FilePath: /next_word_auto/src/app/api/blob/route.ts
 * @Description: Blob 存储 API 路由 - 提供完整的文件管理功能
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listBlobFiles,
  uploadToBlob,
  deleteFromBlob,
  getBlobMetadata
} from '@/utils/blob';

/**
 * GET - 获取文件列表或单个文件元数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const pathname = searchParams.get('pathname');
    const prefix = searchParams.get('prefix');
    const limit = searchParams.get('limit');

    if (action === 'metadata' && pathname) {
      // 获取单个文件的元数据
      const metadata = await getBlobMetadata(pathname);
      return NextResponse.json({
        success: true,
        data: metadata
      });
    } else {
      // 获取文件列表
      const options: { prefix?: string; limit?: number } = {};
      if (prefix) options.prefix = prefix;
      if (limit) options.limit = parseInt(limit);

      const result = await listBlobFiles(options);
      return NextResponse.json({
        success: true,
        data: result
      });
    }
  } catch (error) {
    console.error('获取 Blob 数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取数据失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 上传文件
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pathname = formData.get('pathname') as string;
    const addRandomSuffix = formData.get('addRandomSuffix') === 'true';
    const allowOverwrite = formData.get('allowOverwrite') === 'true';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少文件参数'
        },
        { status: 400 }
      );
    }

    if (!pathname) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少文件路径参数'
        },
        { status: 400 }
      );
    }

    const blob = await uploadToBlob(pathname, file, {
      access: 'public',
      addRandomSuffix,
      allowOverwrite,
      contentType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    return NextResponse.json({
      success: true,
      data: blob
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '上传文件失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除文件
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');

    if (!pathname) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少文件路径参数'
        },
        { status: 400 }
      );
    }

    await deleteFromBlob(pathname);

    return NextResponse.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除文件失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}