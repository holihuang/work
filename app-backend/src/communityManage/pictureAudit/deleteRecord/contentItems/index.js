import {ImgPreview} from '../../../../components/imgPreview/index'
import {Table} from '../../../../components/table/index'

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
    }
})

const ContentItems = Backbone.View.extend({
    initialize(options) {
        const {resultList} = options
        this.model = new Model()
        this.listenTo(this.model, 'change:resultList', this.render())
        this.model.set({resultList})
        this.render()
    },

    events: {
        'click .img': 'previewImg',
    },

    previewImg(e) {
        const imgUrl = $(e.currentTarget).attr('src').replace(/small/,'original')
        new ImgPreview({
            imgUrl
        })
    },

    updateTableList(resultList) {
        this.model.set({resultList})
    },

    destory() {
        this.$el.empty()
        this.undelegateEvents()
    },

    render() {
        const {resultList} = this.model.toJSON()
        this.table && this.table.destory && this.table.destory()
        this.table = new Table({
            columns: [  
                {
                    field: '图片',
                    escapeHtml: false,
                    content: item => `<img src="${item.picUrl}" class="img delete-record-img">`
                }, {
                    field: '分值',
                    content: 'picScore'
                }, {
                    field: '发布时间',
                    escapeHtml: false,
                    content: 'createTs'
                }, {
                    field: '操作人',
                    content: 'operator'
                }, {
                    field: '操作时间',
                    content: 'updateTs'
                }, 
            ],
            dataList: resultList
        })

        this.$el.html(this.table.$el)
    }
})

export {ContentItems}
