import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';

require('datepicker/js/bootstrap-datetimepicker');

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        provinceMap: {
            1: '上海市',
            2: '云南市',
            3: '内蒙古自治区',
            4: '北京市',
            5: '台湾省',
            6: '吉林省',
            7: '四川省',
            8: '天津市',
            9: '宁夏回族自治区',
            10: '安徽省',
            11: '山东省',
            12: '山西省',
            13: '广东省',
            14: '广西壮族自治区',
            15: '新疆维吾尔自治区',
            16: '江苏省',
            17: '江西省',
            18: '河北省',
            19: '河南省',
            20: '浙江省',
            21: '海南省',
            22: '湖北省',
            23: '湖南省',
            24: '澳门特别行政区',
            25: '甘肃省',
            26: '福建省',
            27: '西藏自治区',
            28: '贵州省',
            29: '辽宁省',
            30: '重庆市',
            31: '陕西省',
            32: '青海省',
            33: '香港特别行政区',
            34: '黑龙江省'
        },
        nativePages: []
    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.model.set(options);
        this.render();
        this.listenTo(this.model, 'change', this.render);
        this.initData();
    },

    events: {
        'click #startTime': 'initSTdp',
        'click #endTime': 'initETdp',
        'click #college': 'showCollegeList',
        'click #provinceName': 'showProvinceList',
        'click #closeCollegeList': 'closeCollegeList',
        'click #closeProvinceList': 'closeProvinceList',
        'click #checkAllColleges': 'checkAllColleges',  //选择全部学院
        'click #checkAllProvinces': 'checkAllProvinces',  //选择全部省份
        'click #allUser': 'hideReceiver',
        'click #vipUser': 'showReceiver',
        'click #freeUser': 'hideReceiver',
        'change [name="skipType"]': 'handleSkipTypeChange',
        'change [name="skipName"]': 'handleSkipNameChange',
        'click #uploadPicBtn': 'uploadPic'
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

    initSTdp() {
        if (!this.stdp) {
            $('#startTime').datetimepicker({
                format: 'yyyy-mm-dd hh:ii:00',
                autoclose: true,
                todayBtn: true
            });
            this.stdp = true;
        }
        $('#startTime').datetimepicker('show');
    },

    initETdp() {
        let startTime = $('#startTime').val();
        if (!startTime) {
            alert('请选择开始时间');
            return;
        }
        if (!this.etdp) {
            $('#endTime').datetimepicker({
                format: 'yyyy-mm-dd hh:ii:00',
                autoclose: true,
                todayBtn: true
            });

            this.etdp = true;
        }

        $('#endTime').datetimepicker('show');
    },

    showReceiver() {
        $('#receiver').show();

        let {nativePages} = this.model.toJSON();
        let rs = '<option value="">请选择跳转位置</option>';
    
        nativePages.forEach(item => {
            let {pageKey, isHaveParam, pageDescription} = item;
            rs += `
                <option value="${pageKey}-${isHaveParam}">${pageDescription}</option>
            `;
        });

        this.$el.find('#skipName').html(rs);
        this.$el.find('#skipId').hide();
    },

    hideReceiver() {
        $('#receiver').hide();

        let {nativePages} = this.model.toJSON();
        let nativePagesToShow = nativePages.filter(item => !item.isVipPage);
        let rs = '<option value="">请选择跳转位置</option>';

        nativePagesToShow.forEach(item => {
            let {pageKey, isHaveParam, pageDescription} = item;
            rs += `
                <option value="${pageKey}-${isHaveParam}">${pageDescription}</option>
            `;
        });

        this.$el.find('#skipName').html(rs);
        this.$el.find('#skipId').hide();
    },

    uploadPic() {
        common.picUploaderNew((response) => {
            if (response.rs) {
                let {linkUrl} = response.resultMessage[0];
                this.$el.find('[name="adImage"]').val(linkUrl);
                this.$el.find('#showImg').attr('src', linkUrl);
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

    showCollegeList() {
        this.$el.find('.college-container').show();
        //初始化选择状态
        let collegeList = $('#college').val();
        this.$el.find('input[name="collegeItem"]').each(function() {
            if (collegeList.indexOf($(this).val()) != -1) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        })
        this.$el.find('.province-container').hide();
    },

    showProvinceList() {
        this.$el.find('.province-container').show();
        const provinceList = $('#provinceName').val();
        const {provinceMap} = this.model.toJSON();
        this.$el.find('input[name="provinceItem"]').each(function() {
            if (provinceList.indexOf(provinceMap[$(this).val()]) != -1) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        })
        this.$el.find('.college-container').hide();
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

    checkAllProvinces(e) {
        if ($(e.currentTarget).is(':checked')) {
            this.$el.find('input[name="provinceItem"]').each(function() {
                $(this).prop('checked', true);
            })
        } else {
            this.$el.find('input[name="provinceItem"]').each(function() {
                $(this).prop('checked', false);
            })
        }
    },

    closeCollegeList() {
        //获取选择的学院
        let rs = [];
        this.$el.find('input[name="collegeItem"]:checked').each(function() {
            let val = $(this).attr('value');
            val && rs.push(val);
        })
        this.$el.find('#college').val(rs.join(';'));
        this.$el.find('.college-container').hide();
    },

    closeProvinceList() {
        //获取选择的省份
        let rs = [];
        let idRs = [];
        let {provinceMap} = this.model.toJSON();
        this.$el.find('input[name="provinceItem"]:checked').each(function() {
            let val = $(this).attr('value');
            val && idRs.push(val);
            val && rs.push(provinceMap[val]);
        })
        this.$el.find('#provinceId').val(idRs.join(';'));
        this.$el.find('#provinceName').val(rs.join(';'));
        this.$el.find('.province-container').hide();
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

    getData() {
        var params = common.getFormData({
            formId: 'form'
        });

        if (!params.startTime) {
            alert('请输入开始时间');
            return false;
        }
        if (!params.endTime) {
            alert('请输入结束时间');
            return false;
        }

        //若是免费用户和全部用户，删除受众省份和学院两项参数
        if (params.userType === '0' || params.userType === '2') {
            delete params.college;
            delete params.provinceId;
        } else {
            //如果是付费用户，学院字段必选
            if (!params.college) {
                alert('请选择学院！');
                return false;
            }
        }

        //跳转类型
        let {skipType, skipName, adLink, skipId} = params;
        if (skipType == 3) {
            //如果是跳转到活动页，校验url合法性
            if (!common.testUrl(decodeURIComponent(adLink))) {
                alert('请输入合法的跳转地址！');
                return false;
            }

            params.skipName = adLink;
            delete params.adLink;
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
        let {provinceMap, provinceId, userType, position, nativePages} = data;
        let provinceList = [];
        let provinceName;
        let receiverClass = '';
        let userTypeAllChecked = '', userTypeVipChecked = '', userTypeFreeChecked = '';
        for (let k in provinceMap) {
            provinceList.push({
                provinceId: k,
                provinceText: provinceMap[k]
            });
        }
        if (provinceId) {
            let arr = provinceId.split(';');
            let rs = [];
            arr.forEach((item) => {
                rs.push(provinceMap[item]);
            })
            provinceName = rs.join(';');
        }
   
        if (typeof userType === 'undefined') {
            //说明是新增，没有userType项，则默认选中全部用户
            userTypeAllChecked = 'checked';
            receiverClass = 'hide';

            data.nativePagesContainerHideClass = '';
            data.urlInputContainerHideClass = 'hide';
            data.appPageChecked = 'checked';
            data.activityPageChecked = '';
            data.skipIdHideClass = 'hide';
            data.nativePagesToShow = nativePages.filter(item => !item.isVipPage);
        } else {
            switch(userType) {
                case 0:
                    //若该项有值，说明是更新信息，且受众为免费用户，则不显示受众选项
                    receiverClass = 'hide';
                    userTypeFreeChecked = 'checked';
                    break;
                case 1:
                    //vip用户
                    userTypeVipChecked = 'checked';
                    break;
                case 2:
                    receiverClass = 'hide';
                    userTypeAllChecked = 'checked';
                    break;
            }

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

            if (userType != 1) {
                data.nativePagesToShow = nativePages.filter(item => !item.isVipPage);
            } else {
                data.nativePagesToShow = nativePages;                
            }
        }

        if (!position) {
            data.position = 0;
        }

        return {provinceList, provinceName, receiverClass, userTypeAllChecked, userTypeFreeChecked, userTypeVipChecked, ...data};
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

var PopupDialog = function(options = {}) {
    let {item = {}} = options;
    this.view = new View({...item});
    
    let that = this;
    this.dialog = new Dialog({
        title: '编辑首页弹窗',
        type: 4,
        content: that.view.el,
        ok: function() {
            let data = that.view.getData();
            if (data) {
                service[options.reqUrl](data, (response) => {
                    if (response.rs) {
                        alert('操作成功');
                        if (typeof options.onSuccess == 'function') {
                            options.onSuccess();
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

export {PopupDialog}
