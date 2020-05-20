/*
** @file: UploadPic
** @author: huanghaolei
** @date: 2019-12-13
*/
import React from 'react'
import { Toast } from 'antd-mobile'
import cfg from '../cfg'
import getJSONBlob from '../../../common/getJSONBlob'
import urls from '../../../constants/URLS'
import expandIcon from '../../../images/userCenter/expand.png'
import style from '../../../styles/less/uploadPic.less'

const defaultFlag = 1
const target = document.getElementById('app')

class UploadPic extends React.Component {
    static defaultProps = {
        flag: defaultFlag,    // 1：头像， 2：二维码
        profile: {},
    }
    constructor(props) {
        super(props)
        this.state = {
            portrait: '',
            qrCode: '',
        }
        this.uploadIptArr = []
    }

    componentDidMount() {
        this.props.onInsert(this.upload)
    }

    componentWillUnmount() {
        // 移除隐藏的input type=file
        this.releaseUnlessIpt()
    }

    releaseUnlessIpt = _ => {
        this.uploadIptArr.forEach((item) => {
            target.removeChild(item)
        })
    }

    transObj2Str = obj => {
        return Object.keys(obj).reduce((res, item) => {
            return res += `${item}:${obj[item]};`
        }, '')
    }
    getIndex = (arr, ipt)=> {
        let index = -1
        for(let i = 0; i < arr.length; i++) {
            if(arr[i] === ipt)  return i
        }
        return index
    }

    toggleIptDom = (flag, ipt) => {
        if(flag) {
            this.uploadIptArr.push(ipt)
        } else {
            const index = this.getIndex(this.uploadIptArr, ipt)
            if(index > -1) {
                this.uploadIptArr.splice(index, 1)
            }
        }
    }

    upload = opt => {
        const { flag, key } = opt

        const urlSet = {
            portrait: urls.UPLOAD_PC_PICTURE_URL,
            qrCode: urls.UPLOAD_QR_CODE_URL,
        }

        const { onChange } = this.props
        const input = document.createElement('input')
        const fileAttr = {
            type: 'file',
            accept: 'image/*',
            style: {
                display: 'none',
            },
            onchange: e => {
                const { files: [file] } = e.target
                const formData = new FormData()
                formData.append('upfile', file)
                Toast.loading('上传中...')
                getJSONBlob(urlSet[key], formData).then(res => {
                    target.removeChild(input)
                    this.toggleIptDom(0, input)
                    const { url } = res
                    // const [{ key }]  = cfg.list.filter(item => item.picType === flag)
                    this.setState({
                        [key]: url,
                    })
                    onChange(url)
                })
            },
        }
        Object.entries(fileAttr).forEach(([key, value]) => {
            const val = typeof value === 'object' ? this.transObj2Str(value) : value
            input[key] = val
        })
        // this.uploadIptArr.push(input)
        this.toggleIptDom(1, input)
        target.appendChild(input)
        input.click()
    }

    mergeImgUrl = _ => {
        const list = ['portrait', 'qrCode']
        const { profile } = this.props // from props
        // from state
        const obj = {}
        list.filter(item => this.state[item]).forEach(item => {
            obj[item] = this.state[item]
        })
        return {
            ...profile,
            ...obj,
        }
    }

    render() {
        let { flag } = this.props
        const { portrait, qrCode } = this.mergeImgUrl()
        return (
            <div className={style.wrapper}>
                {
                    flag === 1 ? (
                        <img src={portrait} className={style.avatar} />
                    ) : (
                        <div className={style.qrWrapper}>
                            <img src={qrCode} className={style.qrCode} />
                        </div>
                    )
                }
                <img src={expandIcon} className={style.expand} />
            </div>
        )
    }
}

export default UploadPic