import { common } from '../../../../common/common'
import { validate } from '../../../../common/validate'

const tpl = require('./tpl.html')

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
    minView: 'hour',
}

const Model = Backbone.Model.extend({
    defaults: {

    },
})

const AddHotPost = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        const {
            beginTime, endTime, postMasterId, pageNumber, ranking, position,
        } = options
        this.model.set({
            beginTime,
            endTime,
            postMasterId,
            pageNumber,
            ranking,
            position,
        })
        this.render()
    },

    events: {
        'click #beginTime': 'showBeginTimeTimePicker',
        'click #endTime': 'showEndTimeTimePicker',
        'click #recConfig': 'enableOrDisableinput',
        'change #contentType': 'toggleType',
        'click .uploadPicBtn': 'uploadPic',
        'blur .contentDetail': 'checkUrl',
    },

    checkUrl(e) {
        const type = this.$el.find('#contentType').val()
        const valStr = $(e.currentTarget).val().trim()
        if (type == 3 && valStr) {
            if (!validate.isUrlPrefix(valStr)) {
                $(e.currentTarget).val('')
            }
        }
    },

    uploadPic(e) {
        common.picUploaderNew(onSuccess => {
            const { width = '', height = '', linkUrl } = onSuccess.resultMessage[0]
            this.$el.find('.uploadPicBtn').text('更新图片').prop('disabled', false)
            if (width * 220 != height * 750) {
                alert('上传图片尺寸需为750*220')
                return false
            }
            this.model.set({
                uploaded: true,
                contentPic: linkUrl,
            })
            this.$el.find('#contentPic').val(linkUrl)
        },	onChange => {
            const { size = '' } = onChange
            if (size > 500 * 1024) {
                alert('图片大小需在500K以内！')
                return false
            }
            this.$el.find('.uploadPicBtn').text('上传中...').prop('disabled', true)
        })
    },

    enableOrDisableinput(params) {
        const { isCalled } = params
        const ischecked = isCalled || this.$el.find('#recConfig').prop('checked')
        if (ischecked) {
            this.$el.find('#beginTime').removeAttr('disabled')
            this.$el.find('#endTime').removeAttr('disabled')
            this.$el.find('#pageNo').removeAttr('disabled')
            this.$el.find('#ranking').removeAttr('disabled')
        } else {
            this.$el.find('#beginTime').prop('disabled', true)
            this.$el.find('#endTime').prop('disabled', true)
            this.$el.find('#pageNo').prop('disabled', true)
            this.$el.find('#ranking').prop('disabled', true)
            this.$el.find('#beginTime').val('')
            this.$el.find('#endTime').val('')
            this.$el.find('#pageNo').val('')
            this.$el.find('#ranking').val('')
        }
    },

    toggleType() {
        const type = this.$el.find('#contentType option:selected').val()
        this.caseOption(type)
    },

    caseOption(opt) {
        this.$el.find('.contentDetail').removeClass('hide').prop('type', 'number').val('')
        this.$el.find('.form-group-upload').addClass('hide')
        this.$el.find('#recConfig').prop('checked', false).prop('disabled', false)
        this.$el.find('.form-group-pageTitle').addClass('hide')
        this.toggleMiniProgramIpts()

        let placeholderText
        if (opt == 0) {
            this.$el.find('.contentDetail').addClass('hide')
        } else if (opt == 1) {
            placeholderText = '请输入帖子Id'
        } else if (opt == 2) {
            placeholderText = '请输入问题ID'
        } else if (opt == 3) {
            this.$el.find('.contentDetail').prop('type', 'text')
            this.$el.find('.form-group-upload').removeClass('hide')
            this.$el.find('#recConfig').prop('checked', true).prop('disabled', true)
            this.$el.find('.form-group-pageTitle').removeClass('hide')
            placeholderText = '请输入完整url（以http/https/ftp开头）'
        } else if (+opt === 4) {
            placeholderText = '请输入推荐小程序名称'
            this.$el.find('.contentDetail').prop('type', 'text')
            this.$el.find('.form-group-upload').removeClass('hide')
            this.$el.find('#recConfig').prop('checked', true).prop('disabled', true)
            this.toggleMiniProgramIpts(true)
        }
        this.$el.find('.contentDetail').prop('placeholder', `${placeholderText}`)
        const isCalled = opt == 3
        this.enableOrDisableinput({ isCalled })
    },

    toggleMiniProgramIpts(flag = false) {
        if (flag) {
            this.$el.find('.form-group-miniProgramIpt').removeClass('hide')
        } else {
            this.$el.find('.form-group-miniProgramIpt').addClass('hide')
        }
    },

    initDatepicker() {
        this.$el.find('#beginTime').datetimepicker(datepickerCfg)
        this.$el.find('#endTime').datetimepicker(datepickerCfg)
    },

    showBeginTimeTimePicker(e) {
        $(e.currentTarget).datetimepicker('show')
    },

    showEndTimeTimePicker(e) {
        $(e.currentTarget).datetimepicker('show')
    },

    initiaAddForm() {
        const { position } = this.model.toJSON()
        if (position == 3) {
            this.$el.find('#addQuestion').prop('checked', 'checked').trigger('click')
            this.$el.find('#addPosts').removeAttr('checked')
            this.$el.find("input[name='contextType']").prop('disabled', true)
            this.$el.find('#contentType option:odd').addClass('hide')
        } else if (position == 1) {
            this.$el.find('#addQuestion').removeAttr('checked')
            this.$el.find('#addPosts').prop('checked', 'checked').trigger('click')
            this.$el.find("input[name='contextType']").removeAttr('disabled')
            this.$el.find('#contentType option:odd').removeClass('hide')
        }
    },

    render() {
        const data = this.model.toJSON()
        this.$el.html(tpl(data))
        this.initDatepicker()
        this.initiaAddForm()
    },
})

export { AddHotPost }
