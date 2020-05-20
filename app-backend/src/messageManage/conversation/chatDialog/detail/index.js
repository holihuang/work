import {service} from '../../../../common/service';
import {envCfg} from '../../../../common/envCfg';
import tpl from './tpl.html';

import { common } from 'common/common'

import React from 'react'
import ReactDom from 'react-dom'

import Knbase from 'src/imReact/knbase/Knbase'
import TagDialog from 'src/imReact/tag/TagDialog'
import TelePhone from 'src/imReact/telephone/telephone'

var Model = Backbone.Model.extend({
	defaults:{
        requestFailed: false,
        errorMsg: '', //错误信息
        orderDetailId: -1,
        showHeadmaster: false,
	}
});

var DetailInfo = Backbone.View.extend({
    initialize: function(options = {}) {
        const {orderDetailId} = options;
        this.sendKnbaseMsg = options.sendKnbaseMsg
        // 快捷回复中的从index传过来的方法
        this.getDefaultParams = options.getDefaultParams
        this.sendMessage = options.sendMessage
        this.generateKey = options.generateKey
        this.onClick = options.onClick
        this.appendTextHandler = options.appendTextHandler
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        const { userRole } = window.userInfo
        if (userRole.indexOf('SCH_AFTERSALETEACHER') !== -1) {
            this.model.set({showHeadmaster: true})
        }

        this.model.set({orderDetailId});
    	this.getOrderDetailById();
    },


    events: {
        'click #packageName': 'gotoQiYeJia',
        'click #refreshBtn': "getOrderDetailById",
        'click .detail-tab': "togDetailCnt",
        'click #link-to-detail': "linkToDetail",
        'click #tagEdit': 'showTagDialog',
        'click #communicationRecord': 'jumpTo400Call',
    },

    showTagDialog() {
        //打标签dialog
        this.initTagDialogReact()
    },

    jumpTo400Call() {
        const { userAccount } = window.userInfo
        const { orderDetailId } = this.model.toJSON()
        const params = {
            userAccount,
            orderDetailId
        }
        service.getCommunicationRecordUrl(params, (response) => {
            if(response.rs) {
                window.open(`${response.resultMessage}`)
            }
        })
    },

    linkToDetail() {
        if (!this.model.get('complainStatusFieldDesc')) {
            // 不存在驾驶，直接返回，不跳转
            return
        }
        // 跳转到工单的详情页
        let url = this.model.get('complainUrl')
        window.open(url)
    },

    gotoQiYeJia() {
        this.$el.find('#opForm')[0].submit();
    },

    getOrderDetailById() {
        const {orderDetailId} = this.model.toJSON();
        service.getOrderDetailById({
            orderDetailId,
        }, (response) => {
            if (response.rs) {
                this.model.set(response.resultMessage);
                // 添加工单信息的接口
                // service.adminGetOrdDetailNo({
                //     ordDetailNo: this.model.get('ordDetailNo'),
                // },response => {
                //     this.model.set(response.resultMessage);
                // })
            } else {
                this.model.set({
                    requestFailed: true,
                    errorMsg: response.rsdesp
                })
            }
        })
    },
    // 切换详情页显示cnt
    togDetailCnt(e) {
        const evt = $(e.target)
        // 重复选中
        if (evt.hasClass('detail-tab-selected')) {
            return
        }
        const tabValue = evt.attr('value')
        
        if (tabValue === 'telephone') {
            this.initTelePhoneReact()
        } else if (tabValue === 'knbase') {
            const { userId } = common.getUserInfo()
        }

        this.$el.find('.detail-tab').removeClass('detail-tab-selected')
        evt.addClass('detail-tab-selected')

        this.$el.find('.detail-cnt').hide()
        this.$el.find(`#detail-cnt-${tabValue}`).show()
    },

    //选择标签后刷新'学员信息'tab
    refreshStudentInfoTab() {
        this.getOrderDetailById()
    },

    //关闭标签弹窗时，清掉包含弹窗组件根节点的子元素
    emptyRootDiv() {
        // $('#dialogContainer').empty()
        ReactDom.render(null, document.getElementById('dialogContainer'))
    },

    //打标签dialog
    initTagDialogReact() {
        const that = this
        const props = {
            ...this.model.toJSON(),
            isShowTagDialog: true,
            dispatch: (name = '', evt = {}) => {
                if(that[name]) {
                    that[name](evt)
                } else {
                    console.warn(`方法名${name}不存在`)
                }
            }
        }

        ReactDom.render(<TagDialog {...props} />, document.getElementById('dialogContainer'))
    },

    initKnbaseReact() {
        const that = this
        // 页面加载直接渲染knbase react组件
        const props = {
            ...this.model.toJSON(), // 获取model中的所有数据
            dispatch: (name = '', evt = {}) => {
                if (that[name]) {
                    that[name](evt)
                } else {
                    console.warn(`方法name不存在`)
                }
            }
        }

        ReactDom.render(
            <Knbase {...props} />,
            document.getElementById('detail-cnt-knbase'),
        )
    },

    initTelePhoneReact() {

        const that = this
        // 页面加载直接渲染telephone react 组件
        const props = {
            ...this.model.toJSON(), // 获取model中的所有数据
            dispatch: (name = '', evt = {}) => {
                if(that[name]) {
                    that[name](evt)
                }else {
                    console.warn(`方法name不存在`)
                }
            },
            getDefaultParams: this.getDefaultParams,
            sendMessage: this.sendMessage,
            onClick: this.onClick,
            generateKey: this.generateKey,
            appendTextHandler: this.appendTextHandler,
        }
        ReactDom.render(
            <TelePhone {...props} />,
            document.getElementById('detail-cnt-telephone'),
        )
    },

    format(data) {
        const {statusCode, label = []} = data;
        const labels = []
        label.forEach(item => {
            labels.push(item.tagName)
        })
        data.formActionUrl = envCfg.opOrderDetailUrl;

        if (statusCode == 'EXPIRED') {
            data.isExpired = true;
        }
        // switch(statusCode) {
        //     case 0:
        //         data.statusText = '已支付';
        //         break;
        //     case 1:
        //         data.statusText = '已过期';
        //         break;
        //     default:
        //         break;
        // }

        return {...data, labels};
    },

    render: function() {

        const data = this.format(this.model.toJSON());
        // 第一次进来knbaseNode是没有的
        const knbaseNode = this.$el.find('#detail-cnt-knbase')
        const telephoneNode = this.$el.find('#detail-cnt-telephone')

    	this.$el.html(tpl(data));

        if (knbaseNode.length) {
            // 先干掉重复的壳子
            this.$el.find('#detail-cnt-knbase').remove()
            // 将原react组件 原滋原味的塞回来
            this.$el.find('#detail-cnt-stu').parent().append(knbaseNode)
        } else {
            // 第一次加载react组件
            this.initKnbaseReact();
        }
        if (telephoneNode.length) {
            this.$el.find('#detail-cnt-telephone').remove()
            this.$el.find('#detail-cnt-stu').parent().append(telephoneNode)
        } else {
            // this.initTelePhoneReact()
        }
    }
});

export {DetailInfo}
