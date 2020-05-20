import {chatInfoModelUtil} from '../../chatInfo';
import tpl from './tpl.html';

const HeadMaster = Backbone.View.extend({
    initialize(options) {
        this.listenTo(chatInfoModelUtil.model, 'change:teacherStatus', this.render);
        this.render();
    },

    render() {
        const data = chatInfoModelUtil.getTeacherStatusInfo();
        this.$el.html(tpl(data));
    }
})

export {HeadMaster}
