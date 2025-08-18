'use client';

import React, { useState, useCallback } from 'react';
import { Button, Card, Space, Typography, message, Popconfirm, DatePicker, Select, Input, InputNumber, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, FilePdfOutlined, CloudOutlined, SettingOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { z } from 'zod';
import { COUNTRIES } from '../constants/countries';

const { Title } = Typography;

// 字段校验规则
const createFieldSchema = (field: FieldConfig) => {
    switch (field.type) {
        case 'text':
            return z.string().min(1, `${field.label}不能为空`);
        case 'email':
            return z.email({ message: `${field.label}格式不正确` });
        case 'number':
            return z.string().regex(/^\d+$/, `${field.label}必须是数字`);
        case 'phone':
            return z.string().regex(/^1[3-9]\d{9}$/, `${field.label}格式不正确`);
        case 'currency':
            return z.string().regex(/^\d+(\.\d{1,2})?$/, `${field.label}格式不正确`);
        case 'date':
            return z.string().min(1, `请选择${field.label}`);
        case 'select':
        case 'country':
            return z.string().min(1, `请选择${field.label}`);
        default:
            return z.string().min(1, `${field.label}不能为空`);
    }
};

// 创建完整的表单校验规则
const createFormSchema = (fields: FieldConfig[]) => {
    const schemaObject: Record<string, z.ZodTypeAny> = {};
    fields.forEach(field => {
        if (field.required !== false) { // 默认为必填
            schemaObject[field.name] = createFieldSchema(field);
        }
    });
    return z.object(schemaObject);
};

// 字段类型选项
interface FieldConfig {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'phone' | 'currency' | 'date' | 'select' | 'country';
    value: string | number | boolean;
    options?: string[]; // 用于select类型
    required?: boolean;
}

// 字段类型选项
const FIELD_TYPES = [
    { label: '文本', value: 'text' },
    { label: '邮箱', value: 'email' },
    { label: '数字', value: 'number' },
    { label: '电话号码', value: 'phone' },
    { label: '货币', value: 'currency' },
    { label: '日期', value: 'date' },
    { label: '国家', value: 'country' },
];

// 默认字段配置
const DEFAULT_FIELDS: FieldConfig[] = [
    { id: '1', name: 'name', label: '姓名', type: 'text', value: '', required: true },
    { id: '2', name: 'email', label: '邮箱', type: 'email', value: '', required: true },
    { id: '3', name: 'phone', label: '电话', type: 'phone', value: '', required: false },
    { id: '4', name: 'amount', label: '金额', type: 'currency', value: 0, required: false },
];

// 云端模板接口
interface CloudTemplate {
    name: string;
    pathname: string;
    url: string;
    size: number;
    uploadedAt: string;
}

export default function CertificateGenerator() {
    const [fields, setFields] = useState<FieldConfig[]>(DEFAULT_FIELDS);
    const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [formData, setFormData] = useState<Record<string, string | number | boolean | null | undefined>>({});
    const [templateSource] = useState<'cloud'>('cloud');
    const [cloudTemplateName, setCloudTemplateName] = useState<string>('');
    const [cloudTemplates, setCloudTemplates] = useState<CloudTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

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

    // 组件初始化时获取云端模板列表
    React.useEffect(() => {
        const initializeComponent = async () => {
            try {
                await fetchCloudTemplates();
            } catch (error) {
                console.error('Failed to fetch cloud templates:', error);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeComponent();
    }, [fetchCloudTemplates]);

    // 添加新字段
    const addField = () => {
        const newField: FieldConfig = {
            id: Date.now().toString(),
            name: `field_${Date.now()}`,
            label: '新字段',
            type: 'text',
            value: '',
            required: false,
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
        if (!cloudTemplateName) {
            message.warning('请先选择一个模板');
            return;
        }

        setIsAutoConfiguring(true);
        const hideLoading = message.loading('正在分析模板字段...', 0);

        try {
            const response = await fetch(`/api/template-fields?source=cloud&template=${encodeURIComponent(cloudTemplateName)}`);
            const result = await response.json();

            if (result.success && result.fields) {
                const autoFields: FieldConfig[] = result.fields.map((fieldName: string, index: number) => ({
                    id: `auto_${Date.now()}_${index}`,
                    name: fieldName,
                    label: fieldName,
                    type: 'text' as const,
                    value: '',
                    required: false,
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
                        placeholder={`输入${field.label}`}
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
                        placeholder={`输入${field.label}`}
                        size="small"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'number':
                return (
                    <InputNumber
                        value={(formData[field.name] as number) || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                        placeholder={`输入${field.label}`}
                        size="small"
                        className="w-full"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'currency':
                return (
                    <InputNumber
                        value={(formData[field.name] as number) || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                        placeholder={`输入${field.label}`}
                        size="small"
                        className="w-full"
                        prefix="¥"
                        precision={2}
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
                        placeholder={`选择${field.label}`}
                        size="small"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
            case 'country':
                return (
                    <Select
                        value={(formData[field.name] as string) || undefined}
                        onChange={(value) => setFormData(prev => ({ ...prev, [field.name]: value }))}
                        placeholder={`请选择${field.label}`}
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
                        placeholder={`输入${field.label}`}
                        size="small"
                        status={isRequired && !hasValue ? 'error' : undefined}
                    />
                );
        }
    };

    // 验证表单数据
    const validateFormData = () => {
        try {
            const schema = createFormSchema(fields);
            const data: Record<string, string | number | boolean> = {};
            fields.forEach(field => {
                data[field.name] = formData[field.name] || field.value || '';
            });
            schema.parse(data);
            return { success: true, data };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const firstError = error.issues[0];
                message.error(firstError.message);
                return { success: false, error: firstError.message };
            }
            message.error('数据验证失败');
            return { success: false, error: '数据验证失败' };
        }
    };

    // 生成文档数据
    const generateDocumentData = () => {
        const validation = validateFormData();
        if (!validation.success) {
            return null; // 返回 null 表示校验失败
        }
        return validation.data;
    };

    // 生成DOCX文档
    const generateDocument = async () => {
        setIsGeneratingDocx(true);
        try {
            const data = generateDocumentData();
            if (!data) {
                return; // 校验失败，直接返回
            }

            // 构建API URL
            let apiUrl = `/api/document?format=docx&source=${templateSource}`;
            if (templateSource === 'cloud' && cloudTemplateName.trim()) {
                apiUrl += `&template=${encodeURIComponent(cloudTemplateName.trim())}`;
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate document: ${response.statusText}`);
            }

            const blob = await response.blob();
            saveAs(blob, `document_${Date.now()}.docx`);
            message.success('DOCX文档生成成功！');
        } catch (error) {
            console.error('Error generating document:', error);
            message.error('文档生成失败，请重试');
        } finally {
            setIsGeneratingDocx(false);
        }
    };

    // 生成PDF文档
    const generatePdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const data = generateDocumentData();
            if (!data) {
                return; // 校验失败，直接返回
            }

            // 构建API URL
            let apiUrl = `/api/document?format=pdf&source=${templateSource}`;
            if (templateSource === 'cloud' && cloudTemplateName.trim()) {
                apiUrl += `&template=${encodeURIComponent(cloudTemplateName.trim())}`;
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            saveAs(blob, `document_${Date.now()}.pdf`);
            message.success('PDF文档生成成功！');
        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error('PDF生成失败，请重试');
        } finally {
            setIsGeneratingPdf(false);
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
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <CloudOutlined className="mr-2 text-blue-600" />
                                    <span className="text-blue-800 font-medium">Vercel Blob</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    选择模板
                                </label>
                                <Select
                                    placeholder="请选择云端模板文件"
                                    value={cloudTemplateName || undefined}
                                    onChange={(value) => setCloudTemplateName(value)}
                                    className="w-full"
                                    loading={isLoadingTemplates}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={cloudTemplates.map(template => ({
                                        label: (
                                            <div className="flex justify-between items-center">
                                                <span>{template.name}</span>
                                                <span className="text-xs text-gray-400">
                                                    {(template.size / 1024).toFixed(1)}KB
                                                </span>
                                            </div>
                                        ),
                                        value: template.name
                                    }))}
                                    notFoundContent={isLoadingTemplates ? '加载中...' : '暂无可用模板'}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {cloudTemplates.length > 0
                                        ? `找到 ${cloudTemplates.length} 个可用模板`
                                        : '提示：模板文件需要预先上传到 Vercel Blob 存储中'
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
                                        disabled={!cloudTemplateName || isAutoConfiguring}
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
                                        <div className="col-span-2">显示标签</div>
                                        <div className="col-span-2">字段类型</div>
                                        <div className="col-span-1">必填</div>
                                        <div className="col-span-3">字段值</div>
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
                                                    <Input
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        placeholder="显示标签"
                                                        size="small"
                                                        status={!field.label ? 'error' : undefined}
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
                                                <div className="col-span-1 flex justify-start">
                                                    <Checkbox
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    />
                                                </div>
                                                <div className="col-span-3">
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
                                                        <label className="text-xs font-medium text-gray-600">
                                                            显示标签
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <Input
                                                            value={field.label}
                                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                            placeholder="显示标签"
                                                            size="small"
                                                            status={!field.label ? 'error' : undefined}
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
                    <Card >
                        <div className="text-center">
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    loading={isGeneratingDocx}
                                    onClick={generateDocument}
                                >
                                    生成DOCX文档
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<FilePdfOutlined />}
                                    loading={isGeneratingPdf}
                                    onClick={generatePdf}
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    生成PDF文档
                                </Button>
                            </Space>
                        </div>
                    </Card>
                </Card>
            </div>
        </div>
    );
}
