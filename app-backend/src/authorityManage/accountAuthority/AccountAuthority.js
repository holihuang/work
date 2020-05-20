import { service } from '../../common/service'
import { Items } from './items/index'
import { Pager } from '../../components/pager/index'
import { Dialog } from '../../components/dialog/index'
import { Strategy } from './dialog/strategy'

const tpl = require('./AccountAuthority.html')

const datepickerCfg = {
    format: 'yyyy-mm-dd',
    autoclose: true,
    todayBtn: true,
    minView: 2,
    startDate: new Date('2017-09-20'),
}

const PAGE_SIZE = 25
const Model = window.Backbone.Model.extend({
    defaults: {
        resultList: [],
        pageSize: PAGE_SIZE,
        pageNo: 1,
        pageCount: -1,
        isDEV: false,
    }
})

const AccountAuthority = window.Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.options = options
        this.listenTo(this.model, 'change:resultList', this.renderTableList)
        this.listenTo(this.model, 'change:pageCount', this.renderPager)
        const roleList = (window.userInfo.userRole || '').split(',')
        // 拥有研发权限
        if (roleList.includes('DEV')) {
            this.model.set({
                isDEV: true,
            })
        }

        this.render()
    },

    events: {
        'click #searchBtn': 'search',
        'change #type': 'toggleSelect',
        'click #downloadBtn': 'download',
        'click #strategy': 'strategy',
        'input #nickname': 'showNicknames',
        'click .nickname-item': 'chooseAName',
        'click #banDateFrom': 'showDateTimePicker',
        'click #banDateTo': 'showDateTimePicker',
    },

    initDatepicker() {
        this.$el.find('#banDateFrom').datetimepicker(datepickerCfg)
        this.$el.find('#banDateTo').datetimepicker(datepickerCfg)
    },

    showDateTimePicker(e) {
        $(e.currentTarget).datetimepicker('show')
    },

    search(options) {
        const { pageSize = PAGE_SIZE, pageNo = 1 } = options
        const type = +this.$el.find('#type option:selected').val()
        const banState = +this.$el.find('#banState').val()
        const userId = this.$el.find('#userId').val()
        const userNickname = this.$el.find('#nickname').val()
        const operator = this.$el.find('input[name="operator"]').val()

        const banType = +this.$el.find('#banType').val()
        const banExpire = +this.$el.find('#banExpire').val()
        const banWay = +this.$el.find('#banWay').val()
        const banDateFrom = this.$el.find('#banDateFrom').val()
        const banDateTo = this.$el.find('#banDateTo').val()

        if (banDateFrom && banDateTo && new Date(banDateFrom).getTime() > new Date(banDateTo).getTime()) {
            alert('查询止时间段必须大于查询起时间段')
            return
        }

        const params = {
            operator,
            userId,
            userNickname,
            banState,
            pageSize,
            pageNo,
            banType,
            banWay,
            banExpire,
            banDateFrom,
            banDateTo,
        }
        // banState = 1时, userId || App账号昵称 必填
        if (banState === 1) {
            if (!type && !userId) {
                alert('未禁言状态下，学员ID不能为空！')
                return
            }
            if (type && !userNickname) {
                alert('未禁言状态下，App账号昵称不能为空！')
                return
            }
        }

        const reg = /^[0-9]*$/
        if (!reg.test(this.$el.find('#userId').val())) {
            alert('学员ID仅支持输入数字!')
            return
        }

        if ((banDateFrom && !banDateTo) || (banDateTo && !banDateFrom)) {
            alert('请同时选择起止时间!')
            return
        }

        this.$el.find('#loading').removeClass('hide')
        service.getAdminBannedList(params, response => {
            this.$el.find('#loading').addClass('hide')
            if (response.rs) {
                const {
                    resultList, countPerPage, pageIndex, totalCount, pageCount,
                } = response.resultMessage

                this.model.set({
                    resultList,
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount,
                    totalCount,
                })
            } else {
                alert('查找失败！')
            }
        })
    },

    showNicknames() {
        const nickname = encodeURIComponent($('#nickname').val())
        if (nickname) {
            service.showNicknames({ nickname }, response => {
                if (response.rs) {
                    const nicknameList = response.resultMessage || []
                    let str = ''
                    for (let i = 0, len = nicknameList.length; i < len; i += 1) {
                        str += `<li class="nickname-item" userid="${nicknameList[i].id}" name="${nicknameList[i].nickname}">${nicknameList[i].nickname}</li>`
                    }

                    // 判断是否和当前输入的内容一致
                    if ($('#nickname').val() === decodeURIComponent(nickname)) {
                        this.$el.find('#nicknameList').html(str)
                    }
                }
            })
        } else {
            $('#nicknameList').html('')
            $('#userId').val('')
        }
    },

    chooseAName(e) {
        const userId = $(e.currentTarget).attr('userid')
        const userNickName = $(e.currentTarget).attr('name')
        $('#nickname').val(userNickName)
        $('#userId').val(userId)
        this.correctUserName = userNickName
        $('#nicknameList').html('')
        e.preventDefault()
        return false
    },

    toggleSelect() {
        const typeVal = +this.$el.find('#type option:selected').val();
        // if(typeVal) {
        //     this.$el.find('#studentIdOrNickname').attr('placeholder', '请填写App账号昵称');
        // } else {
        //     this.$el.find('#studentIdOrNickname').attr('placeholder', '请填写学员ID');
        // }
        if (typeVal) {
            this.$el.find('#formGroupNickName').removeClass('hide-important')
            this.$el.find('#formGroupUserId').addClass('hide-important')
        } else {
            this.$el.find('#formGroupUserId').removeClass('hide-important')
            this.$el.find('#formGroupNickName').addClass('hide-important')
        }
        this.$el.find('#userId').val('')
        this.$el.find('#nickname').val('')
    },

    download() {
        const banState = +this.$el.find('#banState option:selected').val()
        const operator = this.$el.find('input[name="operator"]').val()

        const banType = +this.$el.find('#banType').val()
        const banExpire = +this.$el.find('#banExpire').val()
        const banWay = +this.$el.find('#banWay').val()
        const banDateFrom = this.$el.find('#banDateFrom').val()
        const banDateTo = this.$el.find('#banDateTo').val()

        const params = {
            banState,
            operator,
            channelCode: 'CS_BACKGROUND',
            pageNo: 1,
            pageSize: 25,
            banType,
            banWay,
            banExpire,
            banDateFrom,
            banDateTo,
        }
        const type = +this.$el.find('#type option:selected').val()
        const userId = +this.$el.find('#userId').val()
        const userNickname = this.$el.find('#nickname').val()
        if (banState === 1) {
            if (!type && !userId) {
                alert('未禁言状态下，学员ID不能为空！')
                return false
            }
            if (type && !userNickname) {
                alert('未禁言状态下，App账号昵称不能为空！')
                return false
            }
        }

        if ((banDateFrom && !banDateTo) || (banDateTo && !banDateFrom)) {
            alert('请同时选择起止时间!')
            return false
        }

        if (banDateFrom && banDateTo && new Date(banDateFrom).getTime() > new Date(banDateTo).getTime()) {
            alert('查询止时间段必须大于查询起时间段')
            return false
        }

        // 禁言状态为否时，学员ID必填
        if (userId) {
            Object.assign(params, { userId })
        }
        if (userNickname) {
            Object.assign(params, { userNickname })
        }
        service.adminDownloadBannedList(params)

        return null
    },

    strategy() {
        const _that = this

        _that.strategy = new Strategy({
            el: _that.$el.find('#strategyView')[0],
        })

        _that.modDialog = null

        _that.modDialog = new Dialog({
            title: '策略修改',
            type: 4,
            content: _that.strategy.el,
            ok: () => {
                const chatPeerNumber = +$('#strategyMod').val()

                if (chatPeerNumber && chatPeerNumber >= 1 && chatPeerNumber <= 40) {
                    if (chatPeerNumber !== Math.round(chatPeerNumber)) {
                        alert('请填写整数')
                        return
                    }

                    const operator = window.userInfo.userAccount
                    const params = {
                        operator,
                        chatPeerNumber,
                    }

                    service.adminSetBanPolicy(params, response => {
                        if (response.rs) {
                            alert('修改成功！')
                            _that.modDialog.closeDialog()
                        } else {
                            alert(response.rsdesp)
                        }
                    })
                } else {
                    alert('请填写1-40之间的整数')
                }
            }
        })
    },

    renderTableList() {
        const { resultList, pageSize, pageNo } = this.model.toJSON()

        if (this.items) {
            this.items.undelegateEvents()
        }
        this.items = new Items({
            el: this.$el.find('#tbody')[0],
            onSuccess: this.search.bind(this),
            resultList,
            pageSize,
            pageNo,
        })
    },

    renderPager() {
        const {
            pageSize, pageNo, pageCount, totalCount,
        } = this.model.toJSON()

        if (this.pager) {
            this.pager.undelegateEvents()
        }
        this.pager = new Pager({
            el: this.$el.find('#pager')[0],
            onChange: this.search.bind(this),
            pageSize,
            pageNo,
            pageCount,
            totalCount,
            optionsList: [
                {
                    value: 10,
                    optionsChecked: '',
                    valueText: '10',
                },
                {
                    value: 25,
                    optionsChecked: '',
                    valueText: '25',
                },
                {
                    value: 50,
                    optionsChecked: '',
                    valueText: '50',
                },
            ],
        })
    },


    render() {
        const data = this.model.toJSON()
        this.$el.html(tpl(data))
        this.initDatepicker()
    }
});

export { AccountAuthority }
