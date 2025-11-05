import React, { useState, useEffect } from 'react';
import { getCachedFilesMetadata, addFileToCache, getFileFromCache, CachedFile, formatFileSize } from '../../utils/localCache';

interface Field {
  name: string;
  value: string;
}

interface EnhancedCachedFile extends CachedFile {
  sizeFormatted: string;
}

const TemplateUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [templateSource, setTemplateSource] = useState<'upload' | 'cache'>('upload'); // 'upload' or 'cache'
  const [cachedTemplates, setCachedTemplates] = useState<EnhancedCachedFile[]>([]);
  const [selectedCachedTemplateId, setSelectedCachedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const loadCachedTemplates = async () => {
      const files = getCachedFilesMetadata();
      const enhancedFiles: EnhancedCachedFile[] = files.map(file => ({
        ...file,
        sizeFormatted: formatFileSize(file.size)
      }));
      setCachedTemplates(enhancedFiles);
    };
    loadCachedTemplates();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setFields([]); // Clear fields when a new file is selected
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('请选择一个文件进行上传。');
      return;
    }

    setLoading(true);
    setMessage('正在上传并解析模板...');

    const formData = new FormData();
    formData.append('template', selectedFile);

    try {
      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        const initialFields = data.fields.map((fieldName: string) => ({
          name: fieldName,
          value: '',
        }));
        setFields(initialFields);
        // Add the newly uploaded file to cache
        if (selectedFile) {
          await addFileToCache(selectedFile);
          const updatedCachedTemplates = getCachedFilesMetadata();
          const enhancedUpdatedFiles: EnhancedCachedFile[] = updatedCachedTemplates.map(file => ({
            ...file,
            sizeFormatted: formatFileSize(file.size)
          }));
          setCachedTemplates(enhancedUpdatedFiles);
        }
      } else {
        setMessage(data.error || '文件上传失败。');
      }
    } catch (error) {
      console.error('上传错误:', error);
      setMessage('上传过程中发生错误。');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCachedTemplate = async () => {
    if (!selectedCachedTemplateId) {
      setMessage('请选择一个缓存模板。');
      return;
    }

    setLoading(true);
    setMessage('正在加载并解析缓存模板...');

    try {
      const cachedFile = await getFileFromCache(selectedCachedTemplateId);
      if (!cachedFile) {
        setMessage('未能从缓存中找到该模板。');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('template', cachedFile);

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        const initialFields = data.fields.map((fieldName: string) => ({
          name: fieldName,
          value: '',
        }));
        setFields(initialFields);
      } else {
        setMessage(data.error || '加载缓存模板失败。');
      }
    } catch (error) {
      console.error('加载缓存模板错误:', error);
      setMessage('加载缓存模板过程中发生错误。');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
  };

  const handleGenerateDocument = async () => {
    if (fields.length === 0) {
      setMessage('请先解析模板并配置字段。');
      return;
    }

    setLoading(true);
    setMessage('正在生成文档...');

    let templateData: FormData | null = null;

    if (templateSource === 'upload') {
      if (!selectedFile) {
        setMessage('请选择一个文件进行上传。');
        setLoading(false);
        return;
      }
      templateData = new FormData();
      templateData.append('template', selectedFile);
    } else if (templateSource === 'cache') {
      if (!selectedCachedTemplateId) {
        setMessage('请选择一个缓存模板。');
        setLoading(false);
        return;
      }
      const cachedFile = await getFileFromCache(selectedCachedTemplateId);
      if (!cachedFile) {
        setMessage('未能从缓存中找到该模板。');
        setLoading(false);
        return;
      }
      templateData = new FormData();
      templateData.append('template', cachedFile);
    } else {
      setMessage('请选择模板来源。');
      setLoading(false);
      return;
    }

    try {
      // 附加字段到表单，服务端将从 form-data 中解析
      if (templateData) {
        for (const f of fields) {
          templateData.append(f.name, f.value);
        }
      }
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        body: templateData as FormData,
        headers: {},
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_document.docx'; // You might want to get the filename from the response header
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setMessage('文档生成成功！');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || '文档生成失败。');
      }
    } catch (error) {
      console.error('文档生成错误:', error);
      setMessage('文档生成过程中发生错误。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">上传证书模板</h1>

      <div className="mb-4">
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            className="form-radio"
            name="templateSource"
            value="upload"
            checked={templateSource === 'upload'}
            onChange={() => setTemplateSource('upload')}
          />
          <span className="ml-2">上传新模板</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio"
            name="templateSource"
            value="cache"
            checked={templateSource === 'cache'}
            onChange={() => setTemplateSource('cache')}
          />
          <span className="ml-2">从缓存中选择</span>
        </label>
      </div>

      {templateSource === 'upload' && (
        <div className="mb-4">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? '上传中...' : '上传模板'}
          </button>
        </div>
      )}

      {templateSource === 'cache' && (
        <div className="mb-4">
          <select
            className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            onChange={(e) => setSelectedCachedTemplateId(e.target.value)}
            value={selectedCachedTemplateId || ''}
          >
            <option value="" disabled>选择一个缓存模板</option>
            {cachedTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.sizeFormatted})
              </option>
            ))}
          </select>
          <button
            onClick={handleLoadCachedTemplate}
            disabled={!selectedCachedTemplateId || loading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '加载中...' : '加载模板'}
          </button>
        </div>
      )}

      {message && <p className="mb-4 text-sm text-gray-600">{message}</p>}

      {fields.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">配置模板字段</h2>
          {fields.map((field, index) => (
            <div key={index} className="mb-3">
              <label htmlFor={`field-${index}`} className="block text-sm font-medium text-gray-700">
                {field.name}:
              </label>
              <input
                type="text"
                id={`field-${index}`}
                value={field.value}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          ))}
          <button
            onClick={handleGenerateDocument}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '生成中...' : '生成文档'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateUploader;



