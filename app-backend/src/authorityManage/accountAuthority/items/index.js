import { service } from "../../../common/service"
import { Modify } from "../dialog/modify"
import { Dialog } from "../../../components/dialog/index"


const banStateLists = {
    0: '禁言中',
    1: '未曾禁言过',
    2: '已解除',
}

const banTypeList = {
    // 0: '全部',
    1: '人工手动',
    2: '系统自动',
}

const banExpireList = {
    // 0: '全部',
    1: '不禁言',
    2: '永久',
    3: '三天',
}

const banWayList = {
    '-1': '',
    1: 'IM单聊',
    2: '社区内容',
}


const tpl = require('./tpl.html')

const Model = Backbone.Model.extend({
    defaults: {}
})

const Items = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.options = options
        const { resultList, pageSize, pageNo } = options
        this.model.set({
            resultList,
            pageSize,
            pageNo,
        })
        this.render()
    },

    events: {
        "click .edit": "editDilog",
    },

    editDilog(e) {
        const { resultList, pageSize, pageNo } = this.model.toJSON()
        const index = $(e.currentTarget).attr('index')
        const resultListItem = resultList[index]

        this.modify = new Modify({
            el: this.$el.find("#modify")[0],
            resultListItem
        });

        const that = this;
        let d = new Dialog({
            title: "禁言修改",
            type: 4,
            content: this.modify.el,
            ok: function () {
                const userId = +this.$el.find("#userId").html();
                const userNickname = this.$el.find("#userNickName").html();
                // const mobile = this.$el.find("#mobile").html();
                // let banState = this.$el.find("#banState").html() === '禁言中' ? 0 : 1
                let banState = 0 // 不再依赖展示字段，而是依赖banRange字段的选择（禁言范围）

                // 范围是无的话，banState需转为1（解除）
                if (this.$el.find('#banRangeThird')[0].checked) {
                    banState = 1
                } else {
                    banState = 0
                    // 禁言范围全都没选
                    if (!this.$el.find('#banRangeFirst')[0].checked) {
                        alert('禁言范围不能为空！')
                        return
                    }
                }
                // let banRange = that.formatBanRange(
                //     this.$el.find("input[name='banRange']:checked")
                // );
                const banRange = '1、2'

                const operator = window.userInfo.userAccount
                const params = {
                    userId,
                    operator,
                    userNickname,
                    // mobile,
                    banState,
                    banRange
                };
                //禁言范围验空
                if (!banRange) {
                    alert("禁言范围不能为空！");
                    return false;
                }
                service.getAdminUpdateBanned(params, response => {
                    if (response.rs) {
                        alert("修改成功！");
                        this.closeDialog();
                        that.options.onSuccess({ pageSize, pageNo });
                    } else {
                        alert(response.rsdesp);
                    }
                });
            }
        });
    },

    formatBanRange(arr) {
        let str = "";
        arr.map((index, item) => {
            if (item.id == "banRangeFirst") {
                str += "1、2";
            // } else if (item.id == "banRangeSecond") {
            //     str += "2";
            } else if (item.id == "banRangeThird") {
                str += '-1'
            }
            // str += arr.length > 1 && index < arr.length - 1 ? "、" : "";
        });
        return str
    },

    format(data) {
        const { resultList } = data
        resultList.forEach((item, index) => {
            // 索引
            item.index = index

            // 禁言状态转换成中文
            item.banStateText = banStateLists[item.banState] || ''

            item.banTypeText = banTypeList[item.banType] || ''
            item.banExpireText = banExpireList[item.banExpire] || ''
            item.banWayText = banWayList[item.banWay] || ''

            item.operatorPrefix = item.operator
                ? item.operator.replace('@sunlands.com', '')
                : ''

            // 禁言范围转换成中文
            switch (item.banRange) {
            case '-1':
                item.banRangeText = ''
                break
            case '0':
                item.banRangeText = '无'
                break
            case '1':
                item.banRangeText = '单聊'
                break
            case '2':
                item.banRangeText = '内容'
                break
            case '1、2':
                item.banRangeText = '单聊、内容'
                break
            default:
                break
            }
        });
        return Object.assign(data, { resultList })
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },
})

export { Items }
