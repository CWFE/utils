import React from 'react'
import './index.less'
import { Button } from 'antd'

import html2canvas from 'html2canvas'
import jspdf from 'jspdf'
export interface PrintContainerProps {
    onCancel?: () => void
    nodes: React.FC[]
    afterPrint?: () => void
}

const PrintContainer = (props: PrintContainerProps) => {
    const [ready, setReady] = React.useState(false)

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setReady(true)
        }, 2000)
        return () => {
            clearTimeout(timeout)
        }
    }, [])

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
            {
                props.nodes.map((T, idx) => {
                    return (
                        <div className='print-layer' key={`print-item-${idx}`} >
                            <T />
                        </div>
                    )
                })
            }

            <div className='action-layer'>
                <Button onClick={_cancle} style={{ marginRight: '20px' }}>取消</Button>
                <Button disabled={!ready} type='primary' onClick={_print}>打印</Button>
            </div>
        </div>
    )
}

export default PrintContainer