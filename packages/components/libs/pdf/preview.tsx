import { Button, Spin } from 'antd'
import React, { PropsWithChildren } from 'react'
import useGeneratePDF, { PDFSizeType, PDFTransformPlugin } from './generatePDF'
import jsPDF from 'jspdf'
import noop from 'lodash/noop'

export interface PDFPreviewProps extends PropsWithChildren<any> {
    onCancel: () => void
    afterPrint?: () => void
    plugins?: PDFTransformPlugin[][]
    done?: ( pdfs: jsPDF[] ) => void
    previewType?: PDFPreviewType
    paddingX?: number
    pdfUrls?: string[]
    sizeType?: PDFSizeType
    otherButtons?: {
        title: string
        action: () => void
    }[],
    separate?: boolean
    titles?: string[]
    noPageNumber?: boolean
    footerDisabled?: boolean,
    noStickyTableHeader?: boolean
}

export type PDFPreviewType = 'download' | 'print' | 'all'

const PDFPreview = ( props: PDFPreviewProps ) => {
    const {
        previewType = 'print',
        afterPrint = noop,
        sizeType = 'a4'
    } = props
    const [loading, setLoading] = React.useState(false)

    const { download, print } = useGeneratePDF({
        titles: props.titles,
        elementIds: React.Children.map(props.children, child => child.props.id),
        separate: props.separate,
        footerDisabled: props.footerDisabled,
        noStickyTableHeader: props.noStickyTableHeader,
        downloadCallback: ( status, pdfs ) => {
            setLoading(status === 'begin')
            if (status === 'finish') {
                props.done && props.done(pdfs)
            }
        },
        renderPageFooter: props.noPageNumber ? undefined : ( pdf, currentPage ) => {
            pdf
                .setTextColor('#111')
                .setFontSize(8)
                .text(`第${ currentPage }页`, pdf.internal.pageSize.getWidth() - 42, pdf.internal.pageSize.getHeight() - 12)
        },
        // renderPageHeader: (pdf, size) => {
        //     pdf
        //         .setTextColor('#111')
        //         .setFontSize(8)
        //         .text(`第${pdf.getCurrentPageInfo().pageNumber}页`, size.width - 42, 10)
        // }
    })

    React.useEffect(() => {
        window.onafterprint = () => {
            afterPrint()
        }
    }, [props.afterPrint])

    const _action = () => {
        if (previewType === 'download') {
            download(props.pdfUrls, undefined, props.plugins)
        } else {
            print(props.pdfUrls, undefined, props.plugins)
        }
    }

    return (
        <div id="print-container">
            <Spin spinning={ loading } tip="正在生成报告..">
                {
                    React.Children.map(props.children, (( child, idx ) => {
                        return (
                            <div className={ `print-layer ${ sizeType }` } key={ `print-item-${ idx }` }>
                                {
                                    child.props.id ? child : '请设置元素id'
                                }
                            </div>
                        )
                    }))
                }

                <div className="action-layer">
                    <Button onClick={ props.onCancel } style={ { marginRight: '20px' } }>取消</Button>
                    {
                        previewType === 'all' && (
                            <>
                                <Button type="primary" style={ { marginRight: '20px' } }
                                        onClick={ () => download(props.pdfUrls, undefined, props.plugins) }>下载</Button>
                                <Button type="primary"
                                        onClick={ () => print(props.pdfUrls, undefined, props.plugins) }>打印</Button>
                            </>
                        )
                    }
                    {
                        previewType !== 'all' && (
                            <Button type="primary" onClick={ _action }>{ previewType === 'print' ? '打印' : '下载' }</Button>
                        )
                    }
                    {
                        props.otherButtons?.map(t => {
                            return (
                                <Button type="primary" key={ `preview-other-button-${ t.title }` }
                                        style={ { marginLeft: '20px' } } onClick={ t.action }>{ t.title }</Button>
                            )
                        })
                    }
                </div>
            </Spin>
        </div>
    )
}

export default PDFPreview
