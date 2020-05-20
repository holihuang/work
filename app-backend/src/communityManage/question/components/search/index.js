import 'datepicker/js/bootstrap-datetimepicker';
import {common} from '../../../../common/common';
import {service} from '../../../../common/service';
import {MultiSelectDialog} from '../../../../contentManage/opt/collegePage/multiSelectDialog/index';
import tpl from './tpl.html';

const DATEPICKER_CFG = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
    minView: 'hour',
    endDate: new Date(),
    forceParse: true,
}

const state = [
    {
        value: 0,
        text: '正常'
    }, {
        value: 1,
        text: '已删除'
    }, {
        value: 2,
        text: '已屏蔽'
    }
]

const Model = Backbone.Model.extend({
    defaults: {
        type: 1, //1-问题，2-回答
    }
});

const Search = Backbone.View.extend({
    initialize(options) {
        const {type} = options;
        this.model = new Model();
        this.model.set({type});
        this.render();
        this.listAllCollege();
    },

    events: {
        'click #beginTime': 'showBeginTimeDatepicker',
        'click #endTime': 'showEndTimeDatepicker',
        'change #beginTime': 'clearEndTime',
        'click #corpsIpt': 'chooseCorps',
        'change #college': 'handleCollegeChange',
        'change [name="userType"]': 'handleUserTypeChange',
    },

    showBeginTimeDatepicker(e) {
        $(e.currentTarget).datetimepicker(DATEPICKER_CFG);
        $(e.currentTarget).datetimepicker('show');
    },

    showEndTimeDatepicker(e) {
        $(e.currentTarget).datetimepicker({
            startDate: this.$el.find('#beginTime').val(),
            ...DATEPICKER_CFG,
        });
        $(e.currentTarget).datetimepicker('show');
    },

    clearEndTime() {
        const startDate = this.$el.find('#beginTime').val();
        // this.$el.find('#endTime').val('').datetimepicker('setStartDate', startDate).datetimepicker(DATEPICKER_CFG);
        this.$el.find('#endTime').datetimepicker(DATEPICKER_CFG).datetimepicker('setStartDate', startDate).val('');
    },

    listAllCollege() {
        service.listAllCollege({}, (response) => {
            if (response.rs) {
                let rs = '<option value="">请选择学院</option>';
                const collegeList = response.resultMessage;
                collegeList.forEach(item => {
                    rs += `<option value="${item}">${item}</option>`;
                })

                this.$el.find('#college').html(rs);
            } else {
                alert(response.rsdesp);
            }
        })
    },

    chooseCorps(e) {
        const corps = $(e.currentTarget).val().trim();
        const checkedList = corps ? corps.split(',') : [];
        new MultiSelectDialog({
            title: '请选择军团',
            reqUrl: 'listAllCorps',
            name: 'corpsName',
            key: 'corpsName',
            checkedList: checkedList,
            callback: (checkedList) => {
                $(e.currentTarget).val(checkedList.join(','));
            }
        });
    },

    handleCollegeChange(e) {
        const college = $(e.currentTarget).val();

        service.listFamilyByCollege({
            schoolName: college
        }, (response) => {
            if (response.rs) {
                let rs = '<option value="">请选择家族</option>';

                const families = response.resultMessage;
                families.forEach(item => {
                    rs += `<option value="${item}">${item}</option>`;
                });

                this.$el.find('#family').html(rs);
            } else {
                alert(response.rsdesp);
            }
        })
    },

    handleUserTypeChange() {
        const userType = this.$el.find('[name="userType"]:checked').val();
        if (userType == 0) {
            this.$el.find('#corpsIpt').show();
        } else {
            this.$el.find('#corpsIpt').hide();
        }

        if (userType == 1) {
            this.$el.find('#collegeContainer').show();
        } else {
            this.$el.find('#collegeContainer').hide();
        }
    },

    getSearchParams() {
        const params = common.getFormData({
            formId: 'searchForm'
        });

        let data = params;
        //处理提问人和回答人信息
        const {type} = this.model.toJSON();
        if (type === 1) {
            //问题
            data[params.asker] = params.askerValue;
        } else {
            //回答
            data[params.answerer] = params.answererValue;
        }

        //手机号必须大于9位
        if (data.userMobile && data.userMobile.length < 9) {
            alert('手机号必须大于9位！');
            return;
        }

        const {questionId, answerId, userId} = data;
        if (questionId && (parseInt(questionId) != questionId)) {
            alert('问题编号请输入数字！');
            return;
        }
        if (answerId && (parseInt(answerId) != answerId)) {
            alert('回答编号请输入数字！');
            return;
        }
        if (userId && (parseInt(userId) != userId)) {
            alert('提问人id或回答人id请输入数字！');
            return;
        }
        
        //回答数量
        const {minAnswerCount, maxAnswerCount} = params;
        if ((minAnswerCount && (parseInt(minAnswerCount) != minAnswerCount)) || (
            maxAnswerCount && (parseInt(maxAnswerCount) != maxAnswerCount))) {
            alert('回答数量请输入数字！');
            return;
        }

        if (minAnswerCount && maxAnswerCount && (+minAnswerCount > +maxAnswerCount)) {
            alert('最少回答数量不能超过最大回答数量！');
            return;
        }

        //处理问题归属
        const userType = params.userType;
        switch(userType) {
            case '2': //全部
                delete data.family;
                delete data.college;
                delete data.corps;
                break;
            case '0': //前端
                //军团
                data.corps = params.corps;
                delete data.family;
                delete data.college;
                break;
            case '1': //后端
                let college = decodeURIComponent(params.college);
                if (!college) {
                    alert('请选择学院！');
                    return;
                }
                let family = decodeURIComponent(params.family) || 'ALL';
                data.family = {
                    [college]: [family]
                };
                delete data.corps;
                break;
            case '3': //无归属
                delete data.family;
                delete data.college;
                delete data.corps;
                break;
        }

        return data;
    },

    format(data) {
        const {type} = data;
        
        data.isQuestion = type === 1 ? true : false;

        data.state = state;

        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Search}
