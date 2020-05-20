import {common} from '../../common/common';
import {service} from '../../common/service';
import {Dialog} from '../../components/dialog/index';
import {Table} from '../../components/table/index'; 
import {Pager} from '../../components/pager/index';

import {IconAdminCreateDialog} from './iconAdminCreateDialog/index';
import {IconAdminUpdateDialog} from './iconAdminUpdateDialog/index';

import moment from 'moment';

const tpl = require('./tpl.html');

const PAGE_SIZE = 10;
const PAGE_NO = 1;

const Model = Backbone.Model.extend({
	defaults: {
		resultList: [],
		pageSize: PAGE_SIZE,
		pageNo: PAGE_NO
	}
})

const IconAdmin = Backbone.View.extend({
	initialize(options) {
		this.model = new Model();
		this.render();
		this.queryList({pageSize: PAGE_SIZE, pageNo: PAGE_NO});
	},

	events: {
		'click #searchBtn': 'queryList',
		'click #createNewIconDialog': 'createNewDialog',
		'click .updateIcon': 'updateDialog',
		'click .dele': 'deleteIcon',
		'click .offline': 'offlineIcon'
	},

	offlineIcon(e) {
		const index = $(e.currentTarget).attr('index');
		const { resultList, pageSize, pageNo } = this.model.toJSON();
		const { id } = resultList[index];
		const params = {
			id
		};
		const offlineTipStr = '该图标还未到达结束展示的时间，是否确认下线？该下线操作实际在第二天生效，即下线后的第二天该位置才会恢复系统默认图标。';
		if(confirm(`${offlineTipStr}`)) {
			service.adminUpdateIconStateById(params, (response) => {
				if(response.rs) {
					alert('下线成功！');
					this.queryList({ pageSize, pageNo });
				} else {
					alert(response.rsdesp);
				}
			}); 
		}
	},

	deleteIcon(e) {
		const index = $(e.currentTarget).attr('index');
		const { resultList, pageSize, pageNo } = this.model.toJSON();
		const { id } = resultList[index];
		const params = { 
			id
		};
		const deleteTipStr = '该图标还未到达开始展示时间，是否确认删除？删除后不可恢复！该删除操作实际上在第二天生效，即删除后的第二天，对该图标设置的开始时间才会变为无效状态。';
		if(confirm(`${deleteTipStr}`)) {
			service.deleteIconById(params, (response) => {
				if(response.rs) {
					alert('删除成功!');
					this.queryList({ pageSize, pageNo });
				} else {
					alert(response.rsdesp);
				}
			});
		}
		
	},

	createNewDialog() {

		this.iconCreateDialog = new IconAdminCreateDialog({

		});

		const that = this;

		this.addDialog = new Dialog({
			title: '新增变更图标',
			type: 4,
			content: this.iconCreateDialog.el,
			ok: function () {
				// 图标名称
				const buttonId = this.$el.find('#iconNameSlt option:selected').attr('buttonId');
				const buttonKey = this.$el.find('#iconNameSlt option:selected').attr('buttonKey');
				// 图片url
				let iconUrl, iconUrlOne, iconUrlTwo;
				if(this.$el.find('.form-line-icon--double').hasClass('hide')) {
					iconUrl = this.$el.find('.upload-icon-url').val().trim();
				} else {
					iconUrlOne = this.$el.find('.upload-icon-url--one').val().trim();
					iconUrlTwo = this.$el.find('.upload-icon-url--two').val().trim();
					iconUrl = `${iconUrlOne},${iconUrlTwo}`;
				}
				// 更新说明
				const updateDesc = this.$el.find('.updateDesc').val().trim()
				// 开始 结束时间
				const startTime = this.$el.find('#startTime').val().trim();
				const endTime = this.$el.find('#endTime').val().trim();
				const params = { buttonId, buttonKey, iconUrl, updateDesc, startTime, endTime };

				//校验
				// 图标名称
				if(!(!!buttonId)) {
					alert('请选择图标名称！');
					return;
				}
				// 图片
				if(this.$el.find('.form-line-icon--double').hasClass('hide')) {
					if(!(!!iconUrl)) {
						alert('请上传图标！');
						return;
					}
				} else {
					if(!(!!iconUrlOne) || !(!!iconUrlTwo)) {
						alert('请同时上传未点击和已点击状态的图标！');
						return;
					}
				}		

				// 更新说明
				if(!(!!updateDesc)) {
					alert('请输入更新说明！');
					return;
				}
				if(updateDesc.length > 30) {
					alert('更新说明的输入内容过长！');
					return;
				}
				// 开始时间
				if(!(!!startTime)) {
					alert('请选择开始时间！');
					return;
				}
				// 结束时间
				if(!(!!endTime)) {
					alert('请选择结束时间！');
					return;
				}
				// 开始结束时间逻辑校验
				if(moment(endTime).isBefore(startTime)) {
					alert('结束时间必须大于开始时间！');
					return;
				}
				if(moment(startTime).year() <= moment().year()) {
					if(moment(startTime).year() < moment().year()) {
						alert('开始时间不符合要求，最早只能设置为当前时间的第二天！');
						return;
					}
					if(moment(startTime).dayOfYear() - moment().dayOfYear() < 1) {
						alert('开始时间不符合要求，最早只能设置为当前时间的第二天！');
						return;
					}
				}
				
				service.adminAddIcon(params, (response) => {
					if(response.rs) {
						alert('新增成功');
						this.closeDialog();
						that.queryList({pageSize: PAGE_SIZE, pageNo: PAGE_NO});
					} else {
						alert(response.rsdesp);
					}
				})

			}
		});
	},

	queryList({ pageSize = PAGE_SIZE, pageNo = PAGE_NO } = options) {
		const { userAccount } = window.userInfo;
		const stateList = [];
		// 状态数组
		this.$el.find('input:checkbox:checked').each(function() {
			const idStr = $(this).prop('id');
			if(idStr == 'toDisplay') {
				stateList.push(0);
			} else if(idStr == 'displaying') {
				stateList.push(1);
			} else if(idStr == 'offline') {
				stateList.push(2);
			}
		});

		const params = { userAccount, pageSize, pageNo };
		stateList.length && Object.assign(params, { stateList });
		common.loading();
		service.adminGetIconList(params, (response) => {
			if(response.rs) {
				common.removeLoading();
				let { resultList = [], countPerPage, pageIndex, pageCount, totalCount } = response.resultMessage;
				resultList = this.formatList(resultList);
				this.model.set({ 
					resultList,
					pageSize: countPerPage, 
					pageNo: pageIndex,
					pageCount,
					totalCount
				});
				// 列表
				this.renderTable();
				// pager
				this.renderPager();
			} else {
				alert(response.rsdesp)
			}
		})
	},

	updateDialog(e) {
		const index =  $(e.currentTarget).attr('index');
		const { resultList, pageNo, pageSize } = this.model.toJSON();
		const itm = resultList[index];
		const that = this;
		this.iconUpdateDialog = new IconAdminUpdateDialog({
			...itm
		});
		this.updateDialog = new Dialog({
			title: '更新图标',
			type: 4,
			content: this.iconUpdateDialog.el,
			ok: function() {

				const { showtwoimg } = this.$el.find('#iconNameSlt option:selected').data();
				// 图标id
				const { id } = itm; 
				// 图标名称
				const buttonId = this.$el.find('#iconNameSlt option:selected').attr('buttonId');
				const buttonKey = this.$el.find('#iconNameSlt option:selected').attr('buttonKey');

				// 图片url
				let iconUrl, iconUrlOne, iconUrlTwo;
				if(!showtwoimg) {
					iconUrl = this.$el.find('.upload-icon-url').val().trim();
				} else {
					iconUrlOne = this.$el.find('.upload-icon-url--one').val().trim();
					iconUrlTwo = this.$el.find('.upload-icon-url--two').val().trim();
					iconUrl = `${iconUrlOne},${iconUrlTwo}`;
				}
				// 更新说明
				const updateDesc = this.$el.find('.updateDesc').val().trim()
				// 开始 结束时间
				const startTime = this.$el.find('#startTime').val().trim();
				const endTime = this.$el.find('#endTime').val().trim();
				const params = { id, buttonId, buttonKey, iconUrl, updateDesc, startTime, endTime };

				//校验
				// 图标名称
				if(!(!!buttonId)) {
					alert('请选择图标名称！');
					return;
				}
				// 图片
				if(!showtwoimg) {
					if(!(!!iconUrl)) {
						alert('请上传图标！');
						return;
					}
				} else {
					if(!(!!iconUrlOne) || !(!!iconUrlTwo)) {
						alert('请同时上传未点击和已点击状态的图标！');
						return;
					}
				}		

				// 更新说明
				if(!(!!updateDesc)) {
					alert('请输入更新说明！');
					return;
				}
				if(updateDesc.length > 30) {
					alert('更新说明的输入内容过长！');
					return;
				}
				// 开始时间
				if(!(!!startTime)) {
					alert('请选择开始时间！');
					return;
				}
				// 结束时间
				if(!(!!endTime)) {
					alert('请选择结束时间！');
					return;
				}
				// 开始结束时间逻辑校验
				if(moment(endTime).isBefore(startTime)) {
					alert('结束时间必须大于开始时间！');
					return;
				}
				if(moment(startTime).year() <= moment().year()) {
					if(moment(startTime).year() < moment().year()) {
						alert('开始时间不符合要求，最早只能设置为当前时间的第二天！');
						return;
					}
					if(moment(startTime).dayOfYear() - moment().dayOfYear() < 1) {
						alert('开始时间不符合要求，最早只能设置为当前时间的第二天！');
						return;
					}
				}
				
				service.adminUpdateIcon(params, (response) => {
					if(response.rs) {
						alert('更新成功');
						this.closeDialog();
						that.queryList({ pageNo, pageSize });
					} else {
						alert(response.rsdesp);
					}
				})
			}
		});
	},

	formatList(list) {
		list.forEach((item, index) => {
			const { state, iconUrl } = item;
			if(state == 0) {
				item.stateText = '待展示';
			} else if(state == 1) {
				item.stateText = '展示中';
			} else if(state == 2) {
				item.stateText = '已下线';
			}
			// 两幅图片并排，显示第一副
			if(iconUrl.includes(',')) {
				item.iconUrl = iconUrl.split(',')[0];
				item.iconUrlFlex = iconUrl.split(',')[1]
			}
		})
		return list;
	},

	renderTable() {
		const { resultList } = this.model.toJSON();
		this.table = new Table({
			columns: [{
				field: '图标缩略图',
				escapeHtml: false,
				content(item, index) {
					return `<img style="width: 40px; height: 40px;" src="${item.iconUrl}">`
				}
			}, {
				field: '图标名称',
				content: 'name'
			}, {
				field: '更新说明',
				content: 'updateDesc'
			}, {
				field: '开始时间',
				content: 'startTime'
			}, {
				field: '结束时间',
				content: 'endTime'
			}, {
				field: '创建人',
				content: 'creater'
			}, {
				field: '创建时间',
				content: 'createTime'
			}, {
				field: '最近一次操作人',
				content: 'updater'
			}, {
				field: '最近一次操作时间',
				content: 'updateTime'
			}, {
				field: '展示状态',
				content: 'stateText'
			}, {
				field: '操作',
				escapeHtml: false,
				content(item, index) {
					const { state } = item;
					let str;
					if(state == 0) {
						str = `<span class="orange updateIcon" index="${index}">更新</span>|<span class="orange dele" index="${index}">删除</span>`;
					} else if(state == 1) {
						str = `<span class="orange updateIcon" index="${index}">更新</span>|<span class="orange offline" index="${index}">下线</span>`;
					} else if(state == 2) {
						str = '--';
					}
					return str;
				}
			}],
			dataList: resultList
		});
		this.$el.find("#tableContainer").html(this.table.$el);
	},

	renderPager() {
		const { pageSize, pageNo, pageCount, totalCount } = this.model.toJSON();
		this.pager && this.pager.undelegateEvents();
		this.pager = new Pager({
			el: this.$el.find('#pagerContainer')[0],
			onChange: this.queryList.bind(this),
			pageSize,
			pageNo,
			pageCount,
			totalCount
		});
	},

	format(data) {
		return data;
	},

	render() {
		const data = this.format(this.model.toJSON());
		this.$el.html(tpl(data));
	}
})

export { IconAdmin }
