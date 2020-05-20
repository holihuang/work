import {PicLib} from './picLib/index'
import {DeleteRecord} from './deleteRecord/index'

const tpl = require('./tpl.html')

const tabInfo = ['包含机器审核后标为普通图片、疑似黄图的图片','包含机器审核删除的图片、人工审核删除的图片']
const Model = Backbone.Model.extend({
    defaults: {
        type: 0  //默认为图片库, 为0表示图片库，为1表示删除记录
    }
})

const PictureAudit = Backbone.View.extend({
    initialize: function(options) {
        let {type} = options
        this.model = new Model()
        this.model.set({type})
        this.render()
    },

    events: {
        'click .question-mark': 'showTabInfo'
    },

    showTabInfo(e) {
        alert(tabInfo[$(e.currentTarget).attr('index')])
    },
    
    renderPicLib() {
        new PicLib({
            el: this.$el.find('#contentContainer')
        })
    },

    renderDeleteRecord() {
        new DeleteRecord({
            el: this.$el.find('#contentContainer')
        })
    },

    format(data) {
        let {type} = data
        switch(type) {
            case "0":
                data.picLibActiveClass = 'active'
                data.showPicLib = true
                break
            case "1":
                data.deleteRecordActiveClass = 'active'
                data.showDeleteRecord = true
                break
        }

        return data
    },

    render() {
        let data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))

        if (data.showPicLib) {
            this.renderPicLib()
        } else if (data.showDeleteRecord) {
            this.renderDeleteRecord()
        }
    }
})

export {PictureAudit}