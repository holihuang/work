import {AjaxUpload} from '../../../common/ajaxUpload/index';
import {common} from '../../../common/common';
import {FreeCourseItem} from './FreeCourseItem';

var tpl = require('./AddFreeCourseItem.html');

var FreeCourseList = Backbone.Collection.extend({
    url: 'community-sv-war/user/getHistoryFreeClass',
    model: FreeCourseItem
})

var freeCourseList = new FreeCourseList();

var AddFreeCourseItem = Backbone.Model.extend({
    initialize: function(){}
})

var AddFreeCourseItemView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },

    events: {
        //'click #submitBtn': 'submit'
    },

    initUploader: function() {
        common.picUploader({idName: 'friendsShareIconPic'}, function(file, response) {
            if (response.rs) {
                $('#friendsShareIcon').val(response.resultMessage[0].linkUrl);
                $('#fileName2').html(file);
                $('#friendsShareIconPic').val('更新');
                $('#friendsShareIconPic').removeClass('disabled');
                $('#previewShareImg').attr('src', response.resultMessage[0].linkUrl);
            } else {
                alert('上传图片失败！');
                $('#friendsShareIconPic').val('更新');
                $('#friendsShareIconPic').removeClass('disabled');
            }
        });

        // common.picUploader({idName: 'circleShareIconPic'}, function(file, response) {
        //     if (response.rs) {
        //         $('#circleShareIcon').val(response.resultMessage[0].linkUrl);
        //         $('#fileName3').html(file);
        //         $('#circleShareIconPic').val('更新');
        //         $('#circleShareIconPic').removeClass('disabled');
        //     } else {
        //         alert('图片上传失败！');
        //         $('#circleShareIconPic').val('更新');
        //         $('#circleShareIconPic').removeClass('disabled');
        //     }
        // });

        common.picUploader({idName: 'imgUrlPic'}, function(file, response) {
            if (response.rs) {
                $('#imgUrl').val(response.resultMessage[0].linkUrl);
                $('#fileName1').html(file);
                $('#imgUrlPic').val('更新');
                $('#imgUrlPic').removeClass('disabled');
                $('#previewCourseImg').attr('src', response.resultMessage[0].linkUrl);
            } else {
                alert('图片上传失败！');
                $('#imgUrlPic').val('更新');
                $('#imgUrlPic').removeClass('disabled');
            }
        })
    },

    format(data) {
        var {liveProvider, lessonDate} = data;

        data.ryeTeachChecked = liveProvider === 'rye-teach' ? 'checked' : '';
        data.genseeChecked = liveProvider === 'gensee' ? 'checked' : '';

        data.lessonDate = lessonDate && lessonDate.substr(0, 10);

        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        return this;
    }
})

export {AddFreeCourseItemView, AddFreeCourseItem,freeCourseList}