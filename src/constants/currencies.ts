/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 17:37:37
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-18 17:37:49
 * @FilePath: /next_word_auto/src/constants/currencies.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
// 排名前15的国家货币符号
export const CURRENCIES = [
    { label: '$', value: '$', name: '美元 (USD)' },
    { label: '€', value: '€', name: '欧元 (EUR)' },
    { label: '¥', value: '¥', name: '人民币 (CNY)' },
    { label: '£', value: '£', name: '英镑 (GBP)' },
    { label: '¥', value: '¥', name: '日元 (JPY)' },
    { label: '₹', value: '₹', name: '印度卢比 (INR)' },
    { label: 'C$', value: 'C$', name: '加拿大元 (CAD)' },
    { label: 'A$', value: 'A$', name: '澳大利亚元 (AUD)' },
    { label: 'CHF', value: 'CHF', name: '瑞士法郎 (CHF)' },
    { label: '₩', value: '₩', name: '韩元 (KRW)' },
    { label: 'R$', value: 'R$', name: '巴西雷亚尔 (BRL)' },
    { label: '₽', value: '₽', name: '俄罗斯卢布 (RUB)' },
    { label: 'MX$', value: 'MX$', name: '墨西哥比索 (MXN)' },
    { label: 'S$', value: 'S$', name: '新加坡元 (SGD)' },
    { label: 'kr', value: 'kr', name: '瑞典克朗 (SEK)' },
];

// 简化版本，只包含符号和值
export const CURRENCY_OPTIONS = CURRENCIES.map(currency => ({
    label: currency.label,
    value: currency.value
}));