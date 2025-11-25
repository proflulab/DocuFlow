/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 03:16:37
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-20 13:05:28
 * @FilePath: /next_word_auto/src/app/certificate/page.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Button, Card, Space, Typography, message, Popconfirm, DatePicker, Select, Input, InputNumber, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, CloudOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import TemplatePreview from '../../components/preview/TemplatePreview';
import DocumentGenerator from '../../components/generators/DocumentGenerator';
import dayjs from 'dayjs';
import { COUNTRIES } from '../../constants/countries';
import { FIELD_TYPES, DEFAULT_FIELDS } from '../../constants/fields';
import { CURRENCY_OPTIONS } from '../../constants/currencies';
import { FieldConfig, CloudTemplate } from '../../types';
import { getCachedFilesMetadata, isLocalCacheSupported, formatFileSize, CachedFile, getFileFromCache } from '../../utils/localCache';
import { inferFieldType } from '../../utils/fieldTypeInference';


const { Title } = Typography;

export default function CertificatePage() {

  const [fields, setFields] = useState<FieldConfig[]>(DEFAULT_FIELDS);
    const [formData, setFormData] = useState<Record<string, string | number | boolean | null | undefined>>({});
    const [cloudTemplateName, setCloudTemplateName] = useState<string>('');
    const [cloudTemplates, setCloudTemplates] = useState<CloudTemplate[]>([]);
    const [localTemplates, setLocalTemplates] = useState<CachedFile[]>([]);
    const [localTemplateId, setLocalTemplateId] = useState<string>('');
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTemplateUrl, setPreviewTemplateUrl] = useState<string>('');
    const [previewTemplateName, setPreviewTemplateName] = useState<string>('');
    const [templateSource, setTemplateSource] = useState<string>('blob');

    // 获取云端模板列表
    const fetchCloudTemplates = useCallback(async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await fetch('/api/templates');
            const result = await response.json();

            if (result.success) {
                setCloudTemplates(result.templates);
                // 如果当前选择的模板不在列表中，清空选择
                if (cloudTemplateName && !result.templates.some((t: CloudTemplate) => t.name === cloudTemplateName)) {
                    setCloudTemplateName('');
                }
            } else {
                message.error(result.message || '获取云端模板列表失败');
                setCloudTemplates([]);
            }
        } catch (error) {
            console.error('获取云端模板列表失败:', error);
            message.error('获取云端模板列表失败');
            setCloudTemplates([]);
        } finally {
            setIsLoadingTemplates(false);
        }
    }, [cloudTemplateName]);

    // 获取本地缓存模板列表
    const fetchLocalTemplates = useCallback(() => {
        if (!isLocalCacheSupported()) {
            message.warning('当前浏览器不支持本地缓存功能');
            return;
        }
        try {
            const metadata = getCachedFilesMetadata();
            setLocalTemplates(metadata);
            // 如果当前选择的本地模板不在列表中，清空选择
            if (localTemplateId && !metadata.some((f: CachedFile) => f.id === localTemplateId)) {
                setLocalTemplateId('');
            }
        } catch (error) {
            console.error('加载本地缓存模板失败:', error);
            message.error('加载本地缓存模板失败');
            setLocalTemplates([]);
        }
    }, [localTemplateId]);

    // 组件初始化时获取云端模板列表
    React.useEffect(() => {
        const initializeComponent = async () => {
            try {
                await fetchCloudTemplates();
                fetchLocalTemplates();
            } catch (error) {
                console.error('Failed to fetch cloud templates:', error);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeComponent();
    }, [fetchCloudTemplates, fetchLocalTemplates]);

    // 当切换到本地来源时，刷新本地模板列表
    React.useEffect(() => {
        if (templateSource === 'local') {
            fetchLocalTemplates();
        }
    }, [templateSource, fetchLocalTemplates]);

    // 添加新字段
    const addField = () => {
        const newField: FieldConfig = {
            id: Date.now().toString(),
            name: `field_${Date.now()}`,
            type: 'text',
            value: '',
            required: false,
            format: {},
        };
        setFields([...fields, newField]);
    };

    // 删除字段
    const deleteField = (id: string) => {
        setFields(fields.filter(field => field.id !== id));
    };

    // 更新字段配置
    const updateField = (id: string, updates: Partial<FieldConfig>) => {
        setFields(fields.map(field =>
            field.id === id ? { ...field, ...updates } : field
        ));
    };

    // 自动配置字段
    const autoConfigureFields = async () => {
        // 根据来源判断选择是否有效
        if (templateSource === 'blob') {
            if (!cloudTemplateName) {
                message.warning('请先选择一个云端模板');
                return;
            }
        } else if (templateSource === 'local') {
            if (!localTemplateId) {
                message.warning('请先选择一个本地模板');
                return;
            }
        } else {
            message.warning('暂未支持该模板来源');
            return;
        }

        setIsAutoConfiguring(true);
        const hideLoading = message.loading('正在分析模板字段...', 0);

        try {
            const formData = new FormData();

            if (templateSource === 'blob') {
                // 直接从已加载的 cloudTemplates 中找到选中的模板
                const selectedTemplate = cloudTemplates.find((t: CloudTemplate) => t.name === cloudTemplateName);
                if (!selectedTemplate) {
                    throw new Error('指定的模板文件不存在');
                }

                // 下载模板文件
                const templateResponse = await fetch(selectedTemplate.url);
                const templateBlob = await templateResponse.blob();

                // 创建 FormData（云端）
                formData.append('template', templateBlob, cloudTemplateName);
            } else {
                // 从本地缓存读取文件
                const file = await getFileFromCache(localTemplateId);
                if (!file) {
                    throw new Error('指定的本地模板文件不存在');
                }
                // 创建 FormData（本地）
                formData.append('template', file, file.name);
            }

            const response = await fetch('/api/template-fields', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success && result.fields) {
                const autoFields: FieldConfig[] = result.fields.map((fieldName: string, index: number) => ({
                    id: `auto_${Date.now()}_${index}`,
                    name: fieldName,
                    type: inferFieldType(fieldName),
                    value: '',
                    required: false,
                    format: {},
                }));

                setFields(autoFields);
                hideLoading();
                message.success({
                    content: `🎉 成功自动配置 ${result.fields.length} 个字段！`,
                    duration: 3,
                });
            } else {
                hideLoading();
                message.error({
                    content: result.message || '❌ 获取模板字段失败，请检查模板格式',
                    duration: 4,
                });
            }
        } catch (error) {
            console.error('自动配置字段失败:', error);
            hideLoading();
            message.error({
                content: '❌ 自动配置字段失败，请检查网络连接后重试',
                duration: 4,
            });
        } finally {
            setIsAutoConfiguring(false);
        }
    };

    // 渲染格式配置组件
    const renderFormatConfig = (field: FieldConfig) => {
        switch (field.type) {
            case 'currency':
                return (
                    <div className="flex gap-2">
                        <Select
                            value={field.format?.currencySymbol || '¥'}
                            onChange={(value) => updateField(field.id, {
                                format: { ...field.format, currencySymbol: value }
                            })}
                            size="small"
                            className="w-16"
                            options={CURRENCY_OPTIONS}
                        />
                        <Select
                            value={field.format?.decimalPlaces ?? 2}
                            onChange={(value) => updateField(field.id, {
                                format: { ...field.format, decimalPlaces: value }
                            })}
                            size="small"
                            className="w-20"
                            options={[
                                { label: '0位', value: 0 },
                                { label: '1位', value: 1 },
                                { label: '2位', value: 2 },
                                { label: '3位', value: 3 },
                            ]}
                        />
                    </div>
                );
            case 'date':
                return (
                    <Select
                        value={field.format?.dateFormat || 'YYYY-MM-DD'}
                        onChange={(value) => updateField(field.id, {
                            format: { ...field.format, dateFormat: value }
                        })}
                        size="small"
                        className="w-full"
                        styles={{ popup: { root: { minWidth: '230px' } } }}
                        options={[
                            { label: '2024-01-01', value: 'YYYY-MM-DD' },
                            { label: '2024/01/01', value: 'YYYY/MM/DD' },
                            { label: '01/01/2024', value: 'MM/DD/YYYY' },
                            { label: '2024年1月1日', value: 'YYYY年M月D日' },
                            { label: '1月1日', value: 'M月D日' },
                            { label: 'January 1, 2024', value: 'MMMM D, YYYY' },
                            { label: 'Jan 1, 2024', value: 'MMM D, YYYY' },
                            { label: '1st January 2024', value: 'Do MMMM YYYY' },
                            { label: 'Monday, January 1, 2024', value: 'dddd, MMMM D, YYYY' },
                            { label: 'Mon, Jan 1, 2024', value: 'ddd, MMM D, YYYY' },
                        ]}
                    />
                );
            case 'number':
                return (
                    <Select
                        value={field.format?.numberFormat || 'normal'}
                        onChange={(value) => updateField(field.id, {
                            format: { ...field.format, numberFormat: value }
                        })}
                        size="small"
                        className="w-full"
                        options={[
                            { label: '普通数字', value: 'normal' },
                            { label: '千分位', value: 'thousand' },
                            { label: '百分比', value: 'percent' },
                        ]}
                    />
                );
            default:
                return <span className="text-xs text-gray-400">无格式选项</span>;
        }
    };

    // 渲染字段值输入组件
    const renderFieldValueInput = (field: FieldConfig) => {
        const isRequired = field.required;
        const fieldValue = formData[field.name];
        const hasValue = fieldValue != null && fieldValue.toString().trim() !== '';

        switch (field.type) {
            case 'text':
            case 'phone':
                return (
                    <Input
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={`输入${field.name}`}
                        size="small"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'email':
                return (
                    <Input
                        type="email"
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={`输入${field.name}`}
                        size="small"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'number':
                return (
                    <InputNumber
                        value={(formData[field.name] as number) || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                        placeholder={`输入${field.name}`}
                        size="small"
                        className="w-full"
                        style={{ width: '100%', }}
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'currency':
                return (
                    <InputNumber
                        value={(formData[field.name] as number) || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                        placeholder={`输入${field.name}`}
                        size="small"
                        className="w-full"
                        style={{ width: '100%', }}
                        prefix={field.format?.currencySymbol || '¥'}
                        precision={field.format?.decimalPlaces || 2}
                        min={0}
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'date':
                return (
                    <DatePicker
                        value={formData[field.name] ? dayjs(formData[field.name] as string) : null}
                        onChange={(date, dateString) => setFormData(prev => ({ ...prev, [field.name]: dateString as string }))}
                        className="w-full"
                        placeholder={`选择${field.name}`}
                        size="small"
                        format={field.format?.dateFormat || 'YYYY-MM-DD'}
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'country':
                return (
                    <Select
                        value={(formData[field.name] as string) || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                        placeholder={`请选择${field.name}`}
                        className="w-full"
                        size="small"
                        options={COUNTRIES}
                        showSearch
                        allowClear
                        status={isRequired && !hasValue ? 'error' : undefined}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                );
            default:
                return (
                    <Input
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={`输入${field.name}`}
                        size="small"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
        }
    };

    // 显示加载状态直到组件完全初始化
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <Card>
                        <Title level={2} className="text-center mb-8">动态文档生成器</Title>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">正在加载模板...</span>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <Card>
                    <Title level={2} className="text-center mb-8">动态文档生成器</Title>

                    {/* 模板选择区域 */}
                    <Card title="模板配置" className="mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    模板来源
                                </label>
                                <Select
                                    value={templateSource}
                                    onChange={(value) => {
                                        setTemplateSource(value);
                                    }}
                                    className="w-full"
                                    options={[
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <CloudOutlined className="mr-2 text-blue-600" />
                                                    <span>Vercel Blob</span>
                                                </div>
                                            ),
                                            value: 'blob'
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <SettingOutlined className="mr-2 text-blue-600" />
                                                    <span>本地浏览器缓存</span>
                                                </div>
                                            ),
                                            value: 'local'
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <CloudOutlined className="mr-2 text-gray-400" />
                                                    <span className="text-gray-400">阿里云 OSS</span>
                                                    <span className="ml-2 text-xs text-gray-400">(未开发)</span>
                                                </div>
                                            ),
                                            value: 'aliyun',
                                            disabled: true
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <CloudOutlined className="mr-2 text-gray-400" />
                                                    <span className="text-gray-400">七牛云</span>
                                                    <span className="ml-2 text-xs text-gray-400">(未开发)</span>
                                                </div>
                                            ),
                                            value: 'qiniu',
                                            disabled: true
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <CloudOutlined className="mr-2 text-gray-400" />
                                                    <span className="text-gray-400">DevWeb</span>
                                                    <span className="ml-2 text-xs text-gray-400">(未开发)</span>
                                                </div>
                                            ),
                                            value: 'devweb',
                                            disabled: true
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <CloudOutlined className="mr-2 text-gray-400" />
                                                    <span className="text-gray-400">腾讯云 COS</span>
                                                    <span className="ml-2 text-xs text-gray-400">(未开发)</span>
                                                </div>
                                            ),
                                            value: 'tencent',
                                            disabled: true
                                        },
                                        {
                                            label: (
                                                <div className="flex items-center">
                                                    <CloudOutlined className="mr-2 text-gray-400" />
                                                    <span className="text-gray-400">AWS S3</span>
                                                    <span className="ml-2 text-xs text-gray-400">(未开发)</span>
                                                </div>
                                            ),
                                            value: 'aws',
                                            disabled: true
                                        }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    选择模板
                                </label>
                                <div className="flex gap-2">
                                    <Select
                                        placeholder={templateSource === 'blob' ? '请选择云端模板文件' : '请选择本地缓存模板'}
                                        value={templateSource === 'blob' ? (cloudTemplateName || undefined) : (localTemplateId || undefined)}
                                        onChange={(value) => {
                                            if (templateSource === 'blob') {
                                                setCloudTemplateName(value);
                                            } else {
                                                setLocalTemplateId(value);
                                            }
                                        }}
                                        className="flex-1"
                                        loading={templateSource === 'blob' ? isLoadingTemplates : false}
                                        showSearch
                                        filterOption={templateSource === 'blob'
                                            ? (input, option) => (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                            : undefined
                                        }
                                        options={templateSource === 'blob'
                                            ? cloudTemplates.map(template => ({
                                                label: (
                                                    <div className="flex justify-between items-center">
                                                        <span>{template.name}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {(template.size / 1024).toFixed(1)}KB
                                                        </span>
                                                    </div>
                                                ),
                                                value: template.name
                                            }))
                                            : localTemplates.map(file => ({
                                                label: (
                                                    <div className="flex justify-between items-center">
                                                        <span>{file.name}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatFileSize(file.size)}
                                                        </span>
                                                    </div>
                                                ),
                                                value: file.id
                                            }))
                                        }
                                        notFoundContent={templateSource === 'blob'
                                            ? (isLoadingTemplates ? '加载中...' : '暂无可用模板')
                                            : '暂无本地缓存模板'
                                        }
                                    />
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={async () => {
                                            if (templateSource === 'blob') {
                                                if (cloudTemplateName) {
                                                    const selectedTemplate = cloudTemplates.find(t => t.name === cloudTemplateName);
                                                    if (selectedTemplate) {
                                                        setPreviewTemplateUrl(selectedTemplate.url);
                                                        setPreviewTemplateName(cloudTemplateName);
                                                        setPreviewVisible(true);
                                                    }
                                                } else {
                                                    message.warning('请先选择一个模板');
                                                }
                                            } else {
                                                if (!localTemplateId) {
                                                    message.warning('请先选择一个本地模板');
                                                    return;
                                                }
                                                try {
                                                    const file = await getFileFromCache(localTemplateId);
                                                    if (!file) {
                                                        message.error('未找到本地模板文件');
                                                        return;
                                                    }
                                                    const objectUrl = URL.createObjectURL(file);
                                                    setPreviewTemplateUrl(objectUrl);
                                                    setPreviewTemplateName(file.name);
                                                    setPreviewVisible(true);
                                                } catch (error) {
                                                    console.error('本地模板预览失败:', error);
                                                    message.error('本地模板预览失败');
                                                }
                                            }
                                        }}
                                        disabled={templateSource === 'blob' ? (!cloudTemplateName || isLoadingTemplates) : !localTemplateId}
                                        title="预览模板"
                                    >
                                        预览
                                    </Button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {templateSource === 'blob'
                                        ? (cloudTemplates.length > 0
                                            ? `找到 ${cloudTemplates.length} 个可用模板`
                                            : '提示：模板文件需要预先上传到 Vercel Blob 存储中'
                                          )
                                        : (localTemplates.length > 0
                                            ? `找到 ${localTemplates.length} 个本地缓存模板`
                                            : '提示：请先在“模板管理”页面保存到本地缓存')
                                    }
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 字段配置区域 */}
                    <Card
                        title={
                            <div className="flex items-center justify-between">
                                <span>字段配置</span>
                                <Space>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<SettingOutlined />}
                                        onClick={autoConfigureFields}
                                        disabled={(templateSource === 'blob' ? !cloudTemplateName : !localTemplateId) || isAutoConfiguring}
                                        loading={isAutoConfiguring}
                                    >
                                        {isAutoConfiguring ? '配置中...' : '自动配置'}
                                    </Button>
                                    <Popconfirm
                                        title="确定要删除所有字段吗？"
                                        description="此操作不可撤销，将清空所有字段配置。"
                                        onConfirm={() => setFields([])}
                                        okText="确定"
                                        cancelText="取消"
                                        disabled={fields.length === 0}
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            disabled={fields.length === 0}
                                        >
                                            清空所有
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </div>
                        }
                        className="mb-6"
                    >
                        <div className="space-y-3">
                            {/* 表头 - 仅在有字段时显示 */}
                            {fields.length > 0 && (
                                <div className="hidden lg:block">
                                    <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-600">
                                        <div className="col-span-2">字段名称</div>
                                        <div className="col-span-2">字段类型</div>
                                        <div className="col-span-2">格式</div>
                                        <div className="col-span-1">必填</div>
                                        <div className="col-span-2">字段值</div>
                                        <div className="col-span-2">操作</div>
                                    </div>
                                </div>
                            )}

                            {/* 字段列表 */}
                            <div className="space-y-3">
                                {fields.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="text-lg mb-2">📝</div>
                                        <div>暂无字段配置</div>
                                        <div className="text-xs mt-1">点击下方&quot;添加字段&quot;按钮开始配置</div>
                                    </div>
                                ) : (
                                    fields.map((field, index) => (
                                        <Card
                                            key={field.id}
                                            size="small"
                                            className="border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                                            styles={{ body: { padding: '12px 16px' } }}
                                        >
                                            {/* 桌面端布局 */}
                                            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-3 lg:items-center">
                                                <div className="col-span-2">
                                                    <Input
                                                        value={field.name}
                                                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                                                        placeholder="字段名称"
                                                        size="small"
                                                        status={!field.name ? 'error' : undefined}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Select
                                                        value={field.type}
                                                        onChange={(value) => updateField(field.id, { type: value as FieldConfig['type'] })}
                                                        size="small"
                                                        className="w-full"
                                                        options={FIELD_TYPES}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    {renderFormatConfig(field)}
                                                </div>
                                                <div className="col-span-1 flex justify-start">
                                                    <Checkbox
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    {renderFieldValueInput(field)}
                                                </div>
                                                <div className="col-span-2 flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">#{index + 1}</span>
                                                    <Popconfirm
                                                        title="确定要删除这个字段吗？"
                                                        description="删除后将无法恢复"
                                                        onConfirm={() => deleteField(field.id)}
                                                        okText="确定"
                                                        cancelText="取消"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            size="small"
                                                            type="text"
                                                            className="hover:bg-red-50"
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            </div>

                                            {/* 移动端布局 */}
                                            <div className="lg:hidden space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">字段 #{index + 1}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={field.required}
                                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                        >
                                                            <span className="text-xs">必填</span>
                                                        </Checkbox>
                                                        <Popconfirm
                                                            title="确定要删除这个字段吗？"
                                                            description="删除后将无法恢复"
                                                            onConfirm={() => deleteField(field.id)}
                                                            okText="确定"
                                                            cancelText="取消"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                size="small"
                                                                type="text"
                                                                className="hover:bg-red-50"
                                                            />
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-600">
                                                            字段名称
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <Input
                                                            value={field.name}
                                                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                                                            placeholder="字段名称"
                                                            size="small"
                                                            status={!field.name ? 'error' : undefined}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-600">字段类型</label>
                                                        <Select
                                                            value={field.type}
                                                            onChange={(value) => updateField(field.id, { type: value as FieldConfig['type'] })}
                                                            size="small"
                                                            className="w-full"
                                                            options={FIELD_TYPES}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-600">格式</label>
                                                        {renderFormatConfig(field)}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-gray-600">
                                                            字段值
                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                        </label>
                                                        {renderFieldValueInput(field)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>

                            <Button
                                type="dashed"
                                onClick={addField}
                                icon={<PlusOutlined />}
                                className="w-full"
                            >
                                添加字段
                            </Button>
                        </div>
                    </Card>

                    {/* 文档生成区域 */}
                    <DocumentGenerator
                        fields={fields}
                        formData={formData}
                        cloudTemplateName={cloudTemplateName}
                    />
                </Card>
            </div>

            {/* 模板预览组件 */}
            <TemplatePreview
                visible={previewVisible}
                onClose={() => {
                    if (previewTemplateUrl && previewTemplateUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(previewTemplateUrl);
                    }
                    setPreviewVisible(false);
                    setPreviewTemplateUrl('');
                }}
                templateUrl={previewTemplateUrl}
                templateName={previewTemplateName}
            />
        </div>
    );
}