import React, { useState } from 'react'
import { Modal, Spin } from 'antd'

// OfficeWebViewer 组件使用微软 Office Web Viewer 来预览文档
interface OfficeWebViewerProps {
    fileUrl: string
}

const OfficeWebViewer = (props: OfficeWebViewerProps) => {
    const { fileUrl } = props
    const [isLoading, setIsLoading] = useState<boolean>(true)
    
    // 构建 Office Web Viewer 的嵌入 URL
    const getOfficeWebViewerUrl = (url: string) => {
        // 确保 URL 是公开可访问的，并且需要进行 URL 编码
        const encodedUrl = encodeURIComponent(url)
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
    }

    const handleIframeLoad = () => {
        setIsLoading(false)
    }

    return (
        <div className="relative h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                    <Spin size="large" />
                </div>
            )}
            <iframe
                src={getOfficeWebViewerUrl(fileUrl)}
                width="100%"
                height="100%"
                frameBorder="0"
                onLoad={handleIframeLoad}
                title="Office Document Preview"
                style={{ minHeight: '750px' }}
            />
        </div>
    )
}

// TemplatePreview 组件用于模板预览弹窗
interface TemplatePreviewProps {
    visible: boolean
    onClose: () => void
    templateUrl: string
    templateName: string
}

const TemplatePreview = (props: TemplatePreviewProps) => {
    const { visible, onClose, templateUrl, templateName } = props

    return (
        <Modal
            title={`模板预览 - ${templateName}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            style={{ top: 65 }}
        >
            {templateUrl && (
                <div style={{ height: '800px', overflow: 'auto' }}>
                    <OfficeWebViewer fileUrl={templateUrl} />
                </div>
            )}
        </Modal>
    )
}

export default TemplatePreview


