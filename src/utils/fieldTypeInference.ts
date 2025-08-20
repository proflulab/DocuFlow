/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-01-27
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-19 15:21:40
 * @FilePath: /next_word_auto/src/utils/fieldTypeInference.ts
 * @Description: 字段类型智能推断工具
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { FieldConfig } from '../types';

/**
 * 根据字段名称智能推断字段类型
 * @param fieldName 字段名称
 * @returns 推断出的字段类型
 */
export const inferFieldType = (fieldName: string): FieldConfig['type'] => {
    const name = fieldName.toLowerCase();

    // 邮箱类型
    if (name.includes('email') || name.includes('邮箱') || name.includes('邮件')) {
        return 'email';
    }

    // 电话类型
    if (name.includes('phone') || name.includes('tel') || name.includes('mobile') ||
        name.includes('电话') || name.includes('手机') || name.includes('联系方式')) {
        return 'phone';
    }

    // 数字类型
    if (name.includes('number') || name.includes('num') || name.includes('count') ||
        name.includes('age') || name.includes('数量') || name.includes('年龄') ||
        name.includes('编号') || name.includes('序号')) {
        return 'number';
    }

    // 货币类型
    if (name.includes('price') || name.includes('cost') || name.includes('amount') ||
        name.includes('salary') || name.includes('money') || name.includes('价格') ||
        name.includes('金额') || name.includes('费用') || name.includes('工资') ||
        name.includes('薪资') || name.includes('￥') || name.includes('$')) {
        return 'currency';
    }

    // 日期类型
    if (name.includes('date') || name.includes('time') || name.includes('日期') ||
        name.includes('时间') || name.includes('生日') || name.includes('birthday') ||
        name.includes('created') || name.includes('updated')) {
        return 'date';
    }

    // 国家类型
    if (name.includes('country') || name.includes('nation') || name.includes('国家') ||
        name.includes('国籍') || name.includes('nationality')) {
        return 'country';
    }

    // 选择类型（通常包含这些关键词的是下拉选择）
    if (name.includes('status') || name.includes('type') || name.includes('category') ||
        name.includes('level') || name.includes('grade') || name.includes('状态') ||
        name.includes('类型') || name.includes('分类') || name.includes('等级')) {
        return 'select';
    }

    // 默认为文本类型
    return 'text';
};