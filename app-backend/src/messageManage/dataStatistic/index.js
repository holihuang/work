import {service} from '../../common/service';
import {Pager} from '../../components/pager/index';
import {StatisticListItm} from './itm/index';

var tpl = require('./tpl.html');
var Model = Backbone.Model.extend({
	defaults:{
		userAccount:window.userInfo.userAccount,
		pageSize:10,
		pageNo:1,
		typeNum:0
	}
});

var DataStatistic = Backbone.View.extend({
	initialize:function(){
		this.model = new Model;
		var {pageSize, pageNo, typeNum, pageCount} = this.model.toJSON();
		
		//初始化后，getCountData获得的pageCount
		this.getCountData({pageSize, pageNo, typeNum});
		this.listenTo(this.model,'change:pageCount',()=>{
			var {pageSize, pageNo, pageCount} = this.model.toJSON();
			this.pager = new Pager({pageSize, pageNo, pageCount, onChange:this.getCountData.bind(this)});
			this.$el.find('#pagerContainer').html(this.pager.render().el);
		});
		this.listenTo(this.model,'change:typeNum',()=>{
			var {pageSize, pageNo, pageCount} = this.model.toJSON();
			this.pager = new Pager({pageSize, pageNo, pageCount, onChange:this.getCountData.bind(this)});
			this.$el.find('#pagerContainer').html(this.pager.render().el);
		});
		this.render();
	},

	events:{
		'click .tab-switch':'switchTab',
	},

	getCountData:function(options){
		//options: pageSize,pageNo,typeNum
		var {pageSize, pageNo} = options;
		var {userAccount, typeNum} = this.model.toJSON();
		var params = {
			userAccount,
			pageSize,
			pageNo,
			typeNum,
		};
		service.getStatisticData(params, (response)=>{
			var resultList = response.resultMessage.resultList;
			var pageCount = response.resultMessage.pageCount;

			this.statisticListItm = new StatisticListItm({...options, resultList});
			this.$el.find('tbody').remove();
			this.$el.find('table').append(this.statisticListItm.el);
			this.model.set({pageCount, pageSize});
		});
	},

	switchTab:function(event){
		var currentTarget = $(event.target);
		var typeNum = currentTarget.index();
		$('#tabSwitch').data('typeNum',typeNum);
		this.model.set({typeNum});
		var {pageSize, typeNum, pageCount} = this.model.toJSON();
		var params = {
			pageSize,
			pageNo:1,
			typeNum,
		};

		currentTarget.addClass('active').siblings('li').removeClass('active');
		this.getCountData(params);		
		this.pager = new Pager({pageSize, pageNo, pageCount, onChange:this.getCountData.bind(this)})
	},

	render:function(){
		this.$el.html(tpl(this.model.toJSON()));
		return this;
	}
});

export {DataStatistic}