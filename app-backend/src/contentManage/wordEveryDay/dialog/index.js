import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
import 'datepicker/js/bootstrap-datetimepicker';
import tpl from './tpl.html';

const datepickerCfg = {
    format: 'yyyy-mm-dd 00:00:00',
    autoclose: true,
    todayBtn: true,
    minView: 'month'
}

let Model = Backbone.Model.extend({
    defaults: {
        type: 'add',  //类型，默认是新增
        startTime: '',
        endTime: '',
        bannerImage: ''
    }
});

let View = Backbone.View.extend({
    initialize(options) {
        this.model = new Model(options);
        this.render();
        this.listenTo(this.model, 'change', this.render);
        this.initData();
    },

    events: {
        'click #startTime': 'showSTdatetimepicker',
        'focus #startTime': 'showSTdatetimepicker',
        'change [name="userType"]': 'handleUserTypeChange',
        'click #college': 'handleClickCollege',
        'click [name="collegeItem"]': 'handleClickCollegeItem',
        'click #checkAllColleges': 'checkAllColleges',
        'click #closeCollegeList': 'closeCollegeList',
        'click #cancelBtn': 'cancelChooseCollege',
        'click #uploadPicBtn': 'uploadPic',
        'change [name="skipType"]': 'handleSkipTypeChange',
        'change [name="skipName"]': 'handleSkipNameChange'
    },

    initDatepicker() {
        this.$el.find('#startTime').datetimepicker(datepickerCfg);
    },

    //请求所需要的数据
    initData() {
        Promise.all([
            this.getAllNativePage(),
        ]).then(values => {
            this.model.set({
                nativePages: values[0],
            })
        })
    },

    getAllNativePage() {
        return new Promise((resolve, reject) => {
            service.getAllNativePage({}, (response) => {
                if (response.rs) {
                    resolve(response.resultMessage);
                } else {
                    alert(response.rsdesp);
                }
            })
        })
    },

    uploadPic() {
        common.picUploaderNew((response) => {
            if (response.rs) {
                let {linkUrl} = response.resultMessage[0];
                this.$el.find('#bannerImage').val(linkUrl);
                this.$el.find('#uploadPicBtn').html('更新');
            } else {
                alert(response.rsdesp);
            }

            this.$el.find('#uploadPicBtn').removeClass('disabled');
        }, ({size}) => {
            const MAX_SIZE = 1024 * 1024;
            if (size > MAX_SIZE) {
                alert('图片大小不能超过1M');
                return false;
            }
            this.$el.find('#uploadPicBtn').addClass('disabled');
        })
    },

    showSTdatetimepicker(e) {
        $(e.currentTarget).datetimepicker('show');
    },

    //当选择app页面时，显示native列表
    //当选择活动页面时，显示url输入框
    handleSkipTypeChange() {
        let skipType = this.$el.find('[name="skipType"]:checked').val();
        if (skipType == 1) {
            //app页面
            this.$el.find('#nativePagesContainer').show();
            this.$el.find('#urlInputContainer').hide();
        } else {
            //活动页面
            this.$el.find('#nativePagesContainer').hide();
            this.$el.find('#urlInputContainer').show();
        }
    },

    //当选择的native page变化时，判断是否带参数
    handleSkipNameChange() {
        let pageKey = this.$el.find('[name="skipName"]').val().split('-')[0];
        let isHaveParam = +this.$el.find('[name="skipName"]').val().split('-')[1];

        this.$el.find('#skipId').val('');
        if (isHaveParam) {
            //有参数
            this.$el.find('#skipId').show();
        } else {
            this.$el.find('#skipId').hide();
        }
    },

    //获取数据
    getData() {
        let params = common.getFormData({
            formId: 'form'
        });

        //必填校验

        //跳转类型
        let {skipType, skipName, bannerLink, skipId} = params;
        if (skipType == 3) {
            //如果是跳转到活动页，校验url合法性
            if (!common.testUrl(decodeURIComponent(bannerLink))) {
                alert('请输入合法的跳转地址！');
                return false;
            }

            params.skipName = bannerLink;
            delete params.bannerLink;
        } else {
            params.skipName = skipName.split('-')[0];
            let hasParams = +skipName.split('-')[1];

            if (!params.skipName) {
                alert('请选择跳转位置！');
                return false;
            }

            if (hasParams) {
                params.skipType = 1; //有参数跳转
                if (!skipId) {
                    alert('请输入id');
                    return false;
                }
            } else {
                params.skipType = 2; //无参数跳转
                delete params.skipId;
            }
        }

        return params;
    },

    format(data) {
        let {type} = data;
        if (type === 'add') {
            //如果是新增，设置初始值
            data.nativePagesContainerHideClass = '';
            data.urlInputContainerHideClass = 'hide';
            data.appPageChecked = 'checked';
            data.activityPageChecked = '';
            data.skipIdHideClass = 'hide';
            data.uploadPicBtnText = '上传';
        } else {
            //说明是修改，根据原始值设置当前状态
            let {skipType, skipName, skipId} = data;
            
            data.nativePagesContainerHideClass = skipType === 3 ? 'hide' : '';
            data.urlInputContainerHideClass = skipType === 3 ? '' : 'hide';
            data.appPageChecked = skipType === 3 ? '' : 'checked';
            data.activityPageChecked = skipType === 3 ? 'checked' : '';

            //如果是跳转到app页面，设置选中态
            let {nativePages = []} = data;
            nativePages.forEach((item) => {
                item.selected = item.pageKey === skipName ? 'selected' : '';
            });

            if (skipType == 1) {
                //带参数跳转
                data.skipIdHideClass = '';
            } else {
                //不带参数跳转
                data.skipIdHideClass = 'hide';
            }

            data.uploadPicBtnText = '更新';
        }
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        this.initDatepicker();
    }
})

class ConfigWordEveryDayDialog {
    constructor(options = {}) {
        this.options = options;
        this.view = new View(options);
        this.show();
    }

    show() {
        let that = this;
        this.d = new Dialog({
            title: this.options.type === 'add' ? '新增首页活动' : '更新首页活动',
            content: this.view.$el,
            type: 4,
            ok: function() {
                let data = that.view.getData();
                if (data) {
                    let reqUrl = that.options.type === 'add' ? 'addTodayMotto' : 'updateTodayMotto';
                    service[reqUrl](data, (response) => {
                        if (response.rs) {
                            alert('操作成功！');
                            if (typeof that.options.onSuccess === 'function') {
                                that.options.onSuccess();
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

export {ConfigWordEveryDayDialog}
