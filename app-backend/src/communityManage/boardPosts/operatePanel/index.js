import {Items} from '../items/index';
import {PostSlaveItems} from '../postSlaveItems/index';


var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
	    defaults: {
			userRole: window.userInfo.userRole,
			flag_batchOperate: '1',              //1：‘可点击’ 0：“不可点击”
			flag_batchOperateList: '0',           //1: '可点击' 0：“不可点击”
			flag_isCheckBoxTitleShow: ''          //flag_isCheckBoxTitleShow=true,复选框title显示
		}
});

var OperatePanel = Backbone.View.extend({
    
    id: 'batchOperateList',

	initialize: function(options) {
	    this.model = new Model();
	    this.options = options;
	    var {postType} = options;
	    this.model.set({postType});
	    this.render();
	    this.listenTo(this.model, 'change', this.render);
	},

	events: {
		'click .batch-operate-enlighten': 'boEnlighten',
		'click .batch-operate-shieldHostPosts': 'boShieldHostPosts',
		'click .batch-operate-deleteHostPosts': 'boDeleteHostPosts',
		'click .batch-operate-migrate': 'boMigrate',
		'click .batch-operate-recoverHostPosts': 'boRecoverHostPosts',
		'click .batch-operate-recoverShieldPosts': 'boRecoverShieldPosts',
		'click .batch-operate-refusePosts': 'boRefusePosts',
		'click .batch-operate-agreePosts': 'boAgreePosts',
		'click .batch-operate-shieldReplyPosts': 'boShieldReplyPosts',
		'click .batch-operate-deleteReplyPosts': 'boDeleteReplyPosts',
		'click .batch-operate-recoveryShieldReplyPosts': 'boRecoveryShieldReplyPosts',
		'click .batch-operate-recoveryDeleteReplyPosts': 'boRecoveryDeleteReplyPosts',
		'click .batch-operate-refuseReplyPosts': 'boRefuseReplyPosts',
		'click .batch-operate-agreeReplyPosts': 'boAgreeReplyPosts',
		'click .batch-set-topic': 'batchSetTopic'
	},

	//主贴-加精
	boEnlighten: function() {
		//this.batchOperateFlag({flag_click: '2'});   //2：点击的剩余的列表中的选项
		this.options.onEnlighten();
	},
	//主贴-屏蔽
	boShieldHostPosts: function() {
		//this.batchOperateFlag({flag_click: '2'});
		this.options.onShieldHostPosts();
	},
	//主贴-删除
	boDeleteHostPosts: function() {
		//this.batchOperateFlag({flag_click: '2'});
		this.options.onDeleteHostPosts();
	},
	//主贴-迁移
	boMigrate: function() {
		//this.batchOperateFlag({flag_click: '2'});
		this.options.onMigrate();
	},
	//删除/屏蔽主贴-恢复删除主贴
	boRecoverHostPosts: function() {
		//this.batchOperateFlag({flag_click: '2'});
		this.options.onRecoverHostPosts();
	},
	//删除/屏蔽主贴-恢复屏蔽主贴
	boRecoverShieldPosts: function() {
		//this.batchOperateFlag({flag_click: '3'});
		this.options.onRecoverShieldPosts();
	},
	//删除/屏蔽主贴-批量屏蔽主帖
	boRefusePosts: function() {
		this.options.onRefusePosts();
	},
	//删除/屏蔽主贴-批量通过审核
	boAgreePosts: function() {
		this.options.onAgreePosts();
	},
	//回帖-屏蔽
	boShieldReplyPosts: function() {
		//this.batchOperateFlag({flag_click: '2'});
		this.options.onShieldReplyPosts();
	},
	//回帖-删除
	boDeleteReplyPosts: function() {
		//this.batchOperateFlag({flag_click: '2'});
		this.options.onDeleteReplyPosts();
	},
	//回帖-恢复屏蔽回帖
	boRecoveryShieldReplyPosts: function () {
		this.options.onRecoveryShieldReplyPosts();
	},
	//回帖-恢复删除回帖
	boRecoveryDeleteReplyPosts: function () {
		this.options.onRecoveryDeleteReplyPosts();
	},
	//回帖-批量屏蔽回帖
	boRefuseReplyPosts: function () {
		this.options.onRefuseReplyPosts();
	},
	//回帖-批量通过回帖
	boAgreeReplyPosts: function () {
		this.options.onAgreeReplyPosts();
	},

	batchSetTopic: function() {
		this.options.batchSetTopic();
	},

	batchDelTopic: function() {
		this.options.batchDelTopic();
	},

	//批量操作-标志位变化
	batchOperateFlag (obj) {
		var {flag_batchOperate, flag_batchOperateList, flag_isCheckBoxTitleShow} = this.model.toJSON();
		var flag_click = obj.flag_click;
		if(parseInt(flag_click) == 1) {
			flag_batchOperate = '0';
			flag_batchOperateList = '1';
			flag_isCheckBoxTitleShow = true;
		} else if(parseInt(flag_click) == 2) {
			flag_batchOperateList = '0';
			flag_batchOperate = '1';
		} else if(parseInt(flag_click) == 3) {

		}
		this.model.set({flag_batchOperate, flag_batchOperateList, flag_isCheckBoxTitleShow});
		const { onBatchOperateFlag } = this.options;
		onBatchOperateFlag && onBatchOperateFlag(flag_isCheckBoxTitleShow)
	},

	format(data) {
        let {postType, flag_batchOperate, flag_batchOperateList, userRole} = data;

        let isMaster, isUnnormal, hostPostsBatchOperateText, hostPostsBatchOperateListText, isDelOrShield;
        if(postType == '1' || postType == '0') {
            isMaster = true;
            if(postType == '0') {
                isUnnormal = true;
            }
        } else if(postType == '2') {
            isMaster = false;
        } else if(postType == '3') {
        	isDelOrShield = true;
        }

        if(parseInt(flag_batchOperate) && !parseInt(flag_batchOperateList)) {
        	hostPostsBatchOperateText = 'btn-default';
        	hostPostsBatchOperateListText= 'disabled';
        } 

        if(parseInt(flag_batchOperateList) && !parseInt(flag_batchOperate)) {
        	hostPostsBatchOperateText = 'disabled';
        	hostPostsBatchOperateListText= 'btn-default';
        } 

		var isDev = false;  //是否是研发
		if (userRole.toLowerCase().indexOf('dev') !== -1) {
			isDev = true;
		}

		var canDelete = false;
		//管理、质检、研发可以删除帖子
		if ((userRole.indexOf('DEV') != -1) || (userRole.indexOf('MANAGER') != -1) || (userRole.indexOf('QC') != -1)) {
				canDelete = true;
			}

        return {isMaster, isUnnormal, isDelOrShield, hostPostsBatchOperateText, hostPostsBatchOperateListText, isDev, canDelete};
	},

	render: function() {
	    var data = this.format(this.model.toJSON());
	    this.$el.html(tpl(data));
	}


});

export {OperatePanel}