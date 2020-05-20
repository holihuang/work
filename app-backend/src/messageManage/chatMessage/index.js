import {Table} from '../../components/table/index';
import {Pager} from '../../components/pager/index';
import {Dialog} from '../../components/dialog/index';
import {service} from '../../common/service';
import {common} from '../../common/common';
import {CheckDialog} from './checkDialog/index';


const tpl = require("./index.html");


const Model = Backbone.Model.extend({
	defaults: {
		resultList: [],
		chatMessageList: [],
		identity: ''
	}
}); 

const HistoryMessage = Backbone.View.extend({
	initialize(options) {
		this.model = new Model();
		// this.listenTo(this.model, "change:resultList", this.renderTable);
		this.render();
		//区分班主任，值班老师
		this.teacherOrDutyteacher();
	},

	events: {
		'click #searchBtn': 'getQueryList',
		'click .check': 'checkDialog'
	},

	teacherOrDutyteacher() {
		const hashStr = window.location.hash;
		const identity = hashStr == '#dutyTeacherHistory' ? '3' : '2';
		this.model.set({ identity });
	},

	getQueryList() {
		const { identity } = this.model.toJSON();
		const params = common.getFormData({'formId': 'form'});
		Object.assign(params, { identity });
		// form表单校验
		const { userId, userName } = params;
		if(!userId && !userName) {
			alert('请输入学员id或姓名');
			return;
		}

		// if(mobile && mobile.length < 9) {
		// 	alert('请至少输入9位手机号！');
		// 	return;
		// }

		common.loading();
		service.getTeacherByCondition(params, (response) => {
			common.removeLoading();
			if(response.rs) {
				let list = response.resultMessage;

				list = this.convertListToDisplayList(list);
				this.model.set({
					resultList: list
				});
				this.renderTable();
			} else {
				alert(response.rsdesp);
			}
		})	
	},

	convertListToDisplayList(resList) {
		const arr = [];
		resList && resList.length && resList.forEach((item, index) => {
			if(item.list.length) {
				const prepareItem = {
					...item,
				}
				// 怕后端返回的数据里带着脏数据，过滤一层。
				prepareItem.list = prepareItem.list.filter(cItem => cItem.teacherAccount)

				arr.push(prepareItem);
			}
		})

		return arr;
	},

	renderTable() {
		const { resultList = [] } = this.model.toJSON();
		this.table = new Table({
			columns: [
				{
					field: '学员id',
                    content: 'userId'
				}, {
					field: '姓名',
					content: 'userName'
				}, {
					field: '老师',
					escapeHtml: false,
					content: (item, index) => {
						const { list = [] } = item;
						const arr = list.map((itm, idx) => {
							return `<div class="td-innner-itms">${itm.teacherAccount}</div>`
						})
						return arr.join('');
					}
				}, {
					field: '聊天记录',
					escapeHtml: false,
					content: (item, index) => {
						const { list = [] } = item;
						const arr = list.map((itm, idx) => {
							return `<div class='check orange' index='${index}' idx='${idx}' style="margin:0 auto; width: 30px;line-height:20px;">查看</div>` 
						})
						return arr.join('');
					}
				}
			],
			dataList: resultList
		});
		this.$el.find("#tableWrapper").html(this.table.$el);
	},


	checkDialog(e) {
		const index = $(e.currentTarget).attr('index');
		const idx = $(e.currentTarget).attr('idx');
		const that = this;
		const { resultList } = this.model.toJSON();
		const { imUserId } = resultList[index];
		const { teacherImId, orderDetailId } = resultList[index].list[idx];

		const params = { studentImId: imUserId, teacherImId, orderDetailId };

		this.showChatMessageListDialog(params);
	},

	showChatMessageListDialog(params) {
		this.checkDilog && this.checkDialog.undelegateEvents();
		this.$el.find('#checkChatRecord').off();
		this.checkDialog = new CheckDialog({
			params
		});

		this.dialog = new Dialog({
			title: '聊天记录',
			type: 4,
			content: this.checkDialog.el,
			showFooter: false,
		});
	},

	format(data) {
		return data;
	},

	render() {
		const data = this.format(this.model.toJSON());
		this.$el.html(tpl(data));
	}
});
export { HistoryMessage }