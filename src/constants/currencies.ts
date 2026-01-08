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
    { label: '$', value: 'USD', name: '美元 (USD)' },
    { label: '€', value: 'EUR', name: '欧元 (EUR)' },
    { label: '¥(CNY)', value: 'CNY', name: '人民币 (CNY)' },
    { label: '£', value: 'GBP', name: '英镑 (GBP)' },
    { label: '¥(JPY)', value: 'JPY', name: '日元 (JPY)' },
    { label: '₹', value: 'INR', name: '印度卢比 (INR)' },
    { label: 'C$', value: 'CAD', name: '加拿大元 (CAD)' },
    { label: 'A$', value: 'AUD', name: '澳大利亚元 (AUD)' },
    { label: 'CHF', value: 'CHF', name: '瑞士法郎 (CHF)' },
    { label: '₩', value: 'KRW', name: '韩元 (KRW)' },
    { label: 'R$', value: 'BRL', name: '巴西雷亚尔 (BRL)' },
    { label: '₽', value: 'RUB', name: '俄罗斯卢布 (RUB)' },
    { label: 'MX$', value: 'MXN', name: '墨西哥比索 (MXN)' },
    { label: 'S$', value: 'SGD', name: '新加坡元 (SGD)' },
    { label: 'kr', value: 'SEK', name: '瑞典克朗 (SEK)' },
];

// 简化版本，只包含符号和值
export const CURRENCY_OPTIONS = CURRENCIES.map(currency => ({
    label: currency.label,
    value: currency.value
}));