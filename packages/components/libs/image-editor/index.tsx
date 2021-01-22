import React from 'react'
import { Modal, Spin } from 'antd'
import ReactImageEditor from 'react-img-editor'
import { ModalProps } from 'antd/es/modal'
import ReactDOM from 'react-dom'
import 'react-img-editor/assets/index.css'

export type HandleFileBlob = (blob: Blob) => Promise<boolean>

interface CustomImageEditorProps extends Pick<ModalProps, 'visible'> {
    src?: string
    loading?: boolean
    stage?: any
    fileKey?: string
    onHandleFileBlob?: HandleFileBlob
}
export interface CustomImageInstance {
    editImage: (src: string) => void
    endEdit: () => void
    setOnHandleFileBlob: (h: HandleFileBlob) => void
}
class CustomImageEditor extends React.Component<CustomImageEditorProps, CustomImageEditorProps> {
    static newInstance: (
        callback: (instance: CustomImageInstance) => void
    ) => void

    state: CustomImageEditorProps = {
        loading: false,
        ...this.props
    }

    show(src: string): void {
        this.setState({
            src: src.replace('https', 'http'),
            visible: true,
        })
    }
    hide(): void {
        this.setState({
            visible: false
        })
    }

    private handleOk = () => {
        this.setState({
            loading: true
        })
        const canvas = this.state.stage.clearAndToCanvas() as HTMLCanvasElement

        canvas.toBlob(async blob => {
            if (this.state.onHandleFileBlob) {
                const res = await this.state.onHandleFileBlob(blob)
                if (res) {
                    this.setState({
                        loading: false,
                        visible: false
                    })
                } else {
                    this.setState({
                        loading: false
                    })
                }
            } else {
                this.setState({
                    loading: false,
                    visible: false
                })
            }
        }, '', 1)
    }

    render() {
        return (
            <Modal
                visible={this.state.visible}
                closable={false}
                maskClosable
                destroyOnClose
                onCancel={this.hide.bind(this)}
                onOk={this.handleOk.bind(this)}
                className='flex items-center justify-center'
            >
                <Spin spinning={this.state.loading}>
                    <ReactImageEditor
                        src={this.state.src}
                        width={1200}
                        height={600}
                        crossOrigin='*'
                        getStage={stage => {
                            this.setState({
                                stage: stage
                            })
                        }}
                    />
                </Spin>

            </Modal>
        )
    }
}

CustomImageEditor.newInstance = function newCustomImageEditor(callback) {
    let called = false
    if (called) {
        return
    }
    function ref(editor: CustomImageEditor) {
        called = true

        callback({
            editImage(src: string) {
                editor?.show(src)
            },
            endEdit() {
                editor?.hide()
            },
            // setOnUploadSuccess(callback: ImageSrcCallback) {
            //     editor.setState({
            //         onUploadSuccess: callback
            //     })
            // }
            setOnHandleFileBlob(h: HandleFileBlob) {
                editor?.setState({
                    onHandleFileBlob: h
                })
            }
        })
    }
    const div = document.createElement('div')

    ReactDOM.render(<CustomImageEditor ref={ref} />, div)
}

export default CustomImageEditor
