import React from 'react'
import './index.less'
import { Button, Spin } from 'antd'
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'

type DownloadStatus = 'begin' | 'finish'
export interface PrintContainerProps {
    onCancel?: () => void
    nodes: React.FC[]
    afterPrint?: () => void
    printType?: PrintType
    title?: string
    downloadCallback?: (s: DownloadStatus) => void
}

export type PrintType = 'download' | 'print'

const PrintContainer = (props: PrintContainerProps) => {
    const {
        printType = 'print'
    } = props
    const [ready, setReady] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setReady(true)
        }, 2000)
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    React.useEffect(() => {
        window.onafterprint = (e: Event) => {
            props.afterPrint && props.afterPrint()
            return true
        }
    }, [props.afterPrint])
    
    const _cancle = () => {
        props.onCancel && props.onCancel()
    }
    const _print = () => {
        window.print()
    }
    const _download = () => {
        setLoading(true)
        props.downloadCallback && props.downloadCallback('begin')
        const printLayer = document.getElementsByClassName('print-layer')[0] as HTMLElement
        const container = document.getElementById('print-container')
        // // document.getElementById('print-container').scrollTo({
        // //     top: 0,
        // //     behavior: 'smooth'
        // // })
        // window.scrollTo({
        //     top: 0,
        //     behavior: 'smooth'
        // })
        setTimeout(() => {
            printLayer && html2canvas(printLayer, {
                useCORS: true,
                x: printLayer.offsetLeft,
                y: printLayer.offsetTop,
                scrollY: container.scrollTop
            }).then(function(canvas) {
                const contentWidth = canvas.width / 2
                const contentHeight = canvas.height / 2
                //一页pdf显示html页面生成的canvas高度;
                const pageHeight = (contentWidth / 592.28) * 841.89
                //未生成pdf的html页面高度
                let leftHeight = contentHeight
                //页面偏移
                let position = 0
                //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
                const imgWidth = 595.28
                const imgHeight = 592.28/contentWidth * contentHeight
            
                const pageData = canvas.toDataURL('image/jpeg', 1.0)
            
                const pdf = new jspdf('p', 'pt', 'a4')
            
                //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
                //当内容未超过pdf一页显示的范围，无需分页
                if (leftHeight < pageHeight) {
                    pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
                } else {    // 分页
                    while(leftHeight > 0) {
                        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                        leftHeight -= pageHeight
                        position -= 841.89
                        //避免添加空白页
                        if(leftHeight > 0) {
                            pdf.addPage()
                        }
                    }
                }
                pdf.save(`${props.title || '检验'}报告.pdf`)
                // const iframe = document.createElement('iframe')
                // const url = URL.createObjectURL(pdf.output('blob'))
                // iframe.src = url
                // document.body.appendChild(iframe)
                // iframe.contentWindow.print()
                // const w = window.open(pdf.output('datauristring'))
                // w.print()
                props.downloadCallback && props.downloadCallback('finish')
                setLoading(false)
            })
        }, 500)
    }
    return (
        <div id='print-container'>
            <Spin spinning={loading}>
                {
                    props.nodes.map((T, idx) => {
                        return (
                            <div className='print-layer' style={{ pageBreakBefore: 'always' }} key={`print-item-${idx}`} >
                                <T />
                            </div>
                        )
                    })
                }

                <div className='action-layer'>
                    <Button onClick={_cancle} style={{ marginRight: '20px' }}>取消</Button>
                    <Button disabled={!ready} type='primary' onClick={printType === 'print' ? _print : _download}>{printType === 'print' ? '打印' : '下载'}</Button>
                </div>
            </Spin>
        </div>
    )
}

export default PrintContainer