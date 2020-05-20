import {service} from '../../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

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
        'change #faqTypeName': 'handleFaqTypeNameChange'
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
        let {schoolName, familyName} = this.model.toJSON();
        let teacherAccount = this.$el.find('#teacherAccount').val();
        return {
            schoolName,
            familyName,
            teacherAccount
        }
    },

    format(data) {
        let {collegeList = [], familyList = [], schoolName, familyName} = data;
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

        return {collegeObjArr, familyObjArr};
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Search}