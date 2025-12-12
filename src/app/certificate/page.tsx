/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 03:16:37
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-12-12 17:51:54
 * @FilePath: /next_word_auto/src/app/certificate/page.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

'use client';

import { SettingOutlined } from '@ant-design/icons';
import React, { useState, useCallback } from 'react';
import { FieldConfig, CloudTemplate } from '../../types';
import { CloudOutlined, EyeOutlined } from '@ant-design/icons';
import { inferFieldType } from '../../utils/fieldTypeInference';
import { Button, Card, Typography, message, Select } from 'antd';
import TemplatePreview from '../../components/preview/TemplatePreview';
import DocumentGenerator from '../../components/generators/DocumentGenerator';
import FieldConfiguration, { DEFAULT_FIELDS } from '../../components/fields/FieldConfiguration';


const { Title } = Typography;

export default function CertificatePage() {

  const [fields, setFields] = useState<FieldConfig[]>(DEFAULT_FIELDS);
    const [formData, setFormData] = useState<Record<string, string | number | boolean | null | undefined>>({});
    const [cloudTemplateName, setCloudTemplateName] = useState<string>('');
    const [cloudTemplates, setCloudTemplates] = useState<CloudTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTemplateUrl, setPreviewTemplateUrl] = useState<string>('');
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



    // 自动配置字段
    const autoConfigureFields = async () => {
        if (!cloudTemplateName) {
            message.warning('请先选择一个模板');
            return;
        }

        setIsAutoConfiguring(true);
        const hideLoading = message.loading('正在分析模板字段...', 0);

        try {
            // 直接从已加载的cloudTemplates中找到选中的模板
            const selectedTemplate = cloudTemplates.find((t: CloudTemplate) => t.name === cloudTemplateName);
            if (!selectedTemplate) {
                throw new Error('指定的模板文件不存在');
            }

            // 下载模板文件
            const templateResponse = await fetch(selectedTemplate.url);
            const templateBlob = await templateResponse.blob();

            // 创建 FormData 并发送 POST 请求
            const formData = new FormData();
            formData.append('template', templateBlob, cloudTemplateName);

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
                                                    <SettingOutlined className="mr-2 text-gray-400" />
                                                    <span className="text-gray-400">本地浏览器缓存</span>
                                                    <span className="ml-2 text-xs text-gray-400">(未开发)</span>
                                                </div>
                                            ),
                                            value: 'local',
                                            disabled: true
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
                                        placeholder="请选择云端模板文件"
                                        value={cloudTemplateName || undefined}
                                        onChange={(value) => setCloudTemplateName(value)}
                                        className="flex-1"
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
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => {
                                            if (cloudTemplateName) {
                                                const selectedTemplate = cloudTemplates.find(t => t.name === cloudTemplateName);
                                                if (selectedTemplate) {
                                                    setPreviewTemplateUrl(selectedTemplate.url);
                                                    setPreviewVisible(true);
                                                }
                                            } else {
                                                message.warning('请先选择一个模板');
                                            }
                                        }}
                                        disabled={!cloudTemplateName || isLoadingTemplates}
                                        title="预览模板"
                                    >
                                        预览
                                    </Button>
                                </div>
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
                    <FieldConfiguration
                        fields={fields}
                        formData={formData}
                        cloudTemplateName={cloudTemplateName}
                        isAutoConfiguring={isAutoConfiguring}
                        onFieldsChange={setFields}
                        onFormDataChange={setFormData}
                        onAutoConfigure={autoConfigureFields}
                    />

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
                onClose={() => setPreviewVisible(false)}
                templateUrl={previewTemplateUrl}
                templateName={cloudTemplateName}
            />
        </div>
    );
}