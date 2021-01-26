import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import PrintContainer, { PrintContainerProps } from './index'
import _ from 'lodash'
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'
export interface usePrintProps extends PrintContainerProps {
    onSuccess?: () => void
}

let originDisplay = ''

const usePrint = (props: usePrintProps) => {
    const [visible, setVisible] = React.useState(false)
    const ele = () => (
        ReactDOM.createPortal(<PrintContainer {..._.omit(props, ['onSuccess'])} onCancel={() => setVisible(false)} />, document.body)
    )
    const show = () => {
        setVisible(true)
    }
    React.useEffect(() => {
        if (visible) {
            originDisplay = document.getElementById('root').style.display
            document.getElementById('root').style.display = 'none'
        } else {
            document.getElementById('root').style.display = originDisplay
        }
    }, [visible])
    
    const download = async (title?: string) => {
        return new Promise(resolve => {
            const ele = <PrintContainer {..._.omit(props, ['onSuccess'])} onCancel={() => setVisible(false)} />
            const downloadLayer = document.createElement('div')
            downloadLayer.style.zIndex = '-1'
            downloadLayer.style.position = 'fixed'
            downloadLayer.style.top = '0'
            document.body.appendChild(downloadLayer)
            ReactDOM.render(ele, downloadLayer, () => {
                setTimeout(() => {
                    const printLayer = document.getElementsByClassName('print-layer')[0] as HTMLElement
                    printLayer && html2canvas(printLayer, {
                        useCORS: true,
                        x: printLayer.offsetLeft,
                        y: printLayer.offsetTop,
                        scrollY: printLayer.scrollTop
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
                        pdf.save(`${title || '检验'}报告.pdf`)
                        resolve(true)      
                    }).catch (e => {
                        resolve(false)
                    })
                }, 500)
            })
        })
    }
    return {
        show: show,
        Ele: visible ? ele : () => <div />,
        download: download
    }
}

export default usePrint