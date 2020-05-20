import {Dialog} from '../../components/dialog/index';
import {service} from '../../common/service';
import {common} from '../../common/common';
import {Items} from './items/index';
import {ConfigActivityDialog} from './dialog/index';

require('datepicker/js/bootstrap-datetimepicker');

var template = require('./tpl.html');
var addTpl = require('./dialogTpl/add.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Activity = Backbone.View.extend({

    initialize: function() {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.getTodayMotto();
    },

    events: {
        'click #addActivityPic': 'addPic'
    },

    getTodayMotto() {
        var params = {
            userId: '',
            queryType: 'all',
            deleteFlag: 0
        };

        service.getTodayMotto(params, (response) => {
            if (response.rs) {
                var resultList = [];
                var data = response.resultMessage;
                for (var i = 0, len = data.length; i < len; i++) {
                    if (data[i].bannerType == 2) {  //1为一句话, 2为每日活动
                        resultList.push(data[i]);
                    }
                }

                this.model.set({resultList});
            }
        })
    },

    //新增
    addPic: function() {
        new ConfigActivityDialog({
            type: 'add',
            onSuccess: this.getTodayMotto.bind(this)
        });
        // var that = this;
        // service.getAllCollege({}, (response) => {
        //     if (response.rs) {
        //         let {resultMessage} = response;
        //         new Dialog({
        //           title: '新增首页活动',
        //           content: addTpl({collegeList: [...resultMessage]}),
        //           type: 2,
        //           hasUploadPicBtn: true,
        //           uploadArr: [
        //             {
        //               uploadPicBtnId: 'file',
        //               imgUrlHolder: 'bannerImage',
        //               fileNameHolder: 'fileName'
        //             }
        //           ],
        //           ok: function() {
        //             var params = common.getFormData({
        //               formId: 'form'
        //             });

        //             if ((!$('#college').val()) || ($('#checkAllColleges').is(':checked'))){
        //                 //不选默认为全部
        //                 params.college = 'ALL';
        //             } else {
        //                 //选择了部分学院
        //                 params.college = decodeURIComponent(params["college"]);  
        //             }

        //             //如果是免费用户和全部用户，删除学院项
        //             if (params.userType == '0' || params.userType == '2') {
        //                 delete params.college;
        //             }

        //             params.modifyTime = params.createTime = common.getTime();
        //             service.addTodayMotto(params, $.proxy(function(response) {
        //               if (response.rs) {
        //                 alert('添加成功！');
        //                 that.getTodayMotto.call(that);
        //                 this.closeDialog();
        //               } else {
        //                 alert('操作失败！');
        //               }
        //             }, this));
        //           }
        //         });

        //     } else {
        //         alert(response.rsdesp);
		// 	}
        // })
    },

    //添加一个到table中
    addPicItem: function(item) {
        var item = new ItemView({model: item});
        this.$('tbody').append(item.render().el);
    },

    render: function() {
        this.$el.html(template());
        var {resultList} = this.model.toJSON();
        new Items({el: this.$el.find('tbody')[0], resultList});
    }
})

export {Activity}
