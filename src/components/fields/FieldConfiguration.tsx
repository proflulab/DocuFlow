/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-20 13:30:00
 * @Description: 字段配置组件 - 从证书页面提取的独立组件
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

'use client';

import React from 'react';
import dayjs from 'dayjs';
import { FieldConfig } from '../../types';
import { DEFAULT_FIELDS, FIELD_TYPES } from '../../constants/fields';
import { COUNTRIES } from '../../constants/countries';
import { CURRENCY_OPTIONS } from '../../constants/currencies';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Space, Typography,  Popconfirm, DatePicker, Select, Input, InputNumber, Checkbox } from 'antd';

const { Text } = Typography;

interface FieldConfigurationProps {
  fields: FieldConfig[];
  formData: Record<string, string | number | boolean | null | undefined>;
  cloudTemplateName: string;
  isAutoConfiguring: boolean;
  onFieldsChange: (fields: FieldConfig[]) => void;
  onFormDataChange: (formData: Record<string, string | number | boolean | null | undefined>) => void;
  onAutoConfigure: () => void;
}

// 导出默认字段配置供外部使用
export { DEFAULT_FIELDS };

export default function FieldConfiguration({
  fields,
  formData,
  cloudTemplateName,
  isAutoConfiguring,
  onFieldsChange,
  onFormDataChange,
  onAutoConfigure,
}: FieldConfigurationProps) {

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
    onFieldsChange([...fields, newField]);
  };

  // 删除字段
  const deleteField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id));
  };

  // 更新字段配置
  const updateField = (id: string, updates: Partial<FieldConfig>) => {
    onFieldsChange(fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
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
              { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
              { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
              { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
              { label: 'YYYY年M月D日', value: 'YYYY年M月D日' },
              { label: 'M月D日', value: 'M月D日' },
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
            onChange={(e) => onFormDataChange({ ...formData, [field.name]: e.target.value })}
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
            onChange={(e) => onFormDataChange({ ...formData, [field.name]: e.target.value })}
            placeholder={`输入${field.name}`}
            size="small"
            status={isRequired && !hasValue ? 'error' : undefined}
          />
        );
      case 'number':
        return (
          <InputNumber
            value={(formData[field.name] as number) || undefined}
            onChange={(value) => onFormDataChange({ ...formData, [field.name]: value })}
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
            onChange={(value) => onFormDataChange({ ...formData, [field.name]: value })}
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
            onChange={(date, dateString) => onFormDataChange({ ...formData, [field.name]: dateString as string })}
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
            onChange={(value) => onFormDataChange({ ...formData, [field.name]: value })}
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
            onChange={(e) => onFormDataChange({ ...formData, [field.name]: e.target.value })}
            placeholder={`输入${field.name}`}
            size="small"
            status={isRequired && !hasValue ? 'error' : undefined}
          />
        );
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>字段配置</span>
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SettingOutlined />}
              onClick={onAutoConfigure}
              disabled={!cloudTemplateName || isAutoConfiguring}
              loading={isAutoConfiguring}
            >
              {isAutoConfiguring ? '配置中...' : '自动配置'}
            </Button>
            <Popconfirm
              title="确定要删除所有字段吗？"
              description="此操作不可撤销，将清空所有字段配置。"
              onConfirm={() => onFieldsChange([])}
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
  );
}