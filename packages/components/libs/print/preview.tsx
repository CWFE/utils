import React from 'react'
import { Button, Spin } from 'antd'
import { PropsWithChildren } from 'react'
import useGeneratePDF from './generatePDF'

export interface PDFPreviewProps extends PropsWithChildren<any> {
    onCancel: () => void
    afterPrint?: () => void
    previewType?: PDFPreviewType
    needHeader?: boolean
    needFooter?: boolean
    paddingX?: number
}

export type PDFPreviewType = 'download' | 'print'

const PDFPreview = (props: PDFPreviewProps) => {
    const {
        previewType = 'print',
        afterPrint = () => {},
    } = props
    const [loading, setLoading] = React.useState(false)

    const { download, print } = useGeneratePDF({
        elementIds: React.Children.map(props.children, child => child.props.id),
        downloadCallback: status => setLoading(status === 'begin'),
        needHeader: props.needHeader || true,
        needFooter: props.needFooter || true,
        renderPageFooter: (pdf, currentPage) => {
            pdf
                .setTextColor('#111')
                .setFontSize(8)
                .text(`第${currentPage}页`, pdf.internal.pageSize.getWidth() - 42, pdf.internal.pageSize.getHeight() - 12)
        },
        // renderPageHeader: (pdf, size) => {
        //     pdf
        //         .setTextColor('#111')
        //         .setFontSize(8)
        //         .text(`第${pdf.getCurrentPageInfo().pageNumber}页`, size.width - 42, 10)
        // }
    })

    React.useEffect(() => {
        window.onafterprint = (e: Event) => {
            afterPrint()
        }
    }, [props.afterPrint])

    return (
        <div id='print-container'>
            <Spin spinning={loading}>
                {
                    React.Children.map(props.children, ((child, idx) => {
                        return (
                            <div className='print-layer' key={`print-item-${idx}`}>
                                {
                                    child.props.id ? child : '请设置元素id'
                                }
                            </div>
                        )
                    }))
                }

                <div className='action-layer'>
                    <Button onClick={props.onCancel} style={{ marginRight: '20px' }}>取消</Button>
                    <Button type='primary' onClick={previewType === 'print' ? print : download}>{previewType === 'print' ? '打印' : '下载'}</Button>
                </div>
            </Spin>
        </div>
    )
}

export default PDFPreview