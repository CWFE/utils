import React, { PropsWithChildren, useState } from 'react'
import ReactDOM from 'react-dom'
import PrintContainer, { PrintContainerProps, PrintType } from './index'
import _ from 'lodash'

export interface usePrintProps extends PrintContainerProps {
    onSuccess?: () => void
}

let originDisplay = ''

const usePrint = (props: usePrintProps) => {
    const [visible, setVisible] = React.useState(false)
    const [type, setType] = useState<PrintType>('print')
    const [title, setTitle] = useState('')
    const ele = () => (
        ReactDOM.createPortal(<PrintContainer {..._.omit(props, ['onSuccess'])} printType={type} title={title} onCancel={() => setVisible(false)} />, document.body)
    )
    const show = (type?: PrintType, title?: string) => {
        setVisible(true)
        setType(type)
        setTitle(title)
    }
    const hide = () => {
        setVisible(false)
    }
    React.useEffect(() => {
        if (visible) {
            originDisplay = document.getElementById('root').style.display
            document.getElementById('root').style.display = 'none'
        } else {
            document.getElementById('root').style.display = originDisplay
        }
    }, [visible])

    return {
        show: show,
        Ele: visible ? ele : () => <div />,
        hide: hide
    }
}

export default usePrint
