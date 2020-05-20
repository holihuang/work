import React from 'react'
import { Select } from 'antd'

const { Option } = Select
const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const chnUnitSection = ['', '万', '亿', '万亿', '亿亿']
const chnUnitChar = ['', '十', '百', '千']

function sectionToChinese(section) {
    let strIns = ''
    let chnStr = ''
    let unitPos = 0
    let zero = true
    while (section > 0) {
        const v = section % 10
        if (v === 0) {
            if (!zero) {
                zero = true
                chnStr = chnNumChar[v] + chnStr
            }
        } else {
            zero = false
            strIns = chnNumChar[v]
            strIns += chnUnitChar[unitPos]
            chnStr = strIns + chnStr
        }
        unitPos += 1
        section = Math.floor(section / 10)
    }
    return chnStr
}

function numberToChinese(num) {
    let unitPos = 0
    let strIns = ''
    let chnStr = ''
    let needZero = false

    if (num === 0) {
        return chnNumChar[0]
    }

    while (num > 0) {
        const section = num % 10000
        if (needZero) {
            chnStr = chnNumChar[0] + chnStr
        }
        strIns = sectionToChinese(section)
        strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0]
        chnStr = strIns + chnStr
        needZero = (section < 1000) && (section > 0)
        num = Math.floor(num / 10000)
        unitPos += 1
    }

    return chnStr
}

function delay(s) {
    return new Promise(resolve => {
        setTimeout(resolve, s)
    })
}

const createOptions = o => <Option key={`${o.id}`} value={o.id}>{o.name}</Option>

export { numberToChinese, delay, createOptions }
