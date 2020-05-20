/*
* @file: component
* @author: gushouchuang
* @date: 2019-12-09
* */
import React from 'react'
import PropTypes from 'prop-types'
import E from '@sunl-fe/wangeditor'
// import noop from 'lodash/noop'
import { getJSON } from '@sunl-fe/dataservice'
import { Modal } from 'antd'

const menus = [
    'head', // 标题
    'bold', // 粗体
    'italic', // 斜体
    'underline', // 下划线
    // 'strikeThrough',  // 删除线
    'foreColor', // 文字颜色
    'backColor', // 背景颜色
    'link', // 插入链接
    'list', // 列表
    'justify', // 对齐方式
    // 'quote',  // 引用
    // 'emoticon',  // 表情
    'image', // 插入图片
    // 'table',  // 表格
    // 'video',  // 插入视频
    // 'code',  // 插入代码
    'undo', // 撤销
    'redo', // 重复
]

class ContentEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        const self = this
        const { height, resizeHeight, editComponent } = this.props
        const editorDom = this.refs.editorElem

        this.editor = new E(editorDom)
        // debugger
        Object.assign(this.editor.customConfig, {
            // 开启纯文本粘贴模式
            resizeHeight,
            plainTxtMode: true,
            menus,
            onchange: (html, beforeHtml) => {
                // self.onChange(html, beforeHtml)
                self.onChange(html)
            },
            height,
            zIndex: 2,
            uploadImgServer: '/',
            // 编辑器有自己的文件大小限制，这里设置一下不让他提示。
            uploadImgMaxSize: 10e23,
            customUploadImg: files => {
                if (files[0] && files[0].size && files[0].size > 2097152) {
                    Modal.info({
                        title: '图片不满足以下要求，请重新上传。',
                        content: (
                            <div>
                                <p>图片大小：不大于2MB</p>
                            </div>
                        ),
                    })
                    return
                }
                const imgFile = new FileReader()
                imgFile.readAsDataURL(files[0])

                imgFile.onload = function (theFile) {
                    const image = new Image()
                    image.src = theFile.target.result

                    image.onload = function () {
                        // if (this.width > 1080 || (files[0] && files[0].size && files[0].size > 2097152)) {
                        //     Modal.info({
                        //         title: '图片不满足以下要求，请重新上传。',
                        //         content: (
                        //             <div>
                        //                 <p>宽：1080以内</p>
                        //                 <p>长：不限制</p>
                        //                 <p>图片大小：不大于2MB</p>
                        //             </div>
                        //         ),
                        //     })
                        //     return
                        // }

                        const formData = new FormData()
                        formData.append('picFile', files[0])
                        getJSON('/community-manager-war/base/uploadPicture.action', formData).then(data => {
                            // C端要求传宽高，现在用原生的方法实现，不调用提供的方法了。
                            // insert(data.linkUrl)
                            self.editor.cmd.do('insertHTML', `<img src="${data[0].linkUrl}" alt="" />`)
                        }).catch(err => {
                            Modal.error({
                                title: `上传图片失败。原因：${err}`,
                            })
                            return ''
                        }).then(() => {

                        })
                    }
                }
            },
        })
        this.editor.create()
        this.editor.txt.html(editComponent.state.content)
        // if (disabled) {
        //     this.editor.$textElem.attr('contenteditable', false)
        // }
    }

    componentWillUnmount() {
        this.refs.editorElem.parentNode.removeChild(this.refs.editorElem) // eslint-line-disabeld
    }

    onChange(html) {
        this.props.changeState(html)
    }

    render() {
        // const { style } = this.props
        return (
            <div style={{ width: '600px' }}>
                <div ref='editorElem' />
            </div>
        )
    }
}


ContentEditor.propTypes = {
    height: PropTypes.number,
    content: PropTypes.string,
    resizeHeight: PropTypes.bool,
    changeState: PropTypes.func,
    editComponent: PropTypes.isRequired,
}

ContentEditor.defaultProps = {
    changeState: () => {},
    height: 320,
    resizeHeight: false,
    content: '',

}

export default ContentEditor
