import {AddFreeCourseItemView, AddFreeCourseItem, freeCourseList} from './components/AddFreeCourseItem';
import {FreeCourseItem, FreeCourseItemView} from './components/FreeCourseItem';
import {service} from '../../common/service';
import {common} from '../../common/common';

var template = require('./tpl.html');
var showFreeCourseListTemplate = require('./components/ShowFreeCourseList.html');

var FreeCourse = Backbone.View.extend({
    initialize: function() {
        this.render();
        var that = this;

        service.getAllFreeClass({}, function(response) {
            if (response.rs) {
                var data = response.resultMessage;
                that.listenTo(freeCourseList, 'add', that.addFreeCourseItem);
                for(var i = 0, len = data.length; i < len; i++) {
                    var item = data[i];
                    var freeCourseItem = new FreeCourseItem(item);
                    freeCourseList.add(freeCourseItem);
                }
            }
        })
    },
    events: {
        'click #addFreeCourse': 'addFreeCourse',   //显示弹窗
        'click #submitBtn': 'addFreeCourseSubmit',  //添加免费课
        'click #cancelBtn': 'cancelAddCourse'  //取消添加免费课
    },
    addFreeCourseSubmit: function() {
        var params = common.getFormData({formId: 'form'});
        //朋友圈分享与好友分享相同
        params['circleShareIcon'] = params['friendsShareIcon'];
        params['circleShareSubject'] = params['friendsShareSubject'];

        var that = this;

        var url = '';
        if (params.classId) { //更新

            service.updateFreeClass(params, function(response) {
                var classId = params.classId;
                alert('更新成功！');
                that.cancelAddCourse();
            });
        } else { //新增

            service.configureFreeClass(params, function(response) {
                if (response.rs) {
                    for (var k in params) {
                        params[k] = decodeURIComponent(params[k]);
                    }

                    var model = new FreeCourseItem(params);
                    freeCourseList.add(model);

                    alert('新增成功！');

                    that.cancelAddCourse();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },
    cancelAddCourse: function() {
        this.$('#addCourseContainer').hide();
        this.$('#courseContainer').show();
    },
    //添加到table中
    addFreeCourseItem: function(item) {
        var freeCourseItemView = new FreeCourseItemView({model: item});
        this.$('tbody').append(freeCourseItemView.render().el);
    },
    addFreeCourse: function() {
        var addFreeCourseItem = new AddFreeCourseItem({operate: '新增', imgUrlPicValue: '上传'});
        var addFreeCourseItemView = new AddFreeCourseItemView({model: addFreeCourseItem});
        this.$('#courseContainer').hide();
        this.$('#addCourseContainer').html(addFreeCourseItemView.render().el).show();
        addFreeCourseItemView.initUploader();
    },
    render: function() {
        this.$el.html(template());
        this.$('#courseContainer').html(showFreeCourseListTemplate());
    }
})

export {FreeCourse};