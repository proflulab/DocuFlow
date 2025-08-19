/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 13:15:00
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-16 13:14:11
 * @FilePath: /next_word_auto/src/utils/blob.ts
 * @Description: Vercel Blob 相关工具函数
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { list, head } from "@vercel/blob";

/**
 * 从 Vercel Blob 获取模板文件
 * @param templateName 模板文件名
 * @returns 模板文件的 Buffer
 */
export async function getTemplateFromBlob(templateName: string): Promise<Buffer> {
    try {
        // 列出 blob 存储中的文件
        const { blobs } = await list();

        // 查找指定的模板文件
        const templateBlob = blobs.find(blob =>
            blob.pathname.includes(templateName) ||
            blob.pathname.endsWith(templateName)
        );

        if (!templateBlob) {
            throw new Error(`模板文件 ${templateName} 未找到`);
        }

        // 通过 URL 获取文件内容
        const response = await fetch(templateBlob.url);
        if (!response.ok) {
            throw new Error(`获取模板文件失败: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('从 Vercel Blob 获取模板失败:', error);
        throw error;
    }
}

/**
 * 获取 Blob 对象的元数据
 * @param urlOrPathname Blob 对象的 URL 或路径名
 * @param options 可选参数
 * @returns Blob 对象的元数据
 */
export async function getBlobMetadata(
    urlOrPathname: string,
    options?: {
        token?: string;
        abortSignal?: AbortSignal;
    }
) {
    try {
        const blobDetails = await head(urlOrPathname, options);
        return blobDetails;
    } catch (error) {
        console.error('获取 Blob 元数据失败:', error);
        throw error;
    }
}