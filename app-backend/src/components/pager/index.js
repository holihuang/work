/*
**@showCountTip:查询结果提示，
**默认false；
*/

var tpl = require('./tpl.html');

const MAX_PAGE = 10;
var Model = Backbone.Model.extend({
	defaults: {
		showCountTip: false,
		optionsList: [
			{
				value: 10,
				optionsChecked: '',
				valueText: '10'
			},
			{
				value: 25,
				optionsChecked: '',
				valueText: '25'
			},
			{
				value: 50,
				optionsChecked: '',
				valueText: '50'
			}
		]
	}
});

var Pager = Backbone.View.extend({
	initialize:function(options){
		var {pageSize, pageNo, pageCount, totalCount, showCountTip, optionsList} = options;
		this.model = new Model();
		
		optionsList && this.model.set({optionsList});
		showCountTip && this.model.set({showCountTip});

		this.listenTo(this.model, "change:pageNo", this.render);
		this.listenTo(this.model, "change:pageList", this.render);
		this.listenTo(this.model, "change:totalCount", this.render);
		// this.listenTo(this.model, "change:goToBtnStatus", this.renderGoToBtn);
		this.model.set({pageNo, pageSize, pageCount, totalCount});
		this.firstPage();
		if(typeof options.onChange == 'function'){
			this.listenTo(this.model, 'change', () => {
				var {pageSize, pageNo} = this.model.toJSON();
				options.onChange.call(this, {...options, pageSize, pageNo});
			})
		}
	},

	events:{
		'change #changePageSize':'changePageSize',
		'click .page-indicator':'goToPage',
		'click #prevPage':'prevPage',
		'click #nextPage':'nextPage',
		'click .active-goto-btn':'goToCertainPage',
		'input #pageNo':'checkInput'
	},

	changePageSize:function(event){
		var currentTarget = $(event.target)
		var {pageNo, pageSize, pageCount} = this.model.toJSON();
		var pageList = [], pageNo = 1;
		var pageNums = Math.min(pageCount, MAX_PAGE);
		
		for(var i = 1; i<= pageNums; i++){
			pageList.push({pageNo: i, pageNoText:i});
		}

		this.model.set({pageSize:parseInt(currentTarget.val()), pageList, pageNo:1});
	},

	goToPage:function(event){
		var currentTarget = $(event.target);
		var pageNo = parseInt(currentTarget.parent('li').attr('pageNo'));

		currentTarget.parent('li').addClass('page-active').siblings().removeClass('page-active');
		this.model.set({pageNo});
	},

	firstPage:function(){
		var {pageNo, pageSize, pageCount} = this.model.toJSON();
		pageNo = pageNo || 1;  //默认为第一页
		var pageList = [];
		if (pageNo <= MAX_PAGE) {
			var pageNums = Math.min(pageCount, MAX_PAGE);
			for(let i = 1; i<= pageNums; i++){
				pageList.push({pageNo: i, pageNoText:i});
			}
		} else {
			var pageNums = MAX_PAGE;
			while(pageNums) {
				pageList.push({pageNo: pageNo, pageNoText: pageNo});
				pageNo--;
				pageNums--;
			}
			pageList.reverse();
		}
		this.model.set({pageList});
	},

	prevPage:function(){
		var {pageNo, pageCount, pageList} = this.model.toJSON();
		pageNo--;
		if(pageList[0].pageNo > pageNo){
			pageList.reverse().shift();
			pageList.reverse().unshift({pageNo, pageNoText: pageNo})
		}
		this.model.set({pageNo, pageCount, pageList})
	},

	nextPage:function(){
		var {pageNo, pageCount, pageList} = this.model.toJSON();
		pageNo++;
		if(pageList[pageList.length-1].pageNo < pageNo){
			pageList.shift();
			pageList.push({pageNo, pageNoText:pageNo});
		}
		this.model.set({pageNo, pageCount, pageList});

	},

	goToCertainPage:function(){
		var {pageList} = this.model.toJSON();
		var pageNo = parseInt(this.$el.find('#pageNo').val());
		var theLastPageNo = pageList[pageList.length-1].pageNo;//获取当前分页的最后一页页码
		var theFirstPageNo = pageList[0].pageNo;
		if(pageNo > theLastPageNo){
			for(var i = pageNo; i >=1 && pageNo -i<MAX_PAGE; i--){
				pageList.shift();
				pageList.push({pageNo: i, pageNoText: i});
			}
			pageList.reverse();
		}else if(pageNo < theFirstPageNo){
			for(var i=0; i< MAX_PAGE; i++){
				pageList.shift();
				pageList.push({pageNo: pageNo + i, pageNoText: pageNo + i})
			}
		}
		this.model.set({pageNo, pageList});
	},

	checkInput:function(){
		var val = this.$el.find('#pageNo').val();
		var pageCount = this.model.get('pageCount');
		if(val>0 && val<=pageCount){
			this.$el.find('.go').removeClass('go-unable').addClass('active-goto-btn');
			// this.model.set({goToBtnStatus:'active-goto-btn'});
			return true;
		} else {
			if(val){
				alert('请输入1到' + pageCount + '之间的数字！');
				this.$el.find('#pageNo').val('');
				this.$el.find('.go').removeClass('active-goto-btn').addClass('go-unable');
				// this.model.set({goToBtnStatus:'go-unable'});
				return false;
			}
		}
	},

	renderGoToBtn:function(){
		var {goToBtnStatus} = this.model.toJSON();
		if(goToBtnStatus == 'active-goto-btn'){
			this.$el.find('.go').removeClass('go-unable').addClass('active-goto-btn');
		}else {
			this.$el.find('.go').removeClass('active-goto-btn').addClass('go-unable');
		}
		return false;
	},
	
	format:function(data){
		var {pageNo, pageSize, pageList, pageCount, totalCount} = data;
		data.hasPrevious = pageNo >1;
		data.hasNext = pageNo < pageCount;

		data.optionsList.forEach((item, index) => {
			let value = item.value;
			if (value == pageSize) {
				item.optionsChecked = 'selected';
			} else {
				item.optionsChecked = '';
			}
		})

		if(pageList){
			pageList.forEach(item => {
				item.pageClass = item.pageNo == pageNo?'page-active':'';
			});
		}
		data.totalCountText = `共${totalCount}条查询结果`;

		return {data}
	},

	render:function(){
		this.model.set({goToBtnStatus:'goto-unable'});
		var data = this.format(this.model.toJSON());

		this.$el.html(tpl(data));
		return this;
	}
});

export {Pager}