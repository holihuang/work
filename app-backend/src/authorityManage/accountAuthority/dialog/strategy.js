/**
 * @file 策略修改
 *
 * @author gushouchuang
 * @date 2018-10-30
 */

import { service } from 'common/service'

const tpl = require('./strategy.html')

const Model = Backbone.Model.extend({
    defaults: {
        strategyNo: 0,
    },
})

const Strategy = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.options = options

        this.listenTo(this.model, 'change:strategyNo', this.render)

        this.loadData()

        this.render()
    },

    events: {},

    loadData() {
        const params = {
            operator: window.userInfo.userAccount,
        }
        service.adminGetBanPolicy(params, response => {
            if (response.rs) {
                const { chatPeerNumber } = response.resultMessage

                this.model.set({
                    strategyNo: chatPeerNumber,
                })
            } else {
                alert('查找失败！')
            }
        })
    },


    render() {
        const data = this.model.toJSON()
        this.$el.html(tpl(data))
    },
})

export { Strategy }
