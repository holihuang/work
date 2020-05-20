/**
 * @auth mod gushouchuang
 * @date 2017-12-28
 */

import _ from 'lodash'

import {service} from '../../../common/service'

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        hasBind: 2
    }
});

//渠道码，用于区分请求来源（app后台，还是android、ios等等）
const CHANNEL_CODE = 'CS_BACKGROUND';

var Search = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.render();
        this.initCollegesAndFamiliesInfo();
    },

    events: {
        'change #schoolName': 'handleSchoolNameChange',
        'change #familyName': 'handleFamilyNameChange',
        'change #teacherAccount': 'handleFaqTypeNameChange',
        'change #hasBind': 'handleHasBindChange',
        'change #classTeacherAccount': 'handleClassTeacherAccountChange',
    },

    //选择学院后，家族要联动，只显示该学院下的家族
    handleSchoolNameChange(e) {
        let schoolName = $(e.currentTarget).val();
        service.listFamilyByCollege({
            channelCode: CHANNEL_CODE,  //渠道码(pc端，android，ios，app后台分别为不同的值)
            schoolName
        }, (response) => {
            let resultList = response.resultMessage;
            this.model.set({
                familyList: resultList,
                familyName: ''  //重置家族名称
            });
        })

        this.model.set({schoolName});
    },

    handleFamilyNameChange(e) {
        let familyName = $(e.currentTarget).val();
        this.model.set({familyName});
    },

    handleFaqTypeNameChange(e) {
        let faqTypeName = $(e.currentTarget).val();
        this.model.set({faqTypeName});
    },

    handleHasBindChange(e) {
        let hasBind = +$(e.currentTarget).val();
        this.model.set({hasBind});
    },

    handleClassTeacherAccountChange(e) {
        let classTeacherAccount = $(e.currentTarget).val();
        this.model.set({classTeacherAccount});
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
        })
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

    getSearchParams() {
        const state = this.model.toJSON()
        const params = {
            ..._.pick(state, 
                'schoolName', 'familyName', 'hasBind', 'classTeacherAccount'
            ),
            channelCode: CHANNEL_CODE,
            teacherAccount: state.faqTypeName,
        }

        const trimKey = ['classTeacherAccount', 'teacherAccount']
        trimKey.forEach(item => {
            if (params[item]) {
                if (params[item].trim()) {
                    params[item]  = params[item].trim()
                }
                else {
                    delete params[item]
                }
            }
        })
        return params
    },

    format(data) {
        const bindOptions = [{
            label: '是',
            value: 1,
        },
        {
            label: '否',
            value: 0,
        }]

        let {
            collegeList = [], 
            familyList = [], 
            schoolName, familyName,
            hasBind, 
            classTeacherAccount,
            faqTypeName,
        } = data;

        let collegeObjArr = [],
            familyObjArr = [];

        bindOptions.forEach(item => {
            if (item.value === hasBind) {
                item.selected = 'selected'
            }
        })
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

        return {collegeObjArr, familyObjArr, bindOptions, classTeacherAccount, faqTypeName};
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Search}