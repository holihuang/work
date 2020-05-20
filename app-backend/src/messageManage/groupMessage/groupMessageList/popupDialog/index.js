import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import {envCfg} from '../../../../common/envCfg';
import 'datepicker/js/bootstrap-datetimepicker';
import moment from 'moment';
import tpl from './tpl.html';

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
    minView: 'hour'
}

let Model = Backbone.Model.extend({
    defaults: {
        popupId: 0,
        groupId: 0,
        fileId: 0
    }
});

let View = Backbone.View.extend({
    initialize(options) {
        let {popupId, groupId, fileId, title, messagePublishTime, skipId} = options;
        this.model = new Model();
        this.model.set({popupId, groupId, fileId, title, messagePublishTime});
        this.listenTo(this.model, 'change', this.render);
        //这里必须先手动render一次，不然弹窗里没东西
        this.render();

        if (popupId) {
            //说明是更新，先请求数据
            this.getPopupInfo();
        }
    },

    events: {
        'click #uploadPicBtn': 'uploadPic',
        'click [name="startTime"]': 'stDatepicker',
        'focus [name="startTime"]': 'stDatepicker',
        'click [name="endTime"]': 'etDatepicker',
        'focus [name="endTime"]': 'etDatepicker'
    },

    uploadPic(e) {
        common.picUploaderNew((response) => {
            if (response.rs) {
                let {height, width, linkUrl} = response.resultMessage[0];
                if (height * 3 === width * 4) {
                    this.$el.find('[name="imgUrl"]').val(linkUrl);
                    this.$el.find('.thumbnail-img').attr('src', linkUrl);
                    $(e.currentTarget).removeClass('btn-border').addClass('btn-border-reverse').html('重新上传');
                } else {
                    alert('图片尺寸要求为600*800');
                }
            } else {
                alert(response.rsdesp);
            }
        }, (options) => {
            let {size} = options;
            if (size > 2 * 1024 * 1024) {
                alert('上传图片大小不可超过2M');
                return false;
            }
            $(e.currentTarget).text('正在上传...');
        })
    },

    stDatepicker(e) {
        $(e.currentTarget).datetimepicker(datepickerCfg);
        $(e.currentTarget).datetimepicker('show');
    },

    etDatepicker(e) {
        $(e.currentTarget).datetimepicker(datepickerCfg);
        $(e.currentTarget).datetimepicker('show');
    },

    getPopupInfo() {
        let {popupId} = this.model.toJSON();
        if (popupId) {
            service.getNotifyPopup({
                popupId
            }, (response) => {
                if (response.rs) {
                    this.model.set(response.resultMessage);
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    getData() {
        let params = common.getFormData({
            formId: 'popupConfigDialog'
        });

        //必填校验
        let {popupName, position, startTime, endTime, imgUrl} = params;
        if (!popupName) {
            alert('请填写弹窗名称！');
            return false;
        }
        // if (!position) {
        //     alert('请填写弹窗排位！');
        //     return false;
        // }
        if (!startTime) {
            alert('请选择展示开始时间！');
            return false;
        }
        if (!endTime) {
            alert('请选择展示结束时间！');
            return false;
        }
        if (!imgUrl) {
            alert('请上传图片！');
            return false;
        }

        if(decodeURIComponent(popupName).length > 15) {
            alert('弹窗名称不可超过15个字!');
            return false;
        }

        let {messagePublishTime} = this.model.toJSON();
        if (moment(decodeURIComponent(startTime)).valueOf() - moment(messagePublishTime).valueOf() < 0) {
            alert('弹窗展示开始时间需晚于消息发布时间！');
            return false;
        }

        //合法性校验
        if (moment(decodeURIComponent(startTime)).valueOf() - moment(decodeURIComponent(endTime)).valueOf() > 0) {
            alert('开始时间不能早于结束时间，请重新选择! ');
            return false;
        }

        let {popupId, groupId, fileId, title} = this.model.toJSON();

        return {
            popupId,
            audienceId: groupId,
            title: encodeURIComponent(title),
            ...params
        }
    },

    format(data) {
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

class PopupDialog{
    constructor(options) {
        this.options = options;
        this.view = new View(options);
        this.show();
    }

    show() {
        let that = this;
        new Dialog({
            title: '配置APP弹窗',
            content: this.view.$el,
            type: 4,
            ok: function() {
                let data = that.view.getData();
                if (data) {
                    let reqUrl = that.options.popupId ? 'modifyNotifyPopup' : 'addNotifyPopup';
                    service[reqUrl](data, (response) => {
                        if (response.rs) {
                            alert('操作成功！');
                            if (typeof that.options.callback === 'function') {
                                that.options.callback();
                            }
                            this.closeDialog();
                        } else {
                            alert(response.rsdesp);
                        }
                    }) 
                }
            }
        })
    }
}

export {PopupDialog}
