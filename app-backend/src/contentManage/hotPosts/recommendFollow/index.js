/*
 * @Author: zhangpengyu 
 * @Date: 2017-12-25 14:28:35 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-01-12 18:46:56
 */
import moment from "moment"

import { envCfg } from "../../../common/envCfg"
import { common } from "../../../common/common"
import { service } from "../../../common/service"
import { Table } from "../../../components/table/index"
import { Pager } from "../../../components/pager/index"
import { Dialog } from "../../../components/dialog/index"
import { DialogContent } from "./dialogContent/index"
import tpl from "./tpl.html"

const TAB_TEXT = {
    "0": {
        addDialogTitle: "新增VIP学员推荐",
        updateDialogTitle: "更新VIP学员推荐",
        delConfirmText:
            "该对象正在推荐中，确定要下线吗？下线后该对象将不在原有的推荐位置。"
    },
    "1": {
        addDialogTitle: "新增非付费学员推荐",
        updateDialogTitle: "更新非付费学员推荐",
        delConfirmText:
            "确定在推荐关注中删除该对象吗？删除后，未付费学员将不能在推荐关注中看到该对象。"
    }
}

const Model = Backbone.Model.extend({
    defaults: {
        activeTab: 0,
        searchParams: {
            userIdentity: 0, //0全部，1学员，2老师"
            status: "0" //0全部，type为1时1展示中，2展示结束；type为2时1是展示中，2未推荐",
        },
        resultList: null,
        pageNo: -1,
        pageSize: 25
    }
})

const RecommendFollow = Backbone.View.extend({
    initialize(options) {
        this.tableColumns = [
            {
                field: "推荐对象ID",
                content: item => {
                    const { userId } = item
                    return `<a href="${
                        envCfg.userHomeBaseUrl
                    }${userId}" target="_blank">${userId}</a>`
                },
                escapeHtml: false
            },
            {
                field: "对象昵称",
                content: "nickname"
            },
            {
                field: "对象身份",
                content: item => {
                    const { userIdentity } = item
                    switch (userIdentity) {
                        case 1:
                            return "学员"
                        case 2:
                            return "老师"
                    }
                }
            },
            {
                field: "推荐位置",
                content: "position"
            },
            {
                field: "创建人",
                content: "creater"
            },
            {
                field: "创建时间",
                content: "createTime"
                // content: (item) => {
                //     return item.createTime.split(' ')[0].replace(/-/ig, '.')
                // }
            },
            {
                field: "最近一次操作人",
                content: "operator"
            },
            {
                field: "最近一次操作时间",
                content: "operateTime"
            },
            {
                field: "展示状态",
                content: item => {
                    const { status } = item
                    const { activeTab } = this.model.toJSON()
                    //vip推荐1展示中，2展示结束；非付费用户推荐1展示中，2是未推荐",
                    switch (status) {
                        case 1:
                            return "展示中"
                        case 2:
                            return activeTab === 0 ? "展示结束" : "未推荐"
                    }
                }
            },
            {
                field: "操作",
                content: (item, index) => {
                    const { status } = item
                    const { activeTab } = this.model.toJSON()
                    if (activeTab === 0) {
                        return status === 1
                            ? `
                            <span class="orange cursor-pointer recommend-update" index="${index}">更新</span>
                            <span class="orange" >|</span>
                            <span class="orange cursor-pointer recommend-del" index="${index}">下线</span>
                        `
                            : '<span class="orange" >——</span>'
                    } else if (activeTab === 1) {
                        return `
                            <span class="orange cursor-pointer recommend-update" index="${index}">更新</span>
                            <span class="orange" >|</span>
                            <span class="orange cursor-pointer recommend-del" index="${index}">删除对象</span>
                        `
                    }
                },
                escapeHtml: false
            }
        ]
        this.model = new Model()
        //this.listenTo(this.model, 'change:resultList', this.renderTable)
        this.listenTo(this.model, "change:pageNo", this.renderPager)
        this.listenTo(this.model, "change:pageCount", this.renderPager)
        this.listenTo(this.model, "change:activeTab", this.render)
        this.render()
    },

    events: {
        "click #queryBtn": "search",
        "click .tab-switch": "switchTab",
        "click #addFollowRecommend": "addDialog",
        "click .recommend-update": "updateDialog",
        "click .recommend-del": "delItem"
    },

    switchTab(e) {
        this.model.set({
            activeTab: +$(e.target).index()
        })
    },

    addDialog() {
        const { activeTab } = this.model.toJSON()
        const noPayTab = activeTab === 1
        const data = {
            noPayTab
        }
        this.dialogContent && this.dialogContent.undelegateEvents()
        this.dialogContent = new DialogContent({
            ...data
        })
        const type = this.getPageType()
        const that = this
        new Dialog({
            title: TAB_TEXT[activeTab].addDialogTitle,
            content: this.dialogContent.$el,
            type: 4,
            ok: function() {
                const params = common.getFormData({
                    formId: "recommendAddDialogForm"
                })
                const { userId, hasRecommend, position } = params
                if (noPayTab) {
                    //hasRecommend 类型:Number 说明:type为2时，必填。0代表不推荐，1代表设置推荐"
                    if (!hasRecommend) {
                        params.position = 0
                        params.hasRecommend = 0
                    } else {
                        params.hasRecommend = 1
                    }
                }
                if (userId.trim() === "") {
                    alert("请输入推荐对象的userid！")
                    return
                }
                if(parseInt(userId) > 2147483647) {
                    alert("userid输入过长！")
                    return
                }
                if((noPayTab && hasRecommend && !position) || (!noPayTab && !position)) {
                    alert("请选择推荐位置！")
                    return
                }
                service.addRecommend(
                    {
                        ...params,
                        type,
                        channelCode: "CS_BACKGROUND" //渠道码，CS_BACKGROUND:运营后台"
                    },
                    response => {
                        if (response.rs) {
                            alert("新增成功！")
                            this.closeDialog()
                            that.getPageData()
                        } else {
                            alert(response.rsdesp)
                        }
                    }
                )
            }
        })
    },

    updateDialog(e) {
        const { activeTab } = this.model.toJSON()
        const noPayTab = activeTab === 1
        const data = {
            noPayTab,
            update: true
        }
        const index = +$(e.currentTarget).attr("index")
        const { resultList } = this.model.toJSON()
        const itemInfo = resultList[index]
        const type = this.getPageType()
        const userInfo = common.getUserInfo()

        this.dialogContent && this.dialogContent.undelegateEvents()
        this.dialogContent = new DialogContent({
            ...data,
            ...itemInfo
        })
        const that = this
        const dialog = new Dialog({
            title: TAB_TEXT[activeTab].updateDialogTitle,
            content: this.dialogContent.$el,
            type: 4,
            ok: function() {
                const params = common.getFormData({
                    formId: "recommendAddDialogForm"
                })
                const { userId, hasRecommend, position } = params
                const { id } = itemInfo
                if (noPayTab) {
                    //hasRecommend 类型:Number 说明:type为2时，必填。0代表不推荐，1代表设置推荐"
                    if (!hasRecommend) {
                        params.position = 0
                        params.hasRecommend = 0
                    } else {
                        params.hasRecommend = 1
                    }
                }
                if((noPayTab && hasRecommend && !position) || (!noPayTab && !position)) {
                    alert("请选择推荐位置！")
                    return
                }
                service.modifyRecommend(
                    {
                        ...params,
                        id,
                        type,
                        operator: userInfo.userAccount,
                        channelCode: "CS_BACKGROUND" //渠道码，CS_BACKGROUND:运营后台"
                    },
                    response => {
                        if (response.rs) {
                            alert("更新成功！")
                            this.closeDialog()
                            that.getPageData()
                        } else {
                            alert(response.rsdesp)
                        }
                    }
                )
            }
        })
        dialog.$el.find("#position").val(itemInfo.position)
    },

    //查询
    search() {
        const params = common.getFormData({
            formId: "searchForm"
        })

        const { searchParams } = this.model.toJSON()
        const newSearchParams = { ...searchParams, ...params }
        //searchParams = Object.assign({}, searchParams, params)
        //存储查询条件
        this.model.set({
            searchParams: newSearchParams,
            //重置页码，触发pager的重新render
            pageNo: -1
        })

        const { pageSize } = this.model.toJSON()
        this.getPageData({ pageSize })
    },

    getPageData({ pageNo = 1, pageSize = 25 } = {}) {
        const { searchParams, activeTab } = this.model.toJSON()
        service.listRecommend(
            {
                type: this.getPageType(),
                ...searchParams,
                pageSize,
                pageNo
            },
            response => {
                if (response.rs) {
                    const {
                        countPerPage: pageSize,
                        pageIndex: pageNo,
                        pageCount,
                        totalCount,
                        resultList
                    } = response.resultMessage
                    this.model.set({
                        resultList,
                        pageNo,
                        pageSize,
                        pageCount
                    })
                    this.renderTable()
                } else {
                    alert(response.rsdesp)
                }
            }
        )
    },

    delItem(e) {
        const index = +$(e.currentTarget).attr("index")
        const { resultList, activeTab } = this.model.toJSON()
        const { id } = resultList[index]
        const type = this.getPageType()
        const userInfo = common.getUserInfo()

        if (confirm(TAB_TEXT[activeTab].delConfirmText)) {
            service.dpwnlineRecommend(
                {
                    id,
                    type,
                    operator: userInfo.userAccount,
                    channelCode: "CS_BACKGROUND" //渠道码，CS_BACKGROUND:运营后台"
                },
                response => {
                    if (response.rs) {
                        alert("下线成功！")
                        this.getPageData()
                    } else {
                        alert(response.rsdesp)
                    }
                }
            )
        }
    },

    getPageType() {
        const { activeTab } = this.model.toJSON()
        return activeTab === 0 ? 1 : 2 //1为vip学员推荐，2为非付费用户推荐",
    },

    renderTable() {
        const { resultList } = this.model.toJSON()

        this.table = new Table({
            el: this.$el.find("#tableContainer"),
            columns: this.tableColumns,
            dataList: resultList
        })
    },

    renderPager() {
        const { pageSize, pageNo, pageCount } = this.model.toJSON()
        this.pager && this.pager.undelegateEvents()
        this.pager = new Pager({
            el: this.$el.find("#pagerContainer"),
            pageSize,
            pageNo,
            pageCount,
            onChange: options => {
                const { pageSize, pageNo } = options
                this.getPageData({ pageSize, pageNo })
            }
        })
    },

    format(data) {
        const { type, activeTab } = data
        data.noPayTabActive = activeTab === 1 ? "active" : "" //tab active 状态
        data.vipTabActive = activeTab === 0 ? "active" : ""
        data.isNoPayTab = activeTab === 1
        data.isVipTab = activeTab === 0
        return data
    },

    render() {
        this.search()
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    }
})

export { RecommendFollow }
