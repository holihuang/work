import {service} from '../../../common/service'
import {common} from '../../../common/common'
import {Pager} from '../../../components/pager/index'
import {ImgPreview} from '../../../components/imgPreview/index'
import tpl from './tpl.html'
import itemTpl from './contentItems/tpl.html'

const PAGE_SIZE = 100
const CATEGORY = 2 //标记为黄图
const CurrentDate = common.getTime().split(' ')[0];

const datepickerCfg = {
    format: 'yyyy-m-d',
    autoclose: true,
    todayBtn: true,
    minView: 3,
    //startDate: '2017-10-9'
}

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
        pageNo: 1,
        pageSize: 100,
        pageCount: 1,
    }
})

const PicLib = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model()
        this.listenTo(this.model, 'change:resultList', this.renderResultList)
        this.listenTo(this.model, 'change:pageNo', this.renderPager)
        this.listenTo(this.model, 'change:pageCount', this.renderPager)
        this.render()
        this.$el.find('#createTime').val(CurrentDate)
        this.getPageData()
    },

    events: {
        'click #delBtn': 'delChecked',
        'focus #createTime': 'showDatetimepicker',
        'change #status,#createTime': 'getPageData',
        'click .img': 'previewImg',
    },

    previewImg(e) {
        const imgUrl = $(e.currentTarget).attr('src').replace(/small/,'original')
        new ImgPreview({
            imgUrl
        })
    },

    delChecked() {
        const tip = "确定要把当前页中选中的图片删除、未选中的图片标为已读吗？"
        if (confirm(tip)) {
            let picIds = []
            this.$el.find('input:checkbox:checked').each((index,item)=>{
                picIds.push($(item).attr('recordId'))
            })
            const {pageSize, pageNo} = this.model.toJSON()
            const userInfo = common.getUserInfo()
            const param = common.getFormData({
                formId: 'form'
            })
            service.prohibitedPic({
                pageNo,
                pageSize,
                category: CATEGORY,
                operator: userInfo.userAccount,
                picIds,
                ...param
            }, (response) => {
                if (response.rs) {
                    alert('标记成功!') //'人工判定疑似黄图成功'
                    this.getPageData()
                } else {
                    alert(response.rsdesp)
                }
            })
        }
    },

    showDatetimepicker(e) {
        $(e.currentTarget).datetimepicker(datepickerCfg)
    },

    getPageData(options = {}) {
        const {pageNo = 1, pageSize = PAGE_SIZE} = options
        const { status = 0, createTime = CurrentDate } = common.getFormData({
            formId: 'form'
        })   
        service.listPicSuspected({
            pageNo,
            pageSize,
            status,
            createTime
        }, (response) => {
            if (response.rs) {
                let {pageIndex, pageCount, countPerPage, resultList} = response.resultMessage
                this.model.set({
                    pageNo: pageIndex,
                    pageSize: countPerPage,
                    pageCount,
                    resultList
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    renderResultList() {
        this.$el.find('#tableContainer').html(itemTpl(this.model.toJSON()))
    },

    renderPager() {
        const {pageSize, pageNo, pageCount} = this.model.toJSON()
        this.pager && this.pager.undelegateEvents()
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer'),
            pageSize,
            pageNo,
            pageCount,
            optionsList: [
                {
                    value: 25,
                    optionsChecked: '',
                    valueText: '25'
                },
                {
                    value: 50,
                    optionsChecked: '',
                    valueText: '50'
                },
                {
                    value: 100,
                    
                    optionsChecked: '',
                    valueText: '100'
                }
            ],
            onChange: this.getPageData.bind(this)
        })
    },

    render: function() {
        this.$el.html(tpl())
        this.renderPager()
        this.renderResultList()
    }
})

export {PicLib}