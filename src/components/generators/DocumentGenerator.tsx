'use client';

import React, { useState } from 'react';
import { Button, Card, Space, message } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { z } from 'zod';
import { FieldConfig, CloudTemplate } from '../../types';
import { createFormSchema } from '../../utils/validation';
import { getFileFromCache } from '@/utils/localCache';

interface DocumentGeneratorProps {
    fields: FieldConfig[];
    formData: Record<string, string | number | boolean | null | undefined>;
    cloudTemplateName: string;
    templateSource: 'blob' | 'local';
    localTemplateId?: string;
}

export default function DocumentGenerator({
    fields,
    formData,
    cloudTemplateName,
    templateSource,
    localTemplateId
}: DocumentGeneratorProps) {
    const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

    // 获取云端模板文件
    const getCloudTemplate = async (templateName: string) => {
        const templatesResponse = await fetch('/api/templates');
        const templatesResult = await templatesResponse.json();

        if (!templatesResult.success) {
            throw new Error('获取模板列表失败');
        }

        const selectedTemplate = templatesResult.templates.find((t: CloudTemplate) => t.name === templateName.trim());
        if (!selectedTemplate) {
            throw new Error(`模板文件 "${templateName}" 不存在`);
        }

        const templateResponse = await fetch(selectedTemplate.url);
        const templateBlob = await templateResponse.blob();

        return new File([templateBlob], templateName.trim(), {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
    };

    // 通用文档生成函数
    const generateDocument = async (format: 'docx' | 'pdf') => {
        const isDocx = format === 'docx';
        const setLoading = isDocx ? setIsGeneratingDocx : setIsGeneratingPdf;

        setLoading(true);

        try {
            const data = generateDocumentData();
            if (!data) {
                return; // 校验失败，直接返回
            }

            // 构建 FormData
            const formDataToSend = new FormData();

            // 添加数据字段
            formDataToSend.append('data', JSON.stringify(data));
            // 后端通过表单字段读取 format，这里同步传递
            formDataToSend.append('format', format);

            // 添加模板文件（支持云端与本地缓存两种来源）
            if (templateSource === 'blob') {
                if (!cloudTemplateName.trim()) {
                    message.warning('请先选择云端模板');
                    return;
                }
                const templateFile = await getCloudTemplate(cloudTemplateName);
                formDataToSend.append('template', templateFile);
            } else {
                if (!localTemplateId) {
                    message.warning('请先选择本地缓存模板');
                    return;
                }
                const localFile = await getFileFromCache(localTemplateId);
                if (!localFile) {
                    message.error('本地模板不存在或已被删除');
                    return;
                }
                formDataToSend.append('template', localFile);
            }

            const response = await fetch(`/api/document`, {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                // 尝试解析后端错误信息
                let msg = response.statusText;
                try {
                    const errJson = await response.json();
                    msg = errJson?.error || response.statusText;
                } catch {
                    // JSON parsing failed, keep default msg
                }
                throw new Error(`Failed to generate document: ${msg}`);
            }

            const blob = await response.blob();
            const fileName = `document_${Date.now()}.${format}`;
            saveAs(blob, fileName);

            const formatName = format.toUpperCase();
            message.success(`${formatName}文档生成成功！`);
        } catch (error) {
            console.error('Error generating document:', error);
            message.error('文档生成失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div className="text-center">
                <Space>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        loading={isGeneratingDocx}
                        onClick={() => generateDocument('docx')}
                    >
                        生成DOCX文档
                    </Button>
                    <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        loading={isGeneratingPdf}
                        onClick={() => generateDocument('pdf')}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        生成PDF文档
                    </Button>
                </Space>
            </div>
        </Card>
    );
}