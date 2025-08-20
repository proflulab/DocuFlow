/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 13:15:00
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-01-27 10:30:00
 * @FilePath: /next_word_auto/src/utils/blob.ts
 * @Description: Vercel Blob 相关工具函数 - 提供完整的增删改查功能用于模板管理
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { list, head, put, del } from "@vercel/blob";

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

/**
 * 上传文件到 Vercel Blob
 * @param pathname 文件路径名
 * @param file 文件对象或文件内容
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadToBlob(
    pathname: string,
    file: File | Buffer | string | ReadableStream,
    options?: {
        access?: 'public';
        addRandomSuffix?: boolean;
        allowOverwrite?: boolean;
        cacheControlMaxAge?: number;
        contentType?: string;
        token?: string;
        multipart?: boolean;
        abortSignal?: AbortSignal;
        onUploadProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
    }
) {
    try {
        const defaultOptions = {
            access: 'public' as const,
            addRandomSuffix: true,
            ...options
        };

        const blob = await put(pathname, file, defaultOptions);
        return blob;
    } catch (error) {
        console.error('上传文件到 Blob 失败:', error);
        throw error;
    }
}

/**
 * 删除 Blob 中的文件
 * @param urlOrPathname 要删除的文件 URL 或路径名
 * @param options 删除选项
 * @returns 删除结果
 */
export async function deleteFromBlob(
    urlOrPathname: string,
    options?: {
        token?: string;
        abortSignal?: AbortSignal;
    }
) {
    try {
        await del(urlOrPathname, options);
        return { success: true, message: '文件删除成功' };
    } catch (error) {
        console.error('删除 Blob 文件失败:', error);
        throw error;
    }
}

/**
 * 列出 Blob 存储中的所有文件
 * @param options 列表选项
 * @returns 文件列表
 */
export async function listBlobFiles(
    options?: {
        limit?: number;
        prefix?: string;
        cursor?: string;
        mode?: 'folded' | 'expanded';
        token?: string;
        abortSignal?: AbortSignal;
    }
) {
    try {
        const result = await list(options);
        return result;
    } catch (error) {
        console.error('获取 Blob 文件列表失败:', error);
        throw error;
    }
}

/**
 * 根据前缀查找模板文件
 * @param prefix 文件前缀
 * @param options 查询选项
 * @returns 匹配的文件列表
 */
export async function findTemplatesByPrefix(
    prefix: string,
    options?: {
        limit?: number;
        token?: string;
        abortSignal?: AbortSignal;
    }
) {
    try {
        const { blobs } = await list({
            prefix,
            ...options
        });
        return blobs;
    } catch (error) {
        console.error('查找模板文件失败:', error);
        throw error;
    }
}

/**
 * 检查文件是否存在
 * @param pathname 文件路径名
 * @param options 检查选项
 * @returns 文件是否存在
 */
export async function checkBlobExists(
    pathname: string,
    options?: {
        token?: string;
        abortSignal?: AbortSignal;
    }
): Promise<boolean> {
    try {
        await head(pathname, options);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 更新文件（先删除再上传）
 * @param pathname 文件路径名
 * @param file 新的文件内容
 * @param options 更新选项
 * @returns 更新结果
 */
export async function updateBlobFile(
    pathname: string,
    file: File | Buffer | string | ReadableStream,
    options?: {
        access?: 'public';
        cacheControlMaxAge?: number;
        contentType?: string;
        token?: string;
        multipart?: boolean;
        abortSignal?: AbortSignal;
        onUploadProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
    }
) {
    try {
        // 检查文件是否存在
        const exists = await checkBlobExists(pathname, { token: options?.token });

        if (exists) {
            // 如果存在，先删除
            await deleteFromBlob(pathname, { token: options?.token });
        }

        // 重新上传
        const blob = await uploadToBlob(pathname, file, {
            ...options,
            addRandomSuffix: false, // 更新时不添加随机后缀
            allowOverwrite: true
        });

        return blob;
    } catch (error) {
        console.error('更新 Blob 文件失败:', error);
        throw error;
    }
}