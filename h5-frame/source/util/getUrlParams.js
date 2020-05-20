const typeSet = {
    0: 'hash',
    1: 'search',
}

// 解析参数
function parseParams(flag = 0) {
    const params = {}
    const [, paramsStr = ''] = location[typeSet[flag]].split('?')
    paramsStr.split('&').forEach(item => {
        if(item.indexOf('=') !== -1) {
            const [key, value] = item.split('=')
            const val = /\/$/.test(value) ? value.slice(0, -1) : value
            params[key] = val
        }
    })
    return params
}

// hash参数
function getHashParams() {
    return parseParams(0)
}

// 路径参数
function getQueryParams() {
    return parseParams(1)
}


export default function() {
    const hashParams = getHashParams()
    const queryParams = getQueryParams()
    return {
        ...queryParams,
        ...hashParams,
    }
}