import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';

const CHANNEL_CODE = 'CS_BACKGROUND';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.model.set(options);
        this.render();
        this.initCollegesAndFamiliesInfo();
    },

    events: {
        'change #schoolName': 'handleSchoolNameChange'
    },

    initCollegesAndFamiliesInfo() {
        Promise.all([
            this.getAllColleges(),
            this.getAllFamily()
        ]).then(values => {
            this.model.set({
                collegeList: values[0].resultMessage,
                familyList: values[1].resultMessage
            });
            //手动更新dom,而不是通过监听model的变化重新render，因为还有其他的input输入框
            this.updateSelectList();
        })
    },

    handleSchoolNameChange(e) {
        let schoolName = $(e.currentTarget).val();
        service.listFamilyByCollege({
            channelCode: CHANNEL_CODE,  //渠道码(pc端，android，ios，app后台分别为不同的值)
            schoolName
        }, (response) => {
            let resultList = response.resultMessage;
            this.model.set({
                familyList: resultList
            });

            this.updateSelectList();
        })

        this.model.set({schoolName});
    },

    updateSelectList() {
        let {collegeObjArr, familyObjArr} = this.format(this.model.toJSON());
        let collegeStr = '<option value="">请选择学院</option>', 
            familyStr = '<option value="">请选择家族</option>';

        for (let k1 in collegeObjArr) {
            collegeStr += `
                <option value="${collegeObjArr[k1].schoolName}" ${collegeObjArr[k1].selected}>
                    ${collegeObjArr[k1].schoolName}
                </option>
            `
        }
        for (let k2 in familyObjArr) {
            familyStr += `
                <option value="${familyObjArr[k2].familyName}" ${familyObjArr[k2].selected}>
                    ${familyObjArr[k2].familyName}
                </option>
            `
        }

        this.$el.find('#schoolName').html(collegeStr);
        this.$el.find('#familyName').html(familyStr);
    },

    //获取所有学院
    getAllColleges() {
        return new Promise((resolve, reject) => {
            service.listAllCollege({
                channelCode: CHANNEL_CODE
            }, (response) => {
                resolve(response);
            })
        })
    },

    //获取所有家族
    getAllFamily() {
        return new Promise((resolve, reject) => {
            service.listAllFamily({
                channelCode: CHANNEL_CODE
            }, (response) => {
                resolve(response);
            });  
        })
    },

    getData() {
        let params = common.getFormData({
            formId: 'form'
        });

        //decode
        for (var k in params) {
            params[k] = decodeURIComponent(params[k]);
        }

        return params;
    },

    format(data) {
        let {
            type, collegeList = [], familyList = [], id,
            schoolName, familyName, professional, welcomeMessage
        } = data;
        let collegeObjArr = [],
            familyObjArr = [];
        collegeList.forEach(item => {
            //将字符串转换为对象，因为要保存是否被选中状态
            let selected = item === schoolName ? 'selected' : '';
            collegeObjArr.push({
                schoolName: item,
                selected
            });
        });
        familyList.forEach(item => {
            let selected1 = item === familyName ? 'selected' : '';
            familyObjArr.push({
                familyName: item,
                selected: selected1
            })
        });

        //是否可以修改学院和专业
        let selectDisabled = type === 'add' ? '' : 'disabled';

        return {collegeObjArr, familyObjArr, professional, welcomeMessage, 
            selectDisabled, schoolName, familyName, id};
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

var WelcomeMessageDialog = function(options = {}) {
    this.options = options;
    this.view = new View(options);
    this.show();
}

WelcomeMessageDialog.prototype.show = function() {
    let {type} = this.options;
    let title = type === 'add' ? '新增欢迎语' : '更新欢迎语';
    let reqUrl = type === 'add' ? 'addWelcomeMessage' : 'updateWelcomeMessage';
    let that = this;
    this.d = new Dialog({
        title,
        content: this.view.$el,
        type: 4,
        ok: function() {
            //提交
            let params = that.view.getData();
            //参数校验
            let validateInfo = {
                'schoolName': '请选择学院',
                'familyName': '请选择家族',
                'professional': '请填写专业',
                'welcomeMessage': '请填写欢迎语'
            }
            for (let k in validateInfo) {
                if (!params[k]) {
                    alert(validateInfo[k]);
                    return;
                }
            }

            //长度校验
            let {professional, welcomeMessage} = params;
            if (professional.length > 15) {
                alert('专业不能超过15字！');
                return;
            }
            if (welcomeMessage.length > 100) {
                alert('欢迎语不能超过100字！');
                return;
            }

            service[reqUrl](params, (response) => {
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
    });
}

export {WelcomeMessageDialog}