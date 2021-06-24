import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios'

/**
 * 检测对象类型
 * @param obj
 * @param type
 */
function checkObjType (obj: any, type: string) {
    return Object.prototype.toString.call(obj) === `[object ${ type }]`
}

let index = 0

export type UtilAxiosRequestConfig = AxiosRequestConfig

class Request {
    public axiosInstance: AxiosInstance
    public cancelTokenSources: {
        [url: string]: Canceler
    } = {}
    public getCancelTokenKey = (config: Readonly<UtilAxiosRequestConfig>) => {
        let dataKey = ''
        if (checkObjType(config.data, 'FormData')) {
            if (config.data.entries) {
                for (const [key, value] of config.data.entries()) {
                    if (checkObjType(value, 'File') || checkObjType(value, 'Blob')) {
                        dataKey += `key:${ key }, value:${ +new Date() + index }`
                        index++
                    } else {
                        dataKey += `key:${ key }, value:${ JSON.stringify(value) }`
                    }
                }
            } else {
                dataKey += `formData: ${ +new Date() + index }`
                index++
            }
        } else {
            dataKey += JSON.stringify(config.data)
        }
        return (config.method || 'GET')?.toUpperCase() + '?' + config.url + dataKey + JSON.stringify(config.params)
    }
    public request = async function AxiosRequest<T = any> (config: UtilAxiosRequestConfig, retryCount?: number): Promise<AxiosResponse<T>> {
        try {
            // 执 行
            const response = await this.axiosInstance(config)
            return Promise.resolve(response)
        } catch (error) {
            if ((!retryCount || retryCount <= 0) || Axios.isCancel(error)) {
                return Promise.reject(error)
            } else {
                return await AxiosRequest(config, retryCount - 1)
            }
        }
    }

    constructor () {
        this.axiosInstance = Axios.create()
        this.axiosInstance.interceptors.request.use(config => {
            // 判断缓存中是否有相同请 求
            const cancelTokenKey = this.getCancelTokenKey(config)
            if (this.cancelTokenSources[cancelTokenKey]) {
                this.cancelTokenSources[cancelTokenKey]()
            }
            config.cancelToken = config.cancelToken || new Axios.CancelToken(c => {
                this.cancelTokenSources[cancelTokenKey] = c
            })
            return Promise.resolve(config)
        }, error => {
            return Promise.reject(error)
        })
    }
}

export const RequestInstance = new Request()
export default Axios
