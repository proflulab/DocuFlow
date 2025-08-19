/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 17:30:30
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-19 14:05:17
 * @FilePath: /next_word_auto/src/utils/validation.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { z } from 'zod';
import { FieldConfig } from '../types';

// 字段校验规则
export const createFieldSchema = (field: FieldConfig) => {
    switch (field.type) {
        case 'text':
            return z.string().min(1, `${field.name}不能为空`);
        case 'email':
            return z.email({ message: `${field.name}格式不正确` });
        case 'number':
            return z.string().regex(/^\d+$/, `${field.name}必须是数字`);
        case 'phone':
            return z.string().regex(/^1[3-9]\d{9}$/, `${field.name}格式不正确`);
        case 'currency':
            return z.string().regex(/^\d+(\.\d{1,2})?$/, `${field.name}格式不正确`);
        case 'date':
            return z.string().min(1, `请选择${field.name}`);
        case 'select':
        case 'country':
            return z.string().min(1, `请选择${field.name}`);
        default:
            return z.string().min(1, `${field.name}不能为空`);
    }
};

// 创建完整的表单校验规则
export const createFormSchema = (fields: FieldConfig[]) => {
    const schemaObject: Record<string, z.ZodTypeAny> = {};
    fields.forEach(field => {
        if (field.required !== false) { // 默认为必填
            schemaObject[field.name] = createFieldSchema(field);
        }
    });
    return z.object(schemaObject);
};