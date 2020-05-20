import {ItemModel, ItemView, courseList} from './item/index';
import {DialogModel, DialogView} from './addCourseDialog/index';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import {Dialog} from '../../../../components/dialog/index';

var tpl = require('./tpl.html');

//model
var RecommendCourseModel = Backbone.Model.extend({
    defaults: {},
    initialize: function() {

    }
})

//view
var RecommendCourseView = Backbone.View.extend({

    initialize: function() {
        this.render();
        var that = this;
        var courseId = this.model.get("courseId");
        var params = {
            courseId: courseId
        };

        var formData = new FormData();
        formData.append('data', JSON.stringify(params));
        courseList.reset();

        service.getCoursePackageByCourseId(params, function(response) {
            that.listenTo(courseList, 'add', that.addCourseItem);
            var data = response.resultMessage;
            for (var i = 0, len = data.length; i < len; i++) {
                courseList.add(new ItemModel(data[i]));
            }
        })
    },

    events: {
        'click #addRecommendCourse': 'addRecommendCourse'
    },

    addRecommendCourse: function() {
        var courseId = this.model.get('courseId');
        var model = new DialogModel({courseId, courseId});
        var view = new DialogView({model: model});
        
        var d = new Dialog({
            title: '新增推荐课程',
            type: 3,
            content: view.render().el,
            ok: function() {
                var params = common.getFormData({formId: 'form'});

                var courseId = this.model.get('courseId');
                params['courseId'] = courseId;

                var packageLink = params['packageLink'];
                //var reg = '^((https|http|ftp|rtsp|mms)?://)' + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?';
                if (packageLink.indexOf('http') == -1) {
                    alert('请输入以http或者https开头的正确的url格式');
                    return;
                }

                service.insertCoursePackage(params, $.proxy(function(response) {
                    if (response.rs) {
                        for (var k in params) {
                            params[k] = decodeURIComponent(params[k]);
                        }
                        var model = new ItemModel(dataObj);
                        courseList.add(model);
                        alert('操作成功');
                        this.closeDialog();
                    } else {
                        alert('操作失败')
                    }
                }, this));
            }
        })
  
        view.initUploader();
    },

    render: function() {
        this.$el.html(tpl(this.model.toJSON()));
        return this;
    },

    addCourseItem: function(model) {
        var item = new ItemView({model: model});
        this.$('tbody').append(item.render().el);
    }
})

export {RecommendCourseView, RecommendCourseModel}