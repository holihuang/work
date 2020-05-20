import {service} from '../../common/service';
import {common} from '../../common/common';
import {Dialog} from '../../components/dialog/index';
import {Items} from './items/index';
import {ConfigWordEveryDayDialog} from './dialog/index';

require('datepicker/js/bootstrap-datetimepicker');

var template = require('./tpl.html');
var addTpl = require('./dialogTpl/add.html');

var Model = Backbone.Model.extend({});

var WordEveryDay = Backbone.View.extend({

    initialize: function() {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.getTodayMotto();
    },

    events: {
        'click #addPic': 'addPic'
    },

    //新增
    addPic: function() {
        new ConfigWordEveryDayDialog({
            type: 'add',
            onSuccess: this.getTodayMotto.bind(this)
        })
        // var that = this;
        // var options = {
        //     title: '新增首页每日一句话',
        //     type: 2,
        //     content: addTpl(),
        //     hasUploadPicBtn: true,
        //     uploadArr: [
        //         {
        //             uploadPicBtnId: 'file',
        //             imgUrlHolder: 'bannerImage',
        //             fileNameHolder: 'fileName'
        //         }
        //     ],
        //     ok: function() {
        //         var createTime = common.getTime();
        //         var modifyTime = common.getTime();

        //         var params = common.getFormData({formId: 'form'});
        //         params['createTime'] = createTime;
        //         params['modifyTime'] = modifyTime;

        //         service.addTodayMotto(params, $.proxy(function(response) {
        //             if (response.rs) {
        //                 alert('新增成功！');
        //                 that.getTodayMotto.call(that);
        //                 this.closeDialog();
        //             } else {
        //                 alert('请求失败！');
        //             }
        //         }, this))
        //     }
        // }

        // var d = new Dialog(options);

        // //时间选择框
        // $('#startTime').datetimepicker({
        //     format: 'yyyy-mm-dd',
        //     autoclose: true,
        //     todayBtn: true,
        //     minView: 'month'
        // });

        // $('#startTime').on('click', function() {
        //     $('#startTime').datetimepicker('show');
        // })
    },

    getTodayMotto() {
        var params = {
            userId: '',
            queryType: 'all',
            deleteFlag: 0
        };

        service.getTodayMotto(params, (response) => {
            var data = response.resultMessage;
            var resultList = [];
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].bannerType == 1) {  //1为一句话
                    resultList.push(data[i]);
                }
            }

            this.model.set({resultList});
        })
    },

    render: function() {
        this.$el.html(template());
        var {resultList} = this.model.toJSON();
        new Items({el: this.$el.find('tbody')[0], resultList});
    }
})

export {WordEveryDay}