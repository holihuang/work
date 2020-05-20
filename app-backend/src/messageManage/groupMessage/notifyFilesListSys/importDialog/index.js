
import { Dialog } from '../../../../components/dialog/index'
import { service } from '../../../../common/service'
import { url } from '../../../../common/url'
import { common } from '../../../../common/common'

import tpl from './tpl.html'

let Model = Backbone.Model.extend({
    defaults: {
        showFreeTpl: false,
        showUnfreeTpl: true,
        isCheckFree: '',
        isCheckUnfree: 'checked',
        uploadFileName: '',
        uploadFileData: '',
    }
});

let View = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.listenTo(this.model, 'change', this.render)

        let uploadFileData = new FormData();

        uploadFileData.append('creater', window.userInfo.userAccount)

        this.model.set({
            uploadFileData
        })

        //这里必须先手动render一次，不然弹窗里没东西
        this.render()
    },

    events: {
        'click #importUpload': 'uploadFile',
        'change #importUploadImput': 'uploadFileFetch',
        'click input[name="senderUser"]': 'changeSend',
    },

    changeSend(e) {
        const value = $(e.target).val()

        this.model.set({
            showFreeTpl: value === 'showFreeTpl',
            showUnfreeTpl: value === 'showUnfreeTpl',
        })
    },

    uploadFile() {
        this.$el.find('#importUploadImput').click()
    },

    uploadFileFetch(e) {
        const that = this
        const files = $(e.target)[0].files;
        const {name, size} = files[0];

        const uploadFileData = this.model.get('uploadFileData')

        uploadFileData.append('file', files[0], name)

        this.model.set({
            uploadFileName: name, // 显示成功上传的文档名字
            uploadFileData, // 文本数据
        })
    },

    getData() {
        return this.model.get('uploadFileData')
    },

    format(data) {
        const { showFreeTpl, showUnfreeTpl, uploadFileName } = data
        data.isCheckUnfree = showUnfreeTpl === true ? 'checked' : ''
        data.isCheckFree = showFreeTpl === true ? 'checked' : ''
        data.showUploadFileName = !!uploadFileName

        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

class ImportDialog{
    constructor(options) {
        this.options = options;
        this.view = new View(options);
        this.refreshList = options.refreshList
        this._isSubmiting = false
        this.show();
    }

    uploadFile() {
        this.view.uploadFile()
    }

    show() {
        let that = this;
        that.imprtDialog = new Dialog({
            title: '导入通知对象',
            content: this.view.$el,
            type: 4,
            ok: function() {
                // 这里是浅拷贝formdata
                const uploadFileData = that.view.getData()

                if (!uploadFileData.get('file')) {
                    alert('请先上传要导入的文件')
                    return
                }

                if (that._isSubmiting) {
                    console.log('文件正在上传中，请稍后...')
                    return
                }

                // 标识已经在请求中了
                that._isSubmiting = true

                // 避免服务异常404 标志位不被清理，加时间控制
                setTimeout(() => {
                    that._isSubmiting = false
                }, 3000)

                common.loading()

                const senduserType = that.view.model.get('showFreeTpl') ? 0 : 1
                uploadFileData.set('sendUserType', senduserType)

                $.ajax({
                    url: url.UPLOAD_NOTIFY_FILE,
                    type: 'post',
                    data: uploadFileData,
                    dataType: 'json',
                    processData: false,
                    cache: false,
                    contentType: false
                }).done(function(response) {
                    common.removeLoading()

                    that._isSubmiting = false
                    // 导入失败
                    if (response.rs === 0) {
                        alert(response.rsdesp)
                    } else {
                        alert('导入成功')

                        that.imprtDialog.closeDialog()
                        that.refreshList && that.refreshList()
                    }
                }).fail((jqXHR, textStatus) => {
                    common.removeLoading();
                    // TODO 显示错误信息
                    alert(jqXHR.responseText)
                })
            }
        })
    }
}

export {ImportDialog}
