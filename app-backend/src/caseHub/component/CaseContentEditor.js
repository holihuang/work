/*
*@ file: 富文本编辑
*@ author: huanghaolei
@ date: 2019-05-15
*/
import React from 'react'
import { Modal, Button } from 'antd'
import E from '@sunl-fe/wangeditor'
import { getJSON } from '@sunl-fe/dataservice'

import menusCfg from '../cfg/menusCfg.js'

let isTyping = false
const VIEW_HEIGHT = 640
const newPicStyleLong = 'style="width:100%;height:auto!important;"'

class CaseContentEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        const { refs: { edit }, props: { content, dispatch } } = this
        this.editor = new E(edit)
        Object.assign(this.editor.customConfig, {
            height: VIEW_HEIGHT - 80,
            resizeHeight: false,
            plainTxtMode: true,
            menus: menusCfg.menus,
            // 上传到服务器
            uploadImgServer: '/',
            // 取消编辑器默认图片的校验
            uploadImgMaxSize: 10e23,
            customUploadImg: files => {
                if (files[0] && files[0].size && files[0].size > 30 * 1024 * 1024) {
                    Modal.info({
                        title: '图片不满足以下要求，请重新上传。',
                        content: (<div><p> 图片大小： 不大于30MB </p></div>),
                    })
                    return
                }
                const imgFile = new FileReader()
                imgFile.readAsDataURL(files[0])

                imgFile.onload = theFile => {
                    const image = new Image()
                    image.src = theFile.target.result

                    image.onload = _ => {
                        if ((files[0] && files[0].size && files[0].size > 30 * 1024 * 1024)) {
                            Modal.info({
                                title: '图片不满足以下要求，请重新上传。',
                                content: (
                                    <div>
                                        <p> 宽： 不限制 </p>
                                        <p> 长： 不限制 </p>
                                        <p> 图片大小： 不大于30MB </p>
                                    </div>
                                ),
                            })
                            return
                        }
                        const formData = new FormData()
                        formData.append('picFile', files[0])
                        getJSON('/community-manager-war/base/uploadPicture.action', formData).then(data => {
                            const [uploadedInfo] = data || []
                            const { linkUrl } = uploadedInfo
                            this.editor.cmd.do('insertHTML', `<img src="${linkUrl}" alt="pic" />`)
                        }).catch(err => {
                            Modal.error({
                                title: `上传图片失败。原因：${err}`,
                            })
                        })
                    }
                }
            },
        })
        this.editor.create()
        this.editor.txt.html(content)
        const { $textElem } = this.editor
        const richTxtDom = $textElem[0]
        // 非受控part
        richTxtDom.addEventListener('compositionstart', () => {
            isTyping = true
        })
        richTxtDom.addEventListener('compositionend', () => {
            isTyping = false
        })
        richTxtDom.addEventListener('input', e => {
            const html = this.transRichTxtChildToStr(e.target)
            // 格式化domstr，eg：有序，无序样式处理，图片maxWidth上限
            const formattedDomStr = this.formatDomStr(html)
            dispatch('onChangeRichText', { content: formattedDomStr })
        })
    }

    formatDomStr = html => {
        // 有序/无序列表符号style样式处理
        const mappedListStyle = {
            ul: 'disc',
            ol: 'decimal',
        }
        let output = html
        Object.keys(mappedListStyle).forEach(item => {
            const reg = new RegExp(`<${item}[^>]*>`)
            if (reg.test(html)) {
                const matchedStr = html.match(reg)[0]
                if (matchedStr) {
                    const arr = matchedStr.split('>')
                    arr.push(` style="list-style: ${mappedListStyle[item]}; margin-left: 40px; padding: 8px 0px"`)
                    const tempt = arr.reduce((res, itm) => {
                        const temp = res + itm
                        return temp
                    }, '')
                    const tag = `${tempt}>`
                    output = output.replace(new RegExp(matchedStr, 'g'), tag)
                }
            }
        })

        // 格式化图片样式
        output = this.transPicToFixedWidth(output)
        // 删除时，富文本没有被完全清除（单独兼容）
        if (output === '<p><br></p>') {
            output = ''
        }
        return output
    }

    transImgToAttr = imgStr => {
        const srcAttrReg = /^src=('|")?http/
        const tailTagReg = /\s?\/?>$/
        const tailTag = ' />'
        let isExtenalPicTag = false
        const str = imgStr.replace(tailTagReg, tailTag)
        str.split(' ').forEach(item => {
            if (srcAttrReg.test(item)) {
                // 外链图片
                isExtenalPicTag = true
            }
        })
        return {
            isExtenalPicTag,
            itm: str,
        }
    }

    addStyleAttr = (...args) => {
        const [str] = args
        const beReplacedStyle = newPicStyleLong
        const arr = str.trim().split(' ')
        arr.splice(arr.length - 1, 0, beReplacedStyle)
        let outStr = ''
        arr.forEach(item => {
            outStr += ` ${item}`
        })
        return outStr
    }

    transPicToFixedWidth = html => {
        const reg = /<img[^>]*>/
        const regWithGlobal = /<img[^>]*>/g
        const regStyle = /style="[^<>]*"/
        let output = html
        let oldPicArr = []
        const oldExternalPicArr = []
        const newPicArr = []
        if (reg.test(html)) {
            oldPicArr = [...html.match(regWithGlobal)]
            oldPicArr.forEach(item => {
                const { isExtenalPicTag } = this.transImgToAttr(item)
                if (isExtenalPicTag) {
                    let newPicItm = ''
                    const hasOldStyle = regStyle.test(item)
                    if (hasOldStyle) {
                    // 原有字符串有样式，做替换
                        const matchedStyle = item.match(regStyle)[0]
                        const beReplacedStyle = newPicStyleLong
                        newPicItm = item.replace(matchedStyle, beReplacedStyle)
                    } else {
                    // 原有字符串没样式，统一添加
                        newPicItm = this.addStyleAttr(item)
                    }
                    newPicArr.push(newPicItm)
                    oldExternalPicArr.push(item)
                }
            })
            oldExternalPicArr.forEach((item, index) => {
                output = output.replace(item, newPicArr[index])
            })
        }
        return output
    }

    transRichTxtChildToStr = dom => {
        const { childNodes = [] } = dom
        let html = ''
        childNodes.forEach(item => {
            const { outerHTML = '', data = '', nodeType = 3 } = item
            // 文本单独处理下
            html += +nodeType === 3 ? data : outerHTML
        })
        return html
    }

    handleSave = (opt = {}) => {
        const { props: { handleSave } } = this
        handleSave(opt)
    }

    render() {
        const { props: { content, publishState } } = this
        const editWrapperStyle = {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
        }
        const previewProps = {
            ref: 'preview',
            style: {
                width: 480,
                height: VIEW_HEIGHT,
                maxHeight: VIEW_HEIGHT,
                overflowY: 'auto',
                overflowX: 'hidden',
                border: '1px solid #ccc',
            },
        }
        const preHeaderProps = {
            style: {
                height: 26,
                borderBottom: '1px solid #ccc',
                color: '#333',
                backgroundColor: '#f1f1f1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
        }
        const preBodyProps = {
            dangerouslySetInnerHTML: {
                __html: content,
            },
            style: {
                padding: 5,
                wordWrap: 'break-word',
                wordBreak: 'normal',
            },
        }
        const editorWrapperProps = {
            style: {
                width: 'calc(100% - 500px)',
            },
        }
        const editorProps = { ref: 'edit' }
        return (
            <div style={editWrapperStyle}>
                <div {...previewProps}>
                    <div {...preHeaderProps}>
                        页面效果预览
                    </div>
                    <div {...preBodyProps} />
                </div>
                <div {...editorWrapperProps}>
                    <div {...editorProps} />
                    <div style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', height: 54,
                    }}
                    >
                        {
                            !+publishState ? (
                                <Button style={{ marginRight: 10 }} onClick={() => { this.handleSave({ isTempSave: 1 }) }}>暂存</Button>
                            ) : null
                        }
                        <Button type="primary" onClick={() => { this.handleSave() }}>保存并发布</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default CaseContentEditor
