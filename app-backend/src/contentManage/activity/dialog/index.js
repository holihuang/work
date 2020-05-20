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
        bannerImage: '',
        nativePages: []
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
        'click #endTime': 'showETdatetimepicker',
        'focus #endTime': 'showETdatetimepicker',
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
        this.$el.find('#endTime').datetimepicker(datepickerCfg);
    },

    //请求所需要的数据
    initData() {
        Promise.all([
            this.getAllNativePage(),
            this.getAllCollege()
        ]).then(values => {
            this.model.set({
                nativePages: values[0],
                collegeList: values[1]
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

    getAllCollege() {
        return new Promise((resolve, reject) => {
            service.getAllCollege({}, (response) => {
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

    checkAllColleges(e) {
        if ($(e.currentTarget).is(':checked')) {
            this.$el.find('input[name="collegeItem"]').each(function() {
                $(this).prop('checked', true);
            })
        } else {
            this.$el.find('input[name="collegeItem"]').each(function() {
                $(this).prop('checked', false);
            })
        }
    },

    showSTdatetimepicker(e) {
        $(e.currentTarget).datetimepicker('show');
    },

    showETdatetimepicker(e) {
        $(e.currentTarget).datetimepicker('show');
    },

    handleUserTypeChange() {
        let {nativePages} = this.model.toJSON();
        let nativePagesToShow = [];
        let rs = '<option value="">请选择跳转位置</option>';
        if (this.$el.find('[name="userType"]:checked').val() == 1) {
            //付费用户
            this.$el.find('#addReceiver').show();

            nativePagesToShow = nativePages;
        } else {
            this.$el.find('#addReceiver').hide();
            nativePagesToShow = nativePages.filter(item => !item.isVipPage);
        }

        nativePagesToShow.forEach(item => {
            let {pageKey, isHaveParam, pageDescription} = item;
            rs += `
                <option value="${pageKey}-${isHaveParam}">${pageDescription}</option>
            `;
        });

        this.$el.find('#skipName').html(rs);
        this.$el.find('#skipId').hide();
    },

    handleClickCollege() {
        this.$el.find('.college-container').show();
        let collegeList = this.$el.find('#college').val();
        let isCheckAll = true;

        this.$el.find('input[name="collegeItem"]').each(function() {
            if (collegeList.indexOf($(this).val()) != -1) {
                if ($(this).val()) {
                    $(this).prop('checked', true);
                }
            } else {
                //如果该未被选择项不是全部选项
                if ($(this).val()) {
                    $(this).prop('checked', false);
                    isCheckAll = false;
                }
            }
        })

        if (isCheckAll) {
            this.$el.find('#checkAllColleges').prop('checked', true);
        }
    },

    handleClickCollegeItem(e) {
        if (!$(e.currentTarget).is(':checked')) {
            $('#checkAllColleges').prop('checked', false);
        }
    },

    closeCollegeList() {
        let rs = [];
        this.$el.find('input[name="collegeItem"]:checked').each(function() {
            let val = $(this).attr('value');
            val && rs.push(val);
        })
        this.$el.find('#college').val(rs.join(';'));
        this.$el.find('.college-container').hide();
    },

    cancelChooseCollege() {
        this.$el.find('input[name="collegeItem"]').each(function() {
            $(this).prop('checked', false);
        })
        this.$el.find('.college-container').hide();
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
        if ((!this.$el.find('#college').val()) || (this.$el.find('#checkAllColleges').is(':checked'))) {
            //不选默认为全部
            params.college = 'ALL';
        } else {
            //选择了部分学院
            params.college = decodeURIComponent(params["college"]); 
        }

        //如果是免费用户和全部用户，删除学院项
        if (params.userType == '0' || params.userType == '2') {
            delete params.college;
        }

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
                alert('请选择跳转位置');
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
            //默认选中全部用户
            data.allUserChecked = 'checked';
            data.freeUserChecked = '';
            data.vipUserChecked = '';
            data.uploadPicBtnText = '上传';
            data.receiverClass = 'hide';

            //默认展示非vip native页
            data.nativePagesToShow = data.nativePages.filter(item => !item.isVipPage);
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

            let {userType} = data;

            data.freeUserChecked = userType == 0 ? 'checked' : '';
            data.vipUserChecked = userType == 1 ? 'checked' : '';
            data.allUserChecked = userType == 2 ? 'checked' : '';

            data.receiverClass = userType == 1 ? '' : 'hide';

            data.uploadPicBtnText = '更新';

            if (userType != 1) {
                data.nativePagesToShow = nativePages.filter(item => !item.isVipPage);
            } else {
                data.nativePagesToShow = nativePages;
            }
        }
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        this.initDatepicker();
    }
})

class ConfigActivityDialog {
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

export {ConfigActivityDialog}
