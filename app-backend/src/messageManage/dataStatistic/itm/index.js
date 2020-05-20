import {service} from '../../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
	defaults:{
		
	}
});

var StatisticListItm = Backbone.View.extend({
	tagName:'tbody',

	initialize:function(options){
		//options pageSize, pageNo, typeNum
		var {pageSize, pageNo, typeNum, resultList} = options;
		this.model = new Model();
		this.listenTo(this.model,'change',this.render);
		this.model.set({pageSize, pageNo, typeNum, resultList});
		
		// if(typeof options.onChange == 'function'){
		// 	var pageNo = this.model.get('pageNo');
		// 	options.onChange.call(this, {...options})
		// }
	},
	
	render:function(){
		this.$el.html(tpl(this.model.toJSON()));
		return this;
	}
});

export{StatisticListItm}