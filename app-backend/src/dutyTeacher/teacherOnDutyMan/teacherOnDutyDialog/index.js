/**
 * @auth mod gushouchuang
 * @date 2017-12-28
 */
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
        // 如果是update 值班老师263置成只读
        if (options.type === 'update') {
            this.$el.find('#teacherAccount').attr('readonly', true).addClass('noedit')
        }
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
            //为了防止上传图片按钮绑定的事件失效，这里手动更新dom
            //而非重新render
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
            formId: 'dutyTeacherManageform'
        });

        //decode
        for (var k in params) {
            params[k] = decodeURIComponent(params[k]);
        }

        return params;
    },

    format(data) {
        let {
            type, collegeList = [], familyList = [], faqTypeList = [], 
            schoolName, familyName, teacherAccount, teacherName, classTeacherAccount, imgUrl, id
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

        return {collegeObjArr, familyObjArr, teacherAccount, teacherName, classTeacherAccount, imgUrl, id};
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

var TeacherOnDutyDialog = function(options = {}) {
    this.options = options;
    this.view = new View(options);
    this.show();
}

TeacherOnDutyDialog.prototype.show = function() {
    let {type} = this.options;
    let title = type === 'add' ? '新增值班老师账号' : '更新值班老师账号';
    let reqUrl = type === 'add' ? 'addOnDutyTeacher' : 'updateOnDutyTeacher';
    let that = this;
    this.d = new Dialog({
        title,
        content: this.view.$el,
        type: 4,
        hasUploadPicBtn: true,
        uploadArr: [
            {
                uploadPicBtnId: 'uploadPicBtn',
                imgUrlHolder: 'imgUrl',
                imgHolder: 'imgHolder'
            }
        ],
        ok: function() {
            //提交
            let params = that.view.getData();
            //参数校验
            let validateInfo = {
                'teacherAccount': '请填写用户263账号',
                'teacherName': '请填写值班老师名称',
                'schoolName': '请选择学院',
                'familyName': '请选择家族',
                'imgUrl': '请上传值班老师头像'
            }
            for (let k in validateInfo) {
                if (!params[k]) {
                    alert(validateInfo[k]);
                    return;
                }
            }

            if (params.teacherName.length > 18) {
                alert('老师名称不超过18个字！');
                return;
            }

            params.hasBind = params.classTeacherAccount ? 1 : 0

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

export {TeacherOnDutyDialog}
