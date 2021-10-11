/*
 * @Date: 2021-10-08 16:58:19
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-11 09:51:27
 * @Description: file content
 */
import React from 'react'
import PDFPreview from '../../../components/libs/pdf/preview'
import WatermarkPlugin from '../../../components/libs/pdf/plugins/watermark'

const PdfExample = () => {
    return (
        <PDFPreview
            onCancel={() => {}}
            plugins={[WatermarkPlugin({
                text: '测试水印',
                density: {
                    x: 1,
                    y: 1,
                    xTransform: -100
                },
                fontSize: 80
            })]}
        >
            <div id='pdf'>
                <div/>
                {
                    [...Array(12).keys()].map((idx) => (
                        <div key={idx} className={idx % 3 === 2 ? 'pdf-seperator' : ''} style={{
                            backgroundColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
                            width: '100%',
                            height: 80,
                            marginBottom: 20
                        }} />
                    ))
                }
                <div />
            </div>
        </PDFPreview>
    )
}

export default PdfExample