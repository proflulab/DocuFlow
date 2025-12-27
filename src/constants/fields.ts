/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 17:33:15
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-19 14:04:16
 * @FilePath: /next_word_auto/src/constants/fields.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { FieldConfig } from '../types';

// 字段类型选项
export const FIELD_TYPES = [
    { label: '文本', value: 'text' },
    { label: '邮箱', value: 'email' },
    { label: '数字', value: 'number' },
    { label: '号码', value: 'phone' },
    { label: '货币', value: 'currency' },
    { label: '日期', value: 'date' },
    { label: '国家', value: 'country' },
];

// 默认字段配置
export const DEFAULT_FIELDS: FieldConfig[] = [
    { id: '1', name: 'name', type: 'text', value: '', required: true },
    { id: '2', name: 'email', type: 'email', value: '', required: true },
    { id: '3', name: 'phone', type: 'phone', value: '', required: false },
    { id: '4', name: 'amount', type: 'currency', value: 0, required: false, format: { currencySymbol: '¥', decimalPlaces: 2 } },
];