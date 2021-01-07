import React from 'react'
import './index.less'

export interface PrintContainerProps {
    onCancel?: () => void
    nodes: React.FC[]
    afterPrint?: () => void
}

const PrintContainer = (props: PrintContainerProps) => {
    const _cancle = () => {
        props.onCancel && props.onCancel()
    }
    const _print = () => {
        window.print()
    }
    React.useEffect(() => {
        window.onafterprint = (e: Event) => {
            props.afterPrint && props.afterPrint()
            return true
        }
    }, [props.afterPrint])
    return (
        <div id='print-container'>
            <div className='action-layer'>
                <p onClick={_cancle}>取消</p>
                <p onClick={_print}>打印</p>
            </div>
            {
                props.nodes.map((T, idx) => {
                    return (
                        <div className='print-layer' key={`print-item-${idx}`} >
                            <T />
                        </div>
                    )
                })
            }
        </div>
    )
}

export default PrintContainer