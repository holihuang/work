
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Tag, Input, Pagination } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'

import ImgRender from 'common/reactComponent/tableRender/ImgRender'

const ButtonGroup = Button.Group
const { Search } = Input
class ChoseModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            queryParams: {
                searchContent: '',
                labelId: -1,
                pageNo: 1,
                pageSize: 10,
            },
        }
    }

    getQueryParamsClone = _ => {
        const { queryParams } = this.state
        return cloneDeep(queryParams)
    }

    handleOk = _ => {
        const { dispatch } = this.props
        dispatch('closeChoseModal')
    }

    handleTagClick = tagId => _ => {
        const { dispatch } = this.props
        const { queryParams: { labelId } } = this.state
        const queryParamsClone = this.getQueryParamsClone()
        queryParamsClone.labelId = labelId === tagId ? -1 : tagId
        queryParamsClone.pageNo = 1
        this.setState({
            queryParams: queryParamsClone,
        }, () => {
            dispatch('getQuickReplys', queryParamsClone)
        })
    }

    search = value => {
        const { dispatch } = this.props
        const queryParamsClone = this.getQueryParamsClone()
        queryParamsClone.searchContent = value
        queryParamsClone.pageNo = 1
        this.setState({
            queryParams: queryParamsClone,
        }, _ => {
            dispatch('getQuickReplys', queryParamsClone)
        })
    }

    handlePageChange = page => {
        const { dispatch } = this.props
        const queryParamsClone = this.getQueryParamsClone()
        queryParamsClone.pageNo = page
        this.setState({
            queryParams: queryParamsClone,
        }, _ => {
            dispatch('getQuickReplys', queryParamsClone)
        })
    }
    // 发送按钮事件
    handleBtnSend = obj => _ => {
        const { type, quickReplyContent } = obj
        const { dispatch } = this.props
        dispatch('sendQuickReplyMsg', { type: type === 1 ? 1 : 3, quickReplyContent })
    }

    // 删除按钮事件
    handleBtnDel = obj => _ => {
        const { id, rank } = obj
        const { dispatch } = this.props
        dispatch('delQuickReply', { id, rank })
    }

    showEditModal = obj => _ => {
        const { type = 'add', item = {} } = obj || {}
        const { dispatch } = this.props
        dispatch('toggleEditModal', { type, item })
    }

    render() {
        const {
            showChoseModal, quickReplys, quickReplyLabels, totalCount, pageCount, pageIndex, countPerPage,
        } = this.props
        const { queryParams: { labelId } } = this.state
        const paginationProps = {
            current: pageIndex,
            total: totalCount,
            pageSize: countPerPage,
            onChange: this.handlePageChange,
        }
        return (
            <Modal
                title="选择快捷回复（默认展示全量内容）"
                visible={showChoseModal}
                onOk={this.handleOk}
                onCancel={this.handleOk}
                cancelText=""
                width={800}
                maskClosable={false}
                footer={[
                    <Button key="submit" type="primary" size="large" onClick={this.showEditModal()}>
                        设置快捷回复
                    </Button>,
                ]}
            >
                <Search
                    placeholder="请输入想要搜索的回复内容"
                    style={{
                        width: 200, position: 'absolute', top: '10px', right: '65px',
                    }}
                    onSearch={this.search}
                />

                {
                    quickReplyLabels && quickReplyLabels.length ? quickReplyLabels.map(item => <Tag color={labelId === item.id ? '#2db7f5' : '#ccc'} onClick={this.handleTagClick(item.id)}>{item.labelName}</Tag>)
                        : null
                }
                <ul className="quick-reply">
                    {
                        quickReplys && quickReplys.length ? quickReplys.map(item => {
                            const { type, quickReplyContent, modifyTime } = item
                            return (
                                <li>
                                    <div className="reply-operate">
                                        <ButtonGroup>
                                            <Button type="primary" onClick={this.handleBtnSend(item)}>发送</Button>
                                            <Button type="primary" onClick={this.showEditModal({ item, type: 'edit' })}>编辑</Button>
                                            <Button type="primary" onClick={this.handleBtnDel(item)}>删除</Button>
                                        </ButtonGroup>
                                    </div><span className="date-tip">{moment(modifyTime).format('YYYY-MM-DD')}</span>
                                    {
                                        type === 2 ?
                                            <ImgRender src={quickReplyContent} height="auto" width="485" title="图片预览" />
                                            :
                                            <p className="reply-content">{quickReplyContent}</p>
                                            
                                    }
                                </li>
                            )
                        }) : <div className="no-query-result">暂无查询结果</div>
                    }
                </ul>
                {
                    pageCount > 1 ? <Pagination {...paginationProps} /> : null
                }
            </Modal>
        )
    }
}

ChoseModal.defaultProps = {
    showChoseModal: false,
    quickReplys: [],
    quickReplyLabels: [],
    totalCount: 0,
    pageCount: 0,
    pageIndex: 1,
    countPerPage: 10,
}

ChoseModal.propTypes = {
    showChoseModal: PropTypes.bool,
    quickReplys: PropTypes.array,
    quickReplyLabels: PropTypes.array,
    totalCount: PropTypes.number,
    pageCount: PropTypes.number,
    pageIndex: PropTypes.number,
    countPerPage: PropTypes.number,
}

export default ChoseModal
