import moment from 'moment';
import {service} from '../../common/service';
import {common} from '../../common/common';
import {Table} from '../../components/table/index';
import tpl from './tpl.html';

const Model = Backbone.Model.extend({
    defaults: {
        reqTime: '',
        resultList: undefined,
        modifyTime: ''
    }
});

const IMStat = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.renderTable);
        this.listenTo(this.model, 'change', this.renderModifyTime);
        this.render();
        this.getTeacherStatusList();
    },

    events: {
        'click #refreshBtn': 'getTeacherStatusList'
    },

    getTeacherStatusList() {
        service.getTeacherOffOrOnStatus({
            userAccount: common.getUserInfo().userAccount,
            requestImId: common.getUserInfo().imId
        }, response => {
            if (response.rs) {
                this.model.set({
                    resultList: response.resultMessage,
                    modifyTime: moment().format('YYYY-MM-DD HH:mm')
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    renderModifyTime() {
        const {modifyTime} = this.model.toJSON();
        this.$el.find('#modifyTimeContainer').html(modifyTime);
    },

    renderTable() {
        const {resultList = []} = this.model.toJSON();

        this.table && this.table.destroy();
        this.table = new Table({
            columns: [
                {
                    field: '老师263账号',
                    content: 'teacherAccount'
                }, {
                    field: '当前状态',
                    content: item => {
                        return item.status == 2 ? '<span class="red">离线</span>' : '在线'
                    },
                    escapeHtml: false
                }, {
                    field: 'im_user_id',
                    content: 'imId'
                }
            ],
            dataList: resultList
        });

        this.$el.find('#tableContainer').html(this.table.$el);
    },

    render() {
        this.$el.html(tpl());
    }
});

export {IMStat}
