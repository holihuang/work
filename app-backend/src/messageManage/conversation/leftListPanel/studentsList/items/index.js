import {envCfg} from '../../../../../common/envCfg';
import tpl from './tpl.html';

const failedList = {}

const Items = Backbone.View.extend({
    initialize(options) {
        const {studentList, orderDetailId} = options;
        this.studentList = studentList;
        this.orderDetailId = orderDetailId;
        this.render();
    },

    destroy() {
        this.$el.find('.error').each(function() {
            const studentId = $(this).attr('studentid');
            failedList[studentId] = true;
        })

        this.remove();
    },

    format(data) {
        const {studentList = [], orderDetailId} = data;
        
        studentList.forEach((item, index) => {
            item.index = index;
            item.activeClass = item.orderDetailId == orderDetailId ? 'current-checked-item' : '';
            item.avatar = `${envCfg.imgBaseUrl}${item.studentId}/${item.studentId}.jpg`;
            item.loadFailed = failedList[item.studentId];
        });

        return data;
    },

    render() {
        const data = this.format({
            studentList: JSON.parse(JSON.stringify(this.studentList)),
            orderDetailId: this.orderDetailId
        });

        this.$el.html(tpl(data));
    }
});

export {Items}
