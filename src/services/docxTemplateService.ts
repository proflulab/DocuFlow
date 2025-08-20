import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";

// 动态文档数据类型
export type DocumentData = Record<string, string | number | boolean | Date>;

/**
 * 生成DOCX文档的通用函数
 * @param data 文档数据
 * @param input 输入参数，可以是文件路径、Buffer或二进制字符串
 * @param inputType 输入类型：'path' | 'buffer' | 'binary'
 * @returns DOCX文档的Buffer数据
 */
export async function generateDocxBuffer(
    data: DocumentData,
    input: string | Buffer,
    inputType: 'path' | 'buffer' | 'binary' = 'path'
): Promise<Buffer> {
    let content: string;

    switch (inputType) {
        case 'path':
            if (typeof input !== 'string') {
                throw new Error('输入类型为path时，input必须是字符串');
            }
            content = fs.readFileSync(input, "binary");
            break;
        case 'buffer':
            if (!Buffer.isBuffer(input)) {
                throw new Error('输入类型为buffer时，input必须是Buffer');
            }
            content = input.toString('binary');
            break;
        case 'binary':
            if (typeof input !== 'string') {
                throw new Error('输入类型为binary时，input必须是字符串');
            }
            content = input;
            break;
        default:
            throw new Error('不支持的输入类型');
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        linebreaks: true,
        paragraphLoop: true,
    });

    // 渲染模板的变量，直接使用传入的数据
    doc.render(data);

    // 生成文档为 buffer
    return doc.getZip().generate({
        type: "nodebuffer",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
}

/**
 * 获取模板字段的通用函数
 * @param input 输入参数，可以是文件路径、Buffer或二进制字符串
 * @param inputType 输入类型：'path' | 'buffer' | 'binary'
 * @returns 模板中的字段名数组
 */
export async function getTemplateFields(
    input: string | Buffer,
    inputType: 'path' | 'buffer' | 'binary' = 'path'
): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const InspectModule = require("docxtemplater/js/inspect-module");
    const iModule = InspectModule();
    let content: string;

    switch (inputType) {
        case 'path':
            if (typeof input !== 'string') {
                throw new Error('输入类型为path时，input必须是字符串');
            }
            content = fs.readFileSync(input, "binary");
            break;
        case 'buffer':
            if (!Buffer.isBuffer(input)) {
                throw new Error('输入类型为buffer时，input必须是Buffer');
            }
            content = input.toString('binary');
            break;
        case 'binary':
            if (typeof input !== 'string') {
                throw new Error('输入类型为binary时，input必须是字符串');
            }
            content = input;
            break;
        default:
            throw new Error('不支持的输入类型');
    }

    const zip = new PizZip(content);

    // 只解析，不渲染
    new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [iModule],        // 挂载模块
    });

    // 拿到所有占位符（字段名）
    const tagsObj = iModule.getAllTags(); // { first_name: null, last_name: null, ... }
    const fieldNames = Object.keys(tagsObj);
    console.log("模板字段：", fieldNames);

    // 提取所有占位符
    return fieldNames;
}
