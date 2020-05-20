import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Tag, Input, Pagination, Popover, Icon } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
import getJSON from '../../common/getJSON'
import {url} from '../../common/url';
import ImgRender from 'common/reactComponent/tableRender/ImgRender'
import EditModal from '../../messageManage/conversation/chatDialog/quickReplyReact/editModal'
import ShowAll from '../../common/showAll/showAll'
import { global } from 'common/global'
import PopOver from './popover'

const ButtonGroup = Button.Group
const { Search } = Input

class TelePhone extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowImg: false,
            index: null,
            delVisible: false,
            showAll: false,
            showChoseModal: true,
            showEditModal: false,
            quickReplys: [],
            quickReplysTop: [],
            quickReplysNontop: [],
            quickReplyLabels: [],
            totalCount: null,
            pageCount: null,
            pageIndex: null,
            countPerPage: null,
            editModalTitle: '',
            editModalContent: {},
            queryParams: {
                searchContent: '',
                labelId: -1,
                pageNo: 1,
                pageSize: 10,
            },
            isShowClearSearch: false,
        }
        this.sendMessage = props.sendMessage
        this.generateKey = props.generateKey
        this.getDefaultParams = props.getDefaultParams
    }
    componentDidMount() {
        this.getQuickReplyLabels()
        // this.getQuickReplys()
        this.getQuickReplysTop()
        this.getQuickReplysNontop()
    }
    getQueryParamsClone = _ => {
        const { queryParams } = this.state
        return cloneDeep(queryParams)
    }
    getLabelsClone = _ => {
        const { quickReplyLabels } = this.state
        return cloneDeep(quickReplyLabels)
    }
    getQuickReplysRequested = (params = {}, top, clickMore = false) => {
        const { queryParams } = this.state
        service.getCommonPhraseList({
            teacherAccount: common.getUserInfo().userAccount,
            pageNo: 1,
            pageSize: 10,
            ...queryParams,
            ...params,
            top,
        }, response => {
            if (response.rs) {
                if (top === 1) {
                    const { resultList: quickReplys } = response.resultMessage
                    this.setState({ quickReplysTop: quickReplys })
                } else if (top === 0) {
                    const { resultList: quickReplys } = response.resultMessage
                    const {
                        totalCount, pageCount, pageIndex, countPerPage,
                    } = response.resultMessage
                    this.setState({
                        totalCount,
                        pageCount,
                        pageIndex,
                        countPerPage,
                        queryParams: { ...queryParams, ...params },
                    })
                    if (clickMore) {
                        const quickReplysNontopClone = cloneDeep(this.state.quickReplysNontop)
                        this.setState({ quickReplysNontop: quickReplysNontopClone.concat(quickReplys) })
                    } else {
                        this.setState({ quickReplysNontop: quickReplys })
                    }
                }
            } else {
                Modal.error({
                    title: response.rsdesp,
                })
            }
        })
    }
    // 获取快捷回复的回复内容列表(置顶)
    getQuickReplysTop(params = {}) {
        this.getQuickReplysRequested({ pageSize: 200, pageNo: 1 }, 1)
    }
    // 获取快捷回复的回复内容列表（非置顶）
    getQuickReplysNontop(params = {}, clickMore = false) {
        this.getQuickReplysRequested(params, 0, clickMore)
    }
    // 获取左侧标签
    getQuickReplyLabels() {
        service.getQuickReplyLabels({
            teacherAccount: common.getUserInfo().userAccount,
        }, response => {
            if (response.rs) {
                const quickReplyLabels = response.resultMessage
                const quickReplyLabelsClone = cloneDeep(quickReplyLabels)
                quickReplyLabelsClone.map(item => {
                    item.rename = false
                })
                this.setState({ quickReplyLabels: quickReplyLabelsClone })
            } else {
                Modal.error({
                    title: response.rsdesp,
                })
            }
        })
    }
    // 删除快捷回复信息
    delQuickReply({ id, rank, top }) {
        service.deleteCommonPhrase({
            rank,
            id,
            teacherAccount: common.getUserInfo().userAccount,
            top,
        }, response => {
            if (response.rs) {
                Modal.success({
                    title: '删除成功！',
                })
                if (top === 0) {
                    // 删除成功之后再重新请求第一页的内容
                    this.getQuickReplysNontop({ pageNo: 1 })
                } else if (top === 1) {
                    this.getQuickReplysTop()
                }
                // 删除后重新请求智能搜索所有话术
                getJSON(url.ADMIN_GETALLQUICKREPLYS, {
                    userAccount: common.getUserInfo().userAccount,
                    channelCode: 'CS_BACKGROUND',
                }).then(response => {
                    // 更新global里面的数据
                    global.allQuicklyReplys = response.resultList
                })
                // this.getQuickReplys()
            } else {
                Modal.error({
                    title: response.rsdesp,
                })
            }
        })
    }
    // 发送快捷回复信息
    sendQuickReplyMsg(data) {
        const { type, quickReplyContent } = data
        const rs = this.sendMessage({
            messageType: type,
            uniqueKey: this.generateKey(),
            chatContent: quickReplyContent,
            ...this.getDefaultParams(),
        }, true)
        if (rs) {
            this.closeChoseModal()
        }
    }
    // 关闭选择的弹窗
    closeChoseModal() {
        this.setState({ showChoseModal: false })
        // this.model.set({
        //     showChoseModal: false,
        // })
    }
    // 切换编辑的弹窗
    toggleEditModal(data) {
        const { showEditModal } = this.state
        const { type = 'add', item = {} } = data || {}
        this.setState({
            showEditModal: !showEditModal,
            editModalTitle: type === 'add' ? '设置快捷回复话术' : '编辑快捷回复用语',
            editModalContent: { ...item },
        }, () => {
            this.getQuickReplysTop({ pageNo: 1 })
            this.getQuickReplysNontop({ pageNo: 1 })
        })

        // this.model.set({
        //     showEditModal: !showEditModal,
        //     editModalTitle: type === 'add' ? '设置快捷回复话术' : '编辑快捷回复用语',
        //     editModalContent: { ...item },
        // })
    }
    // 加载编辑的弹窗
    showEditModal = obj => _ => {
        const { type = 'add', item = {} } = obj || {}
        // const { dispatch } = this.props
        // dispatch('toggleEditModal', { type, item })
        this.toggleEditModal({ type, item })
    }
    // 标签点击时间
    handleTagClick = tagId => _ => {
        const { queryParams: { labelId } } = this.state
        const queryParamsClone = this.getQueryParamsClone()
        queryParamsClone.labelId = labelId === tagId ? -1 : tagId
        queryParamsClone.pageNo = 1
        this.setState({
            queryParams: queryParamsClone,
        }, () => {
            // this.getQuickReplys(queryParamsClone)
            this.getQuickReplysTop(queryParamsClone)
            this.getQuickReplysNontop(queryParamsClone)
        })
    }

    //
    handleListBtnSend = obj => {
        this.setState({ isShowImg: false })
        const { type, quickReplyContent, id } = obj
        // const { dispatch } = this.props
        // dispatch('sendQuickReplyMsg', { type: type === 1 ? 1 : 3, quickReplyContent })
        this.sendQuickReplyMsg({ type: type === 1 ? 1 : 3, quickReplyContent })
        service.countQuickReply({
            teacherAccount: common.getUserInfo().userAccount,
            channelCode: 'CS_BACKGROUND',
            id,
        }, response => {
            // this.getQuickReplysTop()
            // this.getQuickReplysNontop({ pageNo: 1 })
        })
    }
    // 发送按钮事件
    handleBtnSend = obj => _ => {
        this.setState({ isShowImg: false })
        const { type, quickReplyContent, id } = obj
        // const { dispatch } = this.props
        // dispatch('sendQuickReplyMsg', { type: type === 1 ? 1 : 3, quickReplyContent })
        this.sendQuickReplyMsg({ type: type === 1 ? 1 : 3, quickReplyContent })
        service.countQuickReply({
            teacherAccount: common.getUserInfo().userAccount,
            channelCode: 'CS_BACKGROUND',
            id,
        }, response => {
            // this.getQuickReplysTop()
            // this.getQuickReplysNontop({ pageNo: 1 })
        })
    }

    // 删除按钮事件
    handleBtnDel = obj => _ => {
        this.setState({ isShowImg: false })
        const { id, rank, top } = obj
        // const { dispatch } = this.props
        // dispatch('delQuickReply', { id, rank })
        this.delQuickReply({ id, rank, top })
    }
    // 搜索事件
    search = value => {
        // const { dispatch } = this.props
        const queryParamsClone = this.getQueryParamsClone()
        queryParamsClone.searchContent = value
        queryParamsClone.pageNo = 1
        this.setState({
            queryParams: queryParamsClone,
        }, _ => {
            // dispatch('getQuickReplys', queryParamsClone)
            // this.getQuickReplys(queryParamsClone)
            this.getQuickReplysTop(queryParamsClone)
            this.getQuickReplysNontop(queryParamsClone)
            // 显示关闭按钮
            if (value !== '') {
                this.setState({ isShowClearSearch: true })
            }
        })
    }
    saveUpdate() {
        const { editModalContent, editModalContent: { id, quickReplyContent, labelId, type } } = this.state
        if (!quickReplyContent) {
            Modal.error({ title: '请填写快捷回复用语！' })
            return
        } else if (type !== 2 && quickReplyContent.length > 200) {
            Modal.error({ title: '快捷回复用语最多不超过200个字！' })
            return
        } else if (!labelId) {
            Modal.error({ title: '请选择话术标签！' })
            return
        }
        editModalContent.quickReplyContent = encodeURIComponent(quickReplyContent)
        if (id) {
            service.editCommonPhrase({
                teacherAccount: common.getUserInfo().userAccount,
                ...editModalContent,
            }, response => {
                if (response.rs) {
                    Modal.success({ title: '修改成功！' })
                    this.toggleEditModal()
                    // this.getQuickReplys()

                    this.getQuickReplysTop()
                    this.getQuickReplysNontop({ pageNo: 1 })
                    // 修改后重新请求智能搜索所有话术
                    getJSON(url.ADMIN_GETALLQUICKREPLYS, {
                        userAccount: common.getUserInfo().userAccount,
                        channelCode: 'CS_BACKGROUND',
                    }).then(response => {
                        // 更新global里面的数据
                        global.allQuicklyReplys = response.resultList
                    })
                } else {
                    Modal.error({ title: response.rsdesp })
                }
            })
        } else {
            service.addCommonPhrase({
                teacherAccount: common.getUserInfo().userAccount,
                ...editModalContent,
            }, response => {
                if (response.rs) {
                    Modal.success({ title: '添加成功！' })
                    this.toggleEditModal()
                    // this.getQuickReplys()

                    this.getQuickReplysTop()
                    this.getQuickReplysNontop({ pageNo: 1 })
                    // 添加后重新请求智能搜索所有话术
                    getJSON(url.ADMIN_GETALLQUICKREPLYS, {
                        userAccount: common.getUserInfo().userAccount,
                        channelCode: 'CS_BACKGROUND',
                    }).then(response => {
                        // 更新global里面的数据
                        global.allQuicklyReplys = response.resultList
                    })
                } else {
                    Modal.error({ title: response.rsdesp })
                }
            })
        }
    }
    updateEditModalContent(data) {
        this.setState({
            editModalContent: data,
        })
        // this.model.set({
        //     editModalContent: data,
        // })
    }
    saveInputRef = input => { this.input = input }
    handleInputChange = (item, index, e) => {
        const { quickReplyLabels } = this.state
        const beforeName = quickReplyLabels[index].labelName
        const quickReplyLabelsClone = this.getLabelsClone()
        quickReplyLabelsClone.forEach((cloneItem, cloneIndex) => {
            if (cloneIndex === index) {
                cloneItem.labelName = e.target.value
                cloneItem.rename = false
            }
        })
        if (beforeName === '') {
            // 是添加
            service.addQuickReplyLabel({
                teacherAccount: common.getUserInfo().userAccount,
                channelCode: 'CS_BACKGROUND',
                labelName: quickReplyLabelsClone[index].labelName,
            }, response => {
                const { rs, rsdesp } = response
                if (rs === 0) {
                    Modal.success({ title: rsdesp })
                    const quickReplyLabelsFail = cloneDeep(quickReplyLabels)
                    quickReplyLabelsFail.splice(index, 1)
                    this.setState({ quickReplyLabels: quickReplyLabelsFail })
                } else if (rs === 1) {
                    this.setState({ quickReplyLabels: quickReplyLabelsClone })
                    Modal.success({ title: '添加成功！' })
                    // 成功之后应该重新请求左侧标签
                    this.getQuickReplyLabels()
                    // 并且重新请求话术库 @gushouchuang 没必要请求。
                    // this.getQuickReplysTop()
                    // this.getQuickReplysNontop()
                }
            })
        } else {
            // 是重命名
            service.updateQuickReplyLabel({
                teacherAccount: common.getUserInfo().userAccount,
                channelCode: 'CS_BACKGROUND',
                labelName: quickReplyLabelsClone[index].labelName,
                labelId: item.id,
            }, response => {
                const { rs, rsdesp } = response
                if (rs === 0) {
                    Modal.success({ title: rsdesp })
                    const quickReplyLabelsFail = cloneDeep(quickReplyLabels)
                    quickReplyLabelsFail[index].rename = false
                    this.setState({ quickReplyLabels: quickReplyLabelsFail })
                } else if (rs === 1) {
                    this.setState({ quickReplyLabels: quickReplyLabelsClone })
                    Modal.success({ title: '重命名成功！' })
                    // 成功之后应该重新请求左侧标签
                    this.getQuickReplyLabels()
                    // 并且重新请求话术库
                    this.getQuickReplysTop()
                    this.getQuickReplysNontop()
                }
            })
        }
    }
    addLabelHanlder = _ => {
        const quickReplyLabelsClone = this.getLabelsClone()
        quickReplyLabelsClone.push({ rename: true, labelName: '', index: quickReplyLabelsClone.length })
        this.setState({ quickReplyLabels: quickReplyLabelsClone })
    }
    renameHandler = (item, index) => {
        const quickReplyLabelsClone = this.getLabelsClone()
        quickReplyLabelsClone.forEach((cloneItem, cloneIndex) => {
            if (cloneIndex === index) {
                cloneItem.rename = true
            } else {
                cloneItem.rename = false
            }
        })
        this.setState({ quickReplyLabels: quickReplyLabelsClone })
    }
    // 点击取消
    deleteHandlerCancel = _ => {
        this.setState({
            visible: false,
        })
    }
    // 点击确认
    deleteHandlerConfirm = index => {
        this.setState({
            visible: false,
        }, () => {
            this.deleteHandler(index)
        })
    }
    // 显示删除标签的弹窗
    showDelLabelPop = (item, index) => {
        this.setState({
            index,
        }, () => {
            this.setState({ visible: true })
        })
    }
    // 删除左侧标签
    deleteHandler = index => {
        const quickReplyLabelsClone = this.getLabelsClone()
        quickReplyLabelsClone.forEach((cloneItem, cloneIndex) => {
            if (cloneIndex === index) {
                service.delQuickReplyLabel({
                    teacherAccount: common.getUserInfo().userAccount,
                    channelCode: 'CS_BACKGROUND',
                    labelId: cloneItem.id,
                }, response => {
                    // 提示删除成功
                    Modal.success({ title: '删除成功！' })
                    quickReplyLabelsClone.splice(index, 1)
                    this.setState({ quickReplyLabels: quickReplyLabelsClone }, () => {
                        // 删除成功之后重新请求左侧标签
                        this.getQuickReplyLabels()
                        // 并且重新请求话术库
                        this.getQuickReplysTop()
                        this.getQuickReplysNontop()
                    })
                })
            }
        })
    }
    // 发送置顶或取消置顶请求
    sendTopQuickReply = (id, top, quickReplysTopClone, quickReplysNontopClone) => {
        service.topQuickReply({
            teacherAccount: common.getUserInfo().userAccount,
            channelCode: 'CS_BACKGROUND',
            id,
            top,
        }, response => {
            // 置顶成功提示
            if (top === 0) {
                Modal.success({ title: '取消置顶成功！' })
            } else if (top === 1) {
                Modal.success({ title: '置顶成功！' })
            }
            this.setState({
                quickReplysTop: quickReplysTopClone,
                quickReplysNontop: quickReplysNontopClone,
            }, () => {
                // 重新请求右侧的内容
                this.getQuickReplysTop()
                // 重新请求第一页的内容
                this.getQuickReplysNontop({ pageNo: 1 })
            })
        })
    }
    // 取消置顶
    handleCancelTop = item => {
        this.setState({ isShowImg: false })
        const { quickReplysTop, quickReplysNontop } = this.state
        const quickReplysTopClone = cloneDeep(quickReplysTop)
        const quickReplysNontopClone = cloneDeep(quickReplysNontop)
        item.top = 0
        quickReplysNontopClone.push(item)
        this.sendTopQuickReply(item.id, item.top, quickReplysTopClone, quickReplysNontopClone)
    }
    // 置顶
    handleSetTop = item => {
        this.setState({ isShowImg: false })
        const { quickReplysTop, quickReplysNontop } = this.state
        const quickReplysTopClone = cloneDeep(quickReplysTop)
        const quickReplysNontopClone = cloneDeep(quickReplysNontop)
        item.top = 1
        quickReplysTopClone.push(item)
        this.sendTopQuickReply(item.id, item.top, quickReplysTopClone, quickReplysNontopClone)
    }
    // 点击加载更多
    loadMoreHandler = _ => {
        const { queryParams } = this.state
        const queryParamsClone = this.getQueryParamsClone(queryParams)
        queryParamsClone.pageNo = queryParamsClone.pageNo + 1
        this.setState({ queryParams: queryParamsClone }, () => {
            const { queryParams } = this.state
            this.getQuickReplysNontop({}, true)
        })
    }
    // 处理光标位置的函数
    handleFocus = (item, index, e) => {
        const obj = e.target
        obj.selectionStart = item.labelName.length
        obj.selectionEnd = item.labelName.length
    }
    renderContentLeft = () => {
        const { quickReplyLabels, queryParams: { labelId } } = this.state
        return (
            <div className="content-left" style={{
                height: `${document.getElementById('detailInfoContainer').offsetHeight - 110}px`,
            }}>
                {
                    quickReplyLabels && quickReplyLabels.length ? quickReplyLabels.map(this.renderLeftLabel) : null
                }
                {/* { quickReplyLabels.length < 15 ?
                    <div onClick={this.addLabelHanlder} className="add-label-btn"><span>+</span>添加标签</div>
                    :
                    <div className="add-label-btn add-label-btn-gray"><span>+</span>添加标签</div>
                } */}
            </div>
        )
    }
    renderLeftLabel = (item, index) => {
        const { id, labelName, rename } = item
        const { quickReplyLabels, queryParams: { labelId }, visible } = this.state
        const content = (
            <div className="popBtnWrapper">
                <Button onClick={() => { this.renameHandler(item, index) }}>重命名</Button>
                <Button onClick={() => { this.showDelLabelPop(item, index) }}>删除</Button>
            </div>
        )
        const inputStyle = {
            height: '36px',
            fontSize: '12px',
            background: '#FFF7F0',
            border: '1px solid #F46F02',
            color: '#666666',
            padding: '0 15px',
        }
        // const colorStyle = labelId === id ? 'primary' : 'default'
        const tagStyle = labelId === id ? 'tagDefault tagActive' : 'tagDefault'
        return (
            <div>
                <div className={tagStyle} onClick={this.handleTagClick(id)} key={`tag_${index}`} >{labelName}</div>
                    {/* {rename ? <Input autoFocus={true} type="text" size="small" defaultValue={labelName} onFocus={e => this.handleFocus(item, index, e)} style={inputStyle} onPressEnter={e => {this.handleInputChange(item, index, e)}} onBlur={e => this.handleInputChange(item, index, e)} />
                            : <Popover content={content} trigger="hover" onClick={this.handleTagClick(id)} key={`tag_${index}`} placement="right"><Button type={colorStyle}>{labelName}</Button></Popover>} */}
            </div>
        )
    }
    renderContentRight = () => (
        <div className="content-right">
            <div className="right-wrapper" style={{
                height: `${document.getElementById('detailInfoContainer').offsetHeight - 110}px`,
            }}>
                {this.renderTalkText()}
                {this.renderTalkTextNontop()}
            </div>
        </div>
    )

    renderTalkText = () => {
        const { quickReplysTop } = this.state
        return (
            <ul className="quick-reply">
                {
                    quickReplysTop && quickReplysTop.length ? quickReplysTop.map((item, index) => {
                        const { type, quickReplyContent, modifyTime, top } = item
                        const content = (
                            <div className="reply-content-wrapper-new">
                                <Button type="primary" onClick={_ => this.handleListBtnSend(item)}>发送</Button>
                                {/* <Button type="primary" onClick={() => { this.handleCancelTop(item) }}>取消置顶</Button>
                                <Button type="primary" onClick={this.showEditModal({ item, type: 'edit' })}>编辑</Button>
                                <Button type="primary" onClick={this.handleBtnDel(item)}>删除</Button> */}
                            </div>
                        )
                        return (
                            <li className={top === 1 ? 'reply-li-top' : 'reply-li-nontop'}>
                                <div className="reply-operate">
                                    <PopOver isShowImg={this.state.isShowImg} replyItem={item} handleBtnSend={() => this.handleListBtnSend(item)} appendTextHandler={this.props.appendTextHandler} />
                                    {/* <Popover content={content} title="" trigger="contextMenu" placement="bottomRight">
                                        { type === 2 ?
                                            <div>
                                                <ImgRender isShowImg={this.state.isShowImg} replyItem={item} handleBtnSend={() => this.handleListBtnSend(item)} src={quickReplyContent} height="auto" width="485" title="图片预览" />
                                                <ImgRender isShowImg={this.state.isShowImg} replyItem={item} handleBtnSend={() => this.handleListBtnSend(item)} src={quickReplyContent} height="auto" width="485" title="图片预览" />
                                            </div>
                                            : <div onClick={() => { this.props.appendTextHandler(quickReplyContent) }}>
                                                <ShowAll content={quickReplyContent} lines={4} ellipsis={<span>...<span className="color-blue">展开</span></span>} retract={<span className="color-blue">收起</span>} />
                                            </div>
                                        }
                                    </Popover> */}
                                </div>
                                {/* <span className="date-tip">{moment(modifyTime).format('YYYY-MM-DD')}</span> */}
                            </li>
                        )
                    }) : null
                }
            </ul>
        )
    }
    renderTalkTextNontop = () => {
        const { quickReplysNontop, pageIndex, pageCount } = this.state
        return (
            <ul className="quick-reply">
                {
                    quickReplysNontop && quickReplysNontop.length ? quickReplysNontop.map((item, index) => {
                        const { type, quickReplyContent, modifyTime, top } = item
                        const content = (
                            <div className="reply-content-wrapper-new">
                                <Button type="primary" onClick={_=>this.handleListBtnSend(item)}>发送</Button>
                                {/* <Button type="primary" onClick={() => { this.handleSetTop(item) }}>置顶</Button>
                                <Button type="primary" onClick={this.showEditModal({ item, type: 'edit' })}>编辑</Button>
                                <Button type="primary" onClick={this.handleBtnDel(item)}>删除</Button> */}
                            </div>
                        )
                        return (
                            <li className={top === 1 ? 'reply-li-top' : 'reply-li-nontop'}>
                                <div className="reply-operate">
                                    <PopOver isShowImg={this.state.isShowImg} replyItem={item} handleBtnSend={() => this.handleListBtnSend(item)} appendTextHandler={this.props.appendTextHandler} />

                                    {/* <Popover content={content} title="" trigger="contextMenu" placement="bottomRight">
                                        { type === 2 ?
                                            <div>
                                                <ImgRender isShowImg={this.state.isShowImg} replyItem={item} handleBtnSend={_=>this.handleListBtnSend(item)} src={quickReplyContent} height="auto" width="485" title="图片预览" />
                                            </div>
                                            : <div onClick={() => { this.props.appendTextHandler(quickReplyContent) }}>
                                                <ShowAll content={quickReplyContent} lines={4} ellipsis={<span>...<span className="color-blue">展开</span></span>} retract={<span className="color-blue">收起</span>} />
                                            </div>
                                        }
                                    </Popover> */}
                                </div>
                                {/* <span className="date-tip">{moment(modifyTime).format('YYYY-MM-DD')}</span> */}
                            </li>
                        )
                    }) 
                    : this.state.quickReplysTop && this.state.quickReplysTop.length
                        ? null
                        : <div className="no-query-result">暂无查询结果</div>
                }
                {(quickReplysNontop && (quickReplysNontop.length !== 0) && (pageIndex !== pageCount)) && <div onClick={this.loadMoreHandler} className="load-more">点击加载下一页</div>}
            </ul>
        )
    }
    renderContent = () => (
        <div className="content-wrapper">
            {this.renderContentLeft()}
            {this.renderContentRight()}
        </div>
    )
    // 清除搜索内容
    clearSearchContent = () => {
        const { queryParams } = this.state
        const queryParamsClone = this.getQueryParamsClone(queryParams)
        queryParamsClone.searchContent = ''
        this.setState({ queryParams: queryParamsClone }, _ => {
            this.search('')
        })
        this.setState({ isShowClearSearch: false })
    }
    saveSearchContent = e => {
        const { queryParams } = this.state
        const queryParamsClone = this.getQueryParamsClone(queryParams)
        queryParamsClone.searchContent = e.target.value
        if (e.target.value === '') {
            this.setState({ isShowClearSearch: false })
        }
        this.setState({ queryParams: queryParamsClone })
    }
    // 加载搜索框
    renderSearch = () => {
        const { isShowClearSearch } = this.state
        const suffixContent = isShowClearSearch ? <Icon type="close-circle" theme="outlined" onClick={this.clearSearchContent} /> : null
        const { queryParams: { searchContent } } = this.state
        return (
            <div className="search-wrapper">
                <Search
                    placeholder="请输入想要搜索的回复内容"
                    style={{
                        width: 350, height: 34, margin: '16px, 20px',
                    }}
                    onSearch={this.search}
                    suffix={suffixContent}
                    value={searchContent}
                    onChange={this.saveSearchContent}
                />
            </div>
        )
    }
    render() {
        const childProps = {
            ...this.state,
            dispatch: (name, ...rest) => {
                if (this[name] && typeof this[name] === 'function') {
                    return this[name](...rest)
                }
                console.warn(`can not find method: ${name}`)
                return undefined
            },
            successCallback: _ => {
                // this.getQuickReplysTop()
                // this.getQuickReplysNontop({ pageNo: 1 })
            },
        }
        const delMaskStyle = {
            backgroundColor: 'rgba(55, 55, 55, 0.3)',
        }
        return (
            <div className="telephone-wrapper">
                {this.renderSearch()}
                {this.renderContent()}
                {/* <div onClick={this.showEditModal()} className="addTalkBtn">+添加话术</div> */}
                <EditModal {...childProps} />
                <Modal
                    title=""
                    visible={this.state.visible}
                    onOk={() => { this.deleteHandlerConfirm(this.state.index) }}
                    onCancel={this.deleteHandlerCancel}
                    maskStyle={delMaskStyle}
                >
                    <p className="deletePopText">删除该标签将同时删除标签下的所有话术，请确保该标签下没有有用的话术信息，确认删除吗？</p>
                </Modal>
            </div>
        )
    }
}
export default TelePhone

