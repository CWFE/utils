/*
 * @Date: 2021-01-06 13:27:05
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-09 13:24:48
 * @Description: file content
 */
import PDFPreview from './pdf/preview'
import useGeneratePDF from './pdf/generatePDF'
import imageEditor from './image-editor/imageEditorManager'
import PDFWatermarkPlugin from './pdf/plugins/watermark'

const plugins = {
    PDFWatermarkPlugin
}

export {
    PDFPreview,
    useGeneratePDF,
    imageEditor,
    plugins
}
