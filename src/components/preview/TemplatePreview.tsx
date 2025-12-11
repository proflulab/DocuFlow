import React, { useEffect, useRef, useState } from 'react'
import { Modal, Spin } from 'antd'

/**
 * 微软 Office Web Viewer 组件
 * src 必须是公网可访问的 HTTPS 地址
 */
const OfficeViewer: React.FC<{ src: string }> = ({ src }) => {
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`
  return (
    <iframe
      src={viewerUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      title="Office Web Viewer"
    />
  )
}

// PDF 预览组件
 interface PdfViewProps {
     fileInfo: string
 }
 
 const PdfView = (props: PdfViewProps) => {
     const { fileInfo } = props
     return (
         <div style={{ height: '100%', width: '100%' }}>
             <embed
                 src={fileInfo}
                 type="application/pdf"
                 width="100%"
                 height="100%"
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

    // 按扩展名判断预览方式
    const isPdf = templateUrl.toLowerCase().endsWith('.pdf')

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
                    {isPdf ? (
                        <PdfView fileInfo={templateUrl} />
                    ) : (
                        <OfficeViewer src={templateUrl} />
                    )}
                </div>
            )}
        </Modal>
    )
}

export default TemplatePreview


