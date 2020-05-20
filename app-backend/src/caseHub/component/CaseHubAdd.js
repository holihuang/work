/*
* @file: add component
* @author: huanghaolei
* @date: 2018-09-18
* */
import React from 'react'
import { Filters } from 'tpl2'
import { Tabs, Button, Upload, message } from 'antd'
// import filtersCfg from '../cfg/filtersCfg'
import CaseContentEditor from './CaseContentEditor'
import addFilter from '../cfg/addFilter'
import service from '../service'
import globalStyle from '../style/global.less'

const { TabPane } = Tabs
const uploadPicTip = '请上传400*300的图片'
const EditProcessTabs = ['1. 案例标签设置', '2. 案例内容编辑']
const uploadName = '上传封面图'
const uploadUrl = '/community-manager-war/base/uploadPicture.action'
let validateCoverPic = true

class CaseHubAdd extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    handleClkBack = () => {
        if (confirm('你确定要放弃编辑的内容吗？')) {
            window.location.hash = '/caseHub'
        }
    }

    handleSave = opt => {
        const { dispatch } = this.props
        const { isTempSave = 0 } = opt
        let tip = ''
        if (+isTempSave) {
            tip = '暂存成功'
        } else {
            tip = window.location.hash.includes('edit') ? '修改成功' : '新建成功'
        }
        dispatch('onSave', { tip, isTempSave })
    }

    checkPicWidthHeight = (...args) => {
        const [uploadWidth, uploadHeight] = args
        const [width, height] = uploadPicTip.replace(/\D/g, ' ').trim().split(' ')
        if (+uploadWidth !== +width || +uploadHeight !== +height) {
            validateCoverPic = false
        }
    }

    handleUploadChange = info => {
        const { dispatch } = this.props
        const { file: { status, name, response = {} } } = info
        if (status === 'done') {
            const { resultMessage = [] } = response
            const [res] = resultMessage
            const { linkUrl, width, height } = res
            // 校验图片尺寸
            this.checkPicWidthHeight(width, height)
            if (!validateCoverPic) {
                message.warning(uploadPicTip)
                return
            }
            dispatch('onUploadedCoverUrl', { coverUrl: linkUrl })
        } else if (status === 'error') {
            message.error(`${name}上传失败`)
        }
    }

    handleTabChange = key => {
        const { dispatch } = this.props
        dispatch('onChangeEditTabs', { key })
    }

    renderTabs() {
        return EditProcessTabs.map((item, index) => <TabPane tab={item} key={index + 1} />)
    }

    render() {
        const { activeKey = '1', publishState, coverUrl } = this.props
        const operations = (
            <div style={{ marginRight: 15 }}>
                <Button style={{ marginRight: 10 }} onClick={this.handleClkBack}>取消</Button>
                <Button type="primary" onClick={this.handleSave}>保存并发布</Button>
            </div>
        )
        const tabsProps = {
            activeKey,
            animated: true,
            tabBarExtraContent: operations,
            onChange: this.handleTabChange,
        }

        const filtersProps = addFilter(this)
        const filterWrapperProps = {
            style: {
                padding: '10px 30px',
            },
        }
        const btnStyle = {
            padding: '10px 30px',
        }
        const uploadProps = {
            name: 'picFile',
            action: uploadUrl,
            showUploadList: false,
            onChange: info => {
                this.handleUploadChange(info)
            },
        }
        const tempBtnProps = {
            type: 'primary',
            onClick: () => {
                this.handleSave({ isTempSave: 1 })
            },
        }
        const caseContentEditorProps = {
            ...this.props,
            handleSave: this.handleSave,
        }
        return (
            <div>
                <Tabs {...tabsProps}>
                    {
                        this.renderTabs()
                    }
                </Tabs>
                <div {...filterWrapperProps}>
                    {
                        +activeKey === 1 ? (
                            <div>
                                <Filters {...filtersProps} />
                                <div style={{ ...btnStyle, width: '400px' }}>
                                    <Upload {...uploadProps}>
                                        <Button>{uploadName}</Button>
                                    </Upload>
                                    <div style={{ marginLeft: '10px', display: 'inline-block' }}>{uploadPicTip}</div>
                                    {
                                        (coverUrl && validateCoverPic) ? (
                                            <img style={{ width: '160px', height: '120px', marginTop: '10px' }} src={coverUrl} alt={uploadName} />
                                        ) : null
                                    }
                                </div>
                                {
                                    !+publishState ? (
                                        <div style={btnStyle}>
                                            <Button {...tempBtnProps}>暂存并继续</Button>
                                        </div>
                                    ) : null
                                }
                            </div>
                        ) : <CaseContentEditor {...caseContentEditorProps} />
                    }
                </div>
            </div>
        )
    }
}

export default CaseHubAdd
