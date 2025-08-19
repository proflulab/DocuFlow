/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 17:57:37
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-18 17:57:46
 * @FilePath: /next_word_auto/src/services/pdfConverter.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import axios from "axios";
import FormData from "form-data";

/**
 * 将DOCX文档转换为PDF的服务
 * @param docBuffer DOCX文档的Buffer数据
 * @returns PDF文档的Buffer数据
 */
export async function convertDocxToPdf(docBuffer: Buffer): Promise<Buffer> {
    const PDF_API_URL = process.env.PDF_CONVERTER_API;
    if (!PDF_API_URL) {
        throw new Error("PDF API URL 未配置");
    }

    // 创建 FormData 对象
    const form = new FormData();
    form.append("fileInput", docBuffer, {
        filename: "Lulab_invioce.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // 发送请求到 PDF 转换 API
    const response = await axios.post(PDF_API_URL, form, {
        headers: {
            ...form.getHeaders(),
            accept: "*/*",
        },
        responseType: "arraybuffer", // 接收二进制数据
    });

    return Buffer.from(response.data);
}