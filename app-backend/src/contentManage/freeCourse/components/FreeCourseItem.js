import {AddFreeCourseItemView, AddFreeCourseItem, freeCourseList} from './AddFreeCourseItem';
import {service} from '../../../common/service';

var tpl = require('./FreeCourseItem.html');

var FreeCourseItem = Backbone.Model.extend({
    defaults: {

    }
});

//view
var FreeCourseItemView = Backbone.View.extend({
    tagName: 'tr',

    events: {
        'click .update': 'update',
        'click .delete': 'delete'
    },

    initialize: function() {

    },

    update: function() {
        var model = this.model.toJSON();
        model.operate = '更新';
        model.imgUrlPicValue = '更新';
        var addFreeCourseItem = new AddFreeCourseItem(model);
        var addFreeCourseItemView = new AddFreeCourseItemView({model: addFreeCourseItem});
        $('#courseContainer').hide();
        $('#addCourseContainer').html(addFreeCourseItemView.render().el).show();
        addFreeCourseItemView.initUploader();
    },

    delete: function() {
        var lessonName = this.model.get("lessonName");
        if (confirm('确定要删除' + lessonName + '吗？')) {
            var classId = this.model.get('classId');
            var classVideo = this.model.get('classVideo');
            var updater = 'hualuyao';

            var params = {
                classId: classId,
                classVideo: classVideo,
                updater: updater
            };

            var that = this;
            service.deleteFreeClass(params, function(response) {
                if (response.rs) {
                    alert('删除成功');
                    that.$el.remove();
                }
            })

        }
    },

    format(data) {
        var {lessonDate, beginTime} = data;
        lessonDate = lessonDate.split(' ')[0];
        data.beginTime = lessonDate + ' ' + beginTime;

        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        return this;
    }
});

export {FreeCourseItemView, FreeCourseItem}