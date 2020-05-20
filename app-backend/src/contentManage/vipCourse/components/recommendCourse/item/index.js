import {service} from '../../../../../common/service';

var tpl = require('./tpl.html');

//model
var ItemModel = Backbone.Model.extend({
    initialize: function() {

    }
})

//collection
var CourseList = Backbone.Collection.extend({
    url: '/community-sv-war/course/getCoursePackageByCourseId',
    model: ItemModel
})

var courseList = new CourseList();

//view
var ItemView = Backbone.View.extend({
    tagName: 'tr',

    initialize: function() {
        this.render();
    },

    events: {
        'click .update': 'update',
        'click .delete': 'delete'
    },

    update: function() {
        alert('update');
    },

    delete: function() {
        alert('delete');
        var packageId = this.model.get('packageId');
        var params = {
            packageId: packageId
        };
        var packageName = this.model.get('packageName');

        if (confirm('确定要删除' + packageName + '吗？')) {
            var that = this;
            service.deleteCoursePackage(params, function(response) {
                if (response.rs) {
                    that.$el.remove();
                    alert('删除成功！');
                }
            })
        }
    },

    render: function() {
        this.$el.html(tpl(this.model.toJSON()));
        return this;
    }
})

export {ItemModel, ItemView, courseList}