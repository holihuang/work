/**
 * @file IM接知识库
 *
 * @auth gushouchuang
 * @date 2018-5-8
 */

import React, { Component } from 'react'
import { Input, Pagination, Modal, Button } from 'antd'
import { global } from 'common/global'
import _ from 'lodash'

import { common } from 'common/common'

import FilePreview from './filePreview/FilePreview'
import service from './service'


// 引入必要的less
// import style from '../../styles/knbase.less'


const { Search } = Input

class Knbase extends Component {
    constructor(...args) {
        super(...args)

        this._isConnecting = false

        this.state = {
            list: [], // 数据源
            resList: [], // 分页显示数据
            pageNo: 1,
            pageSize: 5,
            resultType: 'recently', // 最近查看（recently） 与（searchResult） 搜索结果区分
            isFilePreviewShow: false,
            connectSuccess: global.knbaseInited, // false标识获取token & init失败 / true，标识链接个人中心成功
            // connectSuccess: false,
            prew: {},
        }

        this.search = this.search.bind(this)
        this.getList = this.getList.bind(this)
        this.pageChange = this.pageChange.bind(this)
        this.getPagedatasource = this.getPagedatasource.bind(this)
        this.send = this.send.bind(this)
        this.initKnbase = this.initKnbase.bind(this)
    }

    componentDidMount() {
        this.getList() // 最近浏览过的数据
    }

    // 重连个人中心（Header中初始化失败）
    initKnbase() {
        // 正在连接中
        this._isConnecting = true

        // 3s异常标志位回归 => 链接失败的捕获在此一起做了。
        setTimeout(() => {
            this._isConnecting = false
        }, 3000)

        // token
        service.getToken({
            teacherAccount: common.getUserInfo().userAccount,
        }).then(rst => {
            // 通过token去init
            service.init({
                userToken: rst,
                channel: 'Sv-Community',
            }).then(() => {
                global.knbaseInited = true
                // 触发render
                this.setState({
                    connectSuccess: true,
                })

                this._isConnecting = false
            }, rst => {
                console.warn('re: knbase init fail')
            })
        }, rst => {
            console.warn('re: knbase get token fail')
        })
    }

    // 最近查看
    getList() {
        this.setState({
            resultType: 'recently',
        })
        // 请求service => 修改state.list
        const params = { count: 30 }
        service.getHiskn(params).then(response => {
            this.setState({
                list: response.data,
            })
            this.getPagedatasource(response.data)
        })
    }

    // 页面list
    getPagedatasource(datasource, pageNo) {
        pageNo = pageNo || 1
        const pageRes = (pageNo - 1) * this.state.pageSize
        const res = datasource.slice(pageRes, pageRes + this.state.pageSize)
        this.setState({
            resList: res,
        })
    }

    // PAGE页切换
    pageChange(page, pageSize) {
        this.setState({
            pageNo: page,
        })
        this.getPagedatasource(this.state.list, page)

        const { userId } = common.getUserInfo()
    }


    // 关键词搜素
    search(value = '') {
        const trimValue = value.trim()
        if (!trimValue) {
            Modal.warning({
                title: '请输入关键词后再搜索',
                content: '',
                okText: '确定',
            })
        } else {
            const { userId } = common.getUserInfo()
            // 搜索
            this.setState({
                resultType: 'searchResult',
                pageNo: 1,
            })
            const params = {
                query: trimValue,
                count: 30,
                showPageContent: true,
            }
            service.getKnbase(params).then(response => {
                this.setState({
                    list: response.data,
                })
                this.getPagedatasource(response.data)
            })
        }
    }
    // 预览
    prew(index) {
        const item = this.state.resList[index].page

        this.setState({
            prew: {
                pageTitle: item.pageTitle,
                pageType: item.pageType,
                pageResourceUrl: item.pageResourceUrl,
                pageIndex: item.pageIndex,
                pageSize: item.pageFileSize,
            },
            isFilePreviewShow: true,
        })
    }

    // ws发送知识文件
    send(evt) {
        this.props.dispatch('sendKnbaseMsg', evt)

        this.setState({
            isFilePreviewShow: false,
        })
    }

    creatListFactory() {
        const dom = []
        this.state.resList.forEach((item, index) => {
            const itemProps = {
                // value: item.id,
                index,
                onClick: _ => {
                    this.prew(index)
                },
            }
            dom.push(<div className="knbase_content_detail——knp" {...itemProps}><div>{item.page.pageTitle }</div></div>)
        })
        return dom
    }

    handleCancel = _ => {
        this.setState({
            isFilePreviewShow: false,
        })
    }


    render() {
        const paginationCfg = {
            total: this.state.list.length,
            showTotal: total => `共${total}条结果`,
            pageSize: this.state.pageSize,
            pageSizeOptions: ['5'],
            // showSizeChanger: true,
            current: this.state.pageNo,
            onChange: this.pageChange,
        }

        const reProps = {
            key: '',
            type: 'primary',
            disabled: this._isConnecting,
            onClick: this.initKnbase,
        }
        // 预览
        const filePreviewProps = {
            source: this.state.prew,
            send: this.send,
            handleCancel: this.handleCancel,
        }

        return (
            <div>
                {
                    this.state.connectSuccess ?
                        <div>
                            <div className="edit_search">
                                <Search
                                    placeholder="请输入关键词"
                                    style={{
                                        width: '90%', marginLeft: '5%', marginTop: '0px', height: '40px',
                                    }}
                                    onSearch={this.search}
                                />
                            </div>
                            <div className="knbase_content">
                                <div className="knbase_content_title">
                                    {this.state.resultType === 'recently' ? '最近查看' : '搜索结果'}
                                </div>
                                {
                                    this.state.list.length ?
                                        <div className="knbase_content_detail">
                                            {this.creatListFactory()}
                                        </div>
                                        :
                                        <div className="knbase_content_detail knbase_content_detail—empty">
                                            {this.state.resultType === 'recently' ? '暂无最近查看记录' : '暂无搜索结果'}
                                        </div>
                                }
                                <div className="knbase_content_page">
                                    {
                                        this.state.list.length ?
                                            <Pagination
                                                className="knbase_content_page_pagination"
                                                {...paginationCfg}
                                            />
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                        :
                        <div style={{
                            textAlign: 'center',
                            paddingTop: '60px',
                        }}
                        >
                            知识库连接失败，
                            <Button {...reProps}>请重试</Button>
                        </div>
                }
                {
                    this.state.isFilePreviewShow && <FilePreview {...filePreviewProps} />
                }
            </div>
        )
    }
}

export default Knbase
