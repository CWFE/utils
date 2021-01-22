import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import PrintContainer, { PrintContainerProps } from './index'
import _ from 'lodash'

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
    return {
        show: show,
        Ele: visible ? ele : () => <div />
    }
}

export default usePrint