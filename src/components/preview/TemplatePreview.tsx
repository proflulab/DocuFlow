import React, { useEffect, useRef, useState } from 'react'
import * as docx from 'docx-preview'
import { Modal, Spin } from 'antd'

// DocxView 组件用于渲染 docx 文档
interface DocxViewProps {
    fileUrl?: string
    fileBlob?: Blob
}

const DocxView = (props: DocxViewProps) => {
    const { fileUrl, fileBlob } = props
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const docxContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const renderFromUrl = async (url: string) => {
            try {
                setIsLoading(true)
                setErrorMsg(null)
                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error(`请求失败: HTTP ${response.status}`)
                }
                const contentType = response.headers.get('content-type') || ''
                const isDocxLike = (
                    contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
                    contentType.includes('application/octet-stream') ||
                    contentType.includes('binary/octet-stream')
                )
                if (!isDocxLike) {
                    const text = await response.text().catch(() => '')
                    throw new Error(`非DOCX响应: ${contentType}${text ? ` - ${text}` : ''}`)
                }
                const data = await response.blob()
                const containerElement = docxContainerRef.current
                if (containerElement) {
                    await docx.renderAsync(data, containerElement)
                    console.info('docx: finished')
                    setIsLoading(false)
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : '加载或渲染文档失败'
                setErrorMsg(msg)
                setIsLoading(false)
                console.error('Error fetching or rendering document:', error)
            }
        }

        const renderFromBlob = async (blob: Blob) => {
            try {
                setIsLoading(true)
                setErrorMsg(null)
                const containerElement = docxContainerRef.current
                if (containerElement) {
                    await docx.renderAsync(blob, containerElement)
                    console.info('docx: finished')
                    setIsLoading(false)
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : '渲染本地文档失败'
                setErrorMsg(msg)
                setIsLoading(false)
                console.error('Error rendering document from blob:', error)
            }
        }

        if (fileBlob) {
            renderFromBlob(fileBlob)
        } else if (fileUrl) {
            renderFromUrl(fileUrl)
        }
    }, [fileUrl, fileBlob])

    return (
        <div className="relative h-full">
            <div ref={docxContainerRef} className="h-full" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <Spin size="large" />
                </div>
            )}
            {errorMsg && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                    <div className="text-center">
                        <p className="text-red-600 font-medium">预览失败</p>
                        <p className="text-gray-700 text-sm mt-2">{errorMsg}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// TemplatePreview 组件用于模板预览弹窗
interface TemplatePreviewProps {
    visible: boolean
    onClose: () => void
    templateUrl?: string
    templateBlob?: Blob
    templateName: string
}

const TemplatePreview = (props: TemplatePreviewProps) => {
    const { visible, onClose, templateUrl, templateBlob, templateName } = props

    return (
        <Modal
            title={`模板预览 - ${templateName}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            style={{ top: 65 }}
        >
            {(templateUrl || templateBlob) && (
                <div style={{ height: '800px', overflow: 'auto' }}>
                    <DocxView fileUrl={templateUrl} fileBlob={templateBlob} />
                </div>
            )}
        </Modal>
    )
}

export default TemplatePreview


