import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import {Select as MultiSelect} from '../../../../components/multiSelect/index';
import {Select} from '../../../../components/select/index';

const tpl = require("./update.html");

let Model = Backbone.Model.extend({
	defaults: {
		isShowTopicNameFlag: false,    //标志：查询(依据posterMasterId)列表结果没有数据
		topicNameList: [],
		recTopicNameList: [],
		collegeList: [],
		familyList: [],
		skipTitleHide: 'hide',
		postDetailSelected: '',
		topicDetailSelected: '',
		userHomeSelected: '',
		activePageSelected: '',
		questionAnswerSelected: '',
		hideClass: ''
	}
});

let Update = Backbone.View.extend({
	initialize: function(options) {
		this.model = new Model();
		const {isShowTopicName, itemModel, type} = options;
		this.initUpdateTopicNameList(itemModel);
		this.listenTo(this.model, 'change:isShowTopicName', this.render);
		this.listenTo(this.model, 'change:isShowTopicNameFlag', this.render);
		this.listenTo(this.model, 'change:collegeList', this.render);
	    this.listenTo(this.model, 'change:familyList', this.render);
		this.initiaCollegeList();
		this.model.set({
			isShowTopicName,
			itemModel,
			type
		});
		this.render();
		
		this.listenTo(this.model, 'change:topicNameList', this.render);
		this.listenTo(this.model, 'change:recTopicNameList', this.render);
		this.initiaRecTopicNameList();
	},

	events: {
		'change #skipTo': 'toggleContentDetail',        //推荐内容切换select
		'click .uploadPicBtn': 'uploadPic'
		// 'blur input[name="contentDetail"]': 'blurValidateDetail'			//推荐内容input失去焦点
	},

	blurValidateDetail() {
		// to do 取消话题详情页新增需求校验
		const recommendedPositionType = this.model.get("type");
		
		const type = +this.$el.find("#skipTo option:selected").val();
		const contentDetail = this.$el.find("input[name='contentDetail']").val();
		const reg = new RegExp("^[0-9]*$");
		switch(type) {
			case 1:
				if(!contentDetail) {
					alert("帖子Id不能为空!");
					return false;
				}
				if(!reg.test(contentDetail)) {
					alert("帖子Id仅支持数字!");
					return false;
				}
			case 2:
				if(!contentDetail) {
					alert("话题名称不能为空!");
					return false;
				}
			case 3:
				if(recommendedPositionType == 1 && !contentDetail) {
					alert("用户userId不能为空!");
					return false;
				}
				if(recommendedPositionType == 1 && !reg.test(contentDetail)) {
					alert("用户userId仅支持数字!");
					return false;
				}
			default:
				break;
		}
	},

	uploadPic(e) {
		common.picUploaderNew((onSuccess) => {
			const { width='', height='', linkUrl } = onSuccess.resultMessage[0];
			this.$el.find(".uploadPicBtn").text('更新图片').prop('disabled', false);
			if (width * 220 != height * 750) {
				alert('上传图片尺寸需为750*220');
				return false;
			} else {
				this.$el.find('#contentPic').val(linkUrl);	
			}
		},	(onChange) => {
			const { size='' } = onChange;
			if( size > 500*1024 ) {
				alert("图片大小需在500K以内！");
				return false;
			}
			this.$el.find(".uploadPicBtn").text('上传中...').prop('disabled', true);
		});
	},

	toggleContentDetail(params) {
		const { isRender } = params;
		const { itemModel } = this.model.toJSON();
		const { skipId, skipName, contentType, content } = itemModel;
		const selectedOptionValue = isRender ? contentType : +this.$el.find("#skipTo option:selected").val();
		switch(selectedOptionValue) {
			case 1:
				this.$el.find("#skipTo").val('1');
				this.$el.find(".content-detail").removeClass("hide");
				this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请输入帖子id").val(skipId);
				this.$el.find(".form-group-topicname").removeClass("hide");
				this.$el.find(".form-group-upload").removeClass('hide');
				this.$el.find("#collegeFamilyWrapper").removeClass('hide');
				break;
			case 2:
				this.$el.find("#skipTo").val('2');
				this.$el.find(".content-detail").removeClass("hide");
				this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请输入话题名称").val(content);
				this.$el.find(".form-group-topicname").addClass("hide");
				this.$el.find(".form-group-upload").removeClass('hide');
				this.$el.find("#collegeFamilyWrapper").removeClass('hide');
				break;
			case 3:
				this.$el.find("#skipTo").val('3');
				this.$el.find(".content-detail").removeClass("hide");
				this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请输入用户userid").val(skipId);
				this.$el.find(".form-group-topicname").addClass("hide");
				this.$el.find(".form-group-upload").removeClass('hide');
				this.$el.find("#collegeFamilyWrapper").removeClass('hide');
				break;
			case 4:
				this.$el.find("#skipTo").val('4');
				this.$el.find(".content-detail").removeClass("hide");
				this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请输入用户userid").val(content);
				this.$el.find(".form-group-topicname").addClass("hide");
				this.$el.find(".form-group-upload").removeClass('hide');
				this.$el.find("#collegeFamilyWrapper").removeClass('hide');
				this.$el.find(".form-group-pageTitle").removeClass('hide');
				break;
			case 5:
				this.$el.find("#skipTo").val('5');
				this.$el.find(".content-detail").removeClass("hide");
				this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请填写问题ID").val(skipId);
				this.$el.find(".form-group-topicname").addClass("hide");
				this.$el.find(".form-group-upload").addClass('hide');
				this.$el.find("#collegeFamilyWrapper").addClass('hide');
				break;
			default:
				break;
		}
	},

	initiaRecTopicNameList() {
		const params = {isPage: 0}
		service.getTopicNameList(params, (response) => {
			if(response.rs) {
				const { resultList=[] } = response.resultMessage;
				this.model.set({
					recTopicNameList: resultList
				})
			} else {
				alert(response.rsdesp);
			}
		})
	},

	initUpdateTopicNameList: function(itemModel) {
		const {postMasterId} = itemModel;
		let {isShowTopicNameFlag} = this.model.toJSON();
		const isPage = 0;
		const params = {postMasterId, isPage};
		if(postMasterId) {
			service.getTopicNameList(params, (response) => {
				if(response.rs) {
					if(response.hasOwnProperty('resultMessage')) {
						if(response.resultMessage && response.resultMessage.resultList) {
							const topicNameList = response.resultMessage.resultList;
							this.model.set({
								postMasterId,
								topicNameList
							});
						}
					} else {
						isShowTopicNameFlag = true;
						this.model.set({
							postMasterId,
							isShowTopicNameFlag
						});
					}
				} else {
			    	alert(response.rsdesp);
			    };
			})
		}
	},

	initFromValue: function(options) {
		//时间选择框
		this.$el.find("#beginTime").datetimepicker({
			format: 'yyyy-mm-dd hh:00:00',
		    autoclose: true,
		    todayBtn: true,
		    minView: 'day'
		});
		this.$el.find('#endTime').datetimepicker({
	      format: 'yyyy-mm-dd hh:00:00',
	      autoclose: true,
	      todayBtn: true,
	      minView: 'day'
	    });
	    $('#pageNoDialog').on('keydown', (e) => {
			// Allow: backspace, delete, tab, escape, enter and (can't input . 190)
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
				// Allow: Ctrl+A
				(e.keyCode == 65 && e.ctrlKey === true) ||
				// Allow: Ctrl+C
				(e.keyCode == 67 && e.ctrlKey === true) ||
				// Allow: Ctrl+X
				(e.keyCode == 88 && e.ctrlKey === true) ||
				// Allow: home, end, left, right
				(e.keyCode >= 35 && e.keyCode <= 39)) {
					// let it happen, don't do anything
					return;
			}
			let pageNoKeyCodeList = [49, 50, 51, 52, 53, 97, 98, 99, 100, 101];
			let len = $('#pageNoDialog').val().length;
	    	if ($.inArray(e.keyCode, pageNoKeyCodeList) == -1 || len) {
				e.preventDefault();
			}
	    })

	  	$('#ranking').on('keydown', (e) => {
	  		// Allow: backspace, delete, tab, escape, enter and (can't input . 190)
	  		if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
	  			// Allow: Ctrl+A
	  			(e.keyCode == 65 && e.ctrlKey === true) ||
	  			// Allow: Ctrl+C
	  			(e.keyCode == 67 && e.ctrlKey === true) ||
	  			// Allow: Ctrl+X
	  			(e.keyCode == 88 && e.ctrlKey === true) ||
	  			// Allow: home, end, left, right
	  			(e.keyCode >= 35 && e.keyCode <= 39)) {
	  				// let it happen, don't do anything
	  				return;
	  		}

	  		let rankingKeyCodeList = [49, 50, 51, 52, 53, 54, 55, 56, 57,
	  								97, 98, 99, 100, 101, 102, 103, 104, 105];
	  		let len = $('#ranking').val().length;
	      	if ($.inArray(e.keyCode, rankingKeyCodeList) == -1 || len) {
	  			e.preventDefault();
	  		}
	  	})

		//设置默认时间
		let date = new Date();
		let y = date.getFullYear();
		let m = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
		let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
		let h = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
		this.$el.find('#beginTime').val(y +  '-' + m + '-' + day + ' ' + h + ':00:00');

		let endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
		let endY = endDate.getFullYear();
		let endM = endDate.getMonth() + 1 > 9 ? endDate.getMonth() + 1 : '0' + (endDate.getMonth() + 1);
		let endDay = endDate.getDate() > 9 ? endDate.getDate() : '0' + endDate.getDate();
		let endH = endDate.getHours() > 9 ? endDate.getHours() : '0' + endDate.getHours();
		this.$el.find('#endTime').val(endY +  '-' + endM + '-' + endDay + ' ' + endH + ':00:00');
	},

	convertFamilyObjectListToFamilyObject(list=[]) {
		let resultList = [];
		list.forEach((item, index) => {
			resultList.push(item.family + '-' + item.college);
		});
		return resultList;
	},

	formatCollegeListOrFamilyList: function(list, flag) {
		/*
		**@flag
		** flag==1 *** 格式化collegeList
		** flag==2 *** 格式化familyList
		*/
		let arr = [];
		if(list) {
			list.unshift("全部");
			list.forEach((item, index) => {
				let value = index;
				if(flag == 1) {
					let collegeListItem = item;
					arr.push(Object.assign({}, {value}, {collegeListItem}))
				} else if(flag == 2) {
					let familyListItem = item;
					arr.push(Object.assign({}, {value}, {familyListItem}))
				}	
			})
		}
		return arr;
	},

	initiaCollegeList: function() {
		let params = {};
		let that = this;
		service.getSelectedCollegeList(params, (response) => {
			if(response.rs) {
				let collegeList = response.resultMessage;
				collegeList = that.formatCollegeListOrFamilyList(collegeList, 1);
				that.model.set({
					collegeList
				})
			} else {
				alert("用户归属中学院列表加载失败！请刷新重试。");
			}
		})
	},

	initiaFamilyList: function(text) {
		const that = this;
		let {collegeChanged} = this.model.toJSON();
		let params;
		if (typeof text == 'string') {
			// select onChecked回调
			params = {schoolName: text};
			if(text) {
				const collegeCallBackParams = {schoolName: text};
				this.model.set({
					collegeCallBackParams
				});
			}
			
			collegeChanged = true;
		} else {
			params = {schoolName: '全部'};
			collegeChanged = false;
		}
		service.listFamilyByColleges(params, (response) => {
			if(response.rs) {
				let familyList = response.resultMessage;
				familyList = that.convertFamilyObjectListToFamilyObject(familyList);
				familyList = that.formatCollegeListOrFamilyList(familyList, 2);
				
				that.model.set({
					familyList,
					collegeChanged
				})
			} else {
				alert(response.rsdesp);
			}
		})

	},

	arrToObjArr: function(list=[], flag) {
		//@params: flag=1***collegeList
		//@params: flag=2***familyList
        const arr = [];
        list.forEach((item, index) => {
        	if(flag === 1) {
        		arr.push({
		            value: item.value,
			        text: item.collegeListItem
			    })
	        	
        	} else if(flag === 2) {
        		if(item.familyListItem == 'E_O_F') {
	        		arr.push({
			            value: item.value,
			            text: item.familyListItem,
			            divider: true
			        })
        		} else {
	        		arr.push({
			            value: item.value,
			            text: item.familyListItem
			        })
       			}		
        	}
        })
        return arr;
    }, 

    convertToSelectList: function(data, dataList=[], flag) {
		//@params: flag=1***collegeList
		//@params: flag=2***familyList
        let arr = [];
        dataList.forEach((item, index) => {
        	if(flag === 1) {
	        	arr.push({
		            value: item.value,
		            text: item.collegeListItem
		        })
        	} else if(flag === 2) {
       			arr.push({
	                value: item.value,
	                text: item.familyListItem
	            })
       		}
        })

        //select下拉list checkbox回显选中
        if(arr.length) {
        	let sourceArr = data.split(',');
	        	const sourceLength = sourceArr.length;
	        	const arrLength = arr.length; 
	        	for(let i=0; i<sourceLength; i++) {
	        		for(let j=0; j<arrLength; j++) {
	        			if(sourceArr[i] == arr[j].text) {
	        				arr[j].checked = 'checked';
	        			}
	        		}
	        	}
        }
        return arr;
	},

	convertToRedisplay(list, family, flag) {
		//转换family中"ALL"为"全部"
		family = family.replace(/ALL/g, "全部");
		// const familyStr = flag === 1 ? family.split("_")[0] : family.split("_")[1];
		let familyStr = '';
		if(family.indexOf(',') == -1) {
			//family只有一个学院_家族对
			//"全部_全部"
			if(family.indexOf("全部") !== -1) {
				familyStr = flag === 1 ? family.split("_")[0] : family.split("_")[1];
			} else {
				familyStr = flag === 1 ? family.split("_")[0] : family.split("_").reverse().join('-');
			}
			
		} else {
			//family有多个学院_家族对
			
			//学院列表
			if(flag == 1) {
				let arr = family.split(',');
				for(let i = 0; i < arr.length; i++) {
					familyStr += arr[i].split('_')[0];
					familyStr += ',';
				}

				//去掉末尾","及过滤掉重复的内容
				familyStr = familyStr.substr(0, familyStr.length-1);
				const familyObj = {};
				const familyStrTempArr = familyStr.split(',');
				for(let i = 0; i < familyStrTempArr.length; i++) {
					familyObj[familyStrTempArr[i]] = familyStrTempArr[i];
				}
				const temptArr = [];
				for(let key in familyObj) {
					temptArr.push(familyObj[key]);	
				}
				familyStr = temptArr.toString();
			} else if(flag == 2) {
				//家族列表
				const familyStrList = family.split(',');
				if(family.includes("全部")) {
					familyStr = "全部";
				} else {
					let collegeFamilyStr = '';
					for(let i = 0; i < familyStrList.length; i++) {
						collegeFamilyStr += familyStrList[i].split('_').reverse().join('-');
						collegeFamilyStr += ',';
					}
					familyStr = collegeFamilyStr.substr(0, collegeFamilyStr.length-1);
				}
				
			}
		}		

		if(familyStr.indexOf(',') == -1) {
			for(let i = 0; i < list.length; i++) {
				if(list[i].text == familyStr) {
					list[i].checked = 'checked';
				}
			}
		} else {
			const familyList = familyStr.split(',');
			for(let i = 0; i < list.length; i++) {
				for(let j = 0; j < familyList.length; j++) {
					if(list[i].text == familyList[j]) {
						list[i].checked = 'checked';
					}
				}
			}
		}
		return list;
	},

	renderCollegeAndFamilySelect: function () {
    	const { collegeList, familyList, collegeCallBackParams, itemModel} = this.model.toJSON();
    	const { family } = itemModel;
    	let collegeObjList = this.arrToObjArr(collegeList, 1);
    	
    	if(collegeCallBackParams) {
    		const {schoolName} = collegeCallBackParams;
    		collegeObjList = this.convertToSelectList(schoolName, collegeList, 1);
    	} else {
    		//回显学院
    		family && (collegeObjList = this.convertToRedisplay(collegeObjList, family, 1));
    	}
    	
		this.collegeSelect && this.collegeSelect.undelegateEvents();
		this.collegeSelect = new MultiSelect({
			el: this.$el.find('#collegeWrapper')[0],
			itemList: collegeObjList,
			name: 'collegeList',
			selectedItemsText: '请选择学院',
			onChecked: this.initiaFamilyList.bind(this)
		});
			
		let familyObjList = this.arrToObjArr(familyList, 2);
		//回显家族
    	family && (familyObjList = this.convertToRedisplay(familyObjList, family, 2));
		this.familySelect && this.familySelect.undelegateEvents();
		this.familySelect = new MultiSelect({
			el: this.$el.find('#familyWrapper')[0],
			itemList: familyObjList,
			name: 'familyList',
			selectedItemsText: '请选择家族'
		});
    },

	renderUpdateTopicNameList: function(topicNameList, id) {
		let list = this.convertToValTxtObj(topicNameList);
		let {itemModel} = this.model.toJSON();
		let {topicIdList} = itemModel;
		list = this.convertToRedisplayTopicNameList(list, topicIdList);
		// let dftSeletedItemsText = this.getTxtFromList(topicIdList, list);
		this.addShieldSelect = new Select({
			el: this.$el.find(id),
			itemList: list,
			name: 'addUpdateTopicName',
			// selectedItemsText: dftSeletedItemsText
			selectedItemsText: "请选择"
		});
	},

	convertToValTxtObj: function(list) {
	    let arr = [];
	    list.forEach((item, index) => {
	      arr.push({
	        value: item.topicId,
	        text: item.topicTitle,
	        checked: item.checked
	      })
	    })
	    return arr;
	},

	//返回新增时选中的列表项
	getTxtFromList: function(topicIdList, list) {
		let textArr = [];
		let idArr = topicIdList ? topicIdList.split(",") : [];
		for(let i=0; i<list.length; i++) {
			for(let j=0; j<idArr.length; j++) {
				if(idArr[j] == list[i].value) {
					textArr.push(list[i].text);
				}
			}
		}
		let text = textArr.toString();
		return text;
	},

	format: function(data) {
		const {itemModel} = data;
		let {contentType, content, skipName} = itemModel;
		let postDetailSelected = '', topicDetailSelected = '', userHomeSelected = '', activePageSelected = '', questionAnswerSelected = '', hideClass = '';
		if(contentType == 1) {
			postDetailSelected = 'selected';
		} else if(contentType == 2) {
			topicDetailSelected = 'selected';
		} else if(contentType == 3) {
			userHomeSelected = 'selected';
		} else if(contentType == 4) {
			activePageSelected = 'selected';
		} else if(contentType == 5) {
			questionAnswerSelected = 'selected';
			hideClass = 'hide';
		}
		const contentDetailText = contentType == 4 ? skipName : content;
		let skipTitleHide = contentType == 4 ? '' : 'hide'; 
		Object.assign(data, itemModel, {contentDetailText, skipTitleHide, postDetailSelected, topicDetailSelected, userHomeSelected, activePageSelected, questionAnswerSelected, hideClass});
		return data;
	},

	formatTopicNameList(topicNameList=[], checkedItemValues) {
		const targetArr = checkedItemValues ? checkedItemValues.split(',') : [];
		for(let i=0; i<topicNameList.length; i++) {
			for(let j=0; j<targetArr.length; j++) {
				if(topicNameList[i].topicId == targetArr[j]) {
					topicNameList[i].checked = 'checked';
				}
			}
		}
		return topicNameList;
	},

	convertToRedisplayTopicNameList(list, topicIdList) {
		if(topicIdList.indexOf(',') == -1) {
			//单个topicId
			for(let i = 0; i < list.length; i++) {
				if(list[i].value == topicIdList) {
					list[i].checked = 'checked';
				}
			}
		} else {
			//多个topicId
			const topicIdListArr = topicIdList.split(',');
			for(let i = 0; i < list.length; i++) {
				for(let j = 0; j < topicIdListArr.length; j++) {
					if(list[i].value == topicIdListArr[j]) {
						list[i].checked = 'checked';
					}
				}
			}
		}
		return list;
	},

	renderDialogSelect: function(topicNameList=[], id) {
		const { itemModel } = this.model.toJSON();
		const { topicIdList } = itemModel;
		let list = this.convertToValTxtObj(topicNameList);
		topicIdList && (list = this.convertToRedisplayTopicNameList(list, topicIdList));
		// this.topicNameSelect && this.topicNameSelect.undelegateEvents();
	    id == '#updateRecTopicName' ? (
	    	this.topicNameSelect = new Select({
	        	el: this.$el.find(id)[0],
	        	itemList: list,
	        	name: 'updateRecTopicName',
	        	selectedItemsText: "全部"
	    	})
	    ) : (
	    	this.recToTopicNameSelect = new Select({
	        	el: this.$el.find(id)[0],
	        	itemList: list,
	        	name: 'dialogRecTopicName',
	        	selectedItemsText: "全部"
	    	})
	    )  
	},

	//to do
	//话题详情页-更新新需求暂时不开通前端权限-隐藏本次开发的需求
	hideDialogOfNewDeveloped(type) {
		const { itemModel } = this.model.toJSON();
		const { postMasterId } = itemModel;
		this.$el.find("#collegeFamilyWrapper").addClass("hide");
		this.$el.find(".form-group-rectopicname").addClass("hide");
		this.$el.find(".form-group-upload").addClass("hide");
		this.$el.find(".content-detail").removeClass("hide");
		if(type == '2') {
			this.$el.find("#skipTo").val("1");
			this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请输入帖子id").val(postMasterId);
			this.$el.find(".form-group-topicname").removeClass("hide");
		} else if(type == '3') {
			this.$el.find("#skipTo").val("5");
			this.$el.find(".content-detail input[name='contentDetail']").attr("placeholder", "请填写问题ID").val(postMasterId);
			this.$el.find(".form-group-topicname").addClass("hide");
		}
		
		// this.$el.find(".form-group-skiptype").addClass("hide");
		// this.$el.find(".form-group-topicname").removeClass("hide");
	},
	//to do
	//话题详情页-更新新需求暂时不开通前端权限-隐藏本次开发的需求
	hideAddDialogOfNewDeveloped() {
		this.$el.find(".form-group-rectopicname").addClass("hide");
	},

	render: function() {
		let data = this.format(this.model.toJSON());
		//推荐内容-select框 || input框
		const contextType = +this.$el.find("#skipTo option:selected").val();
		const skipToContent = contextType ? this.$el.find("input[name='contentDetail']").val() : '';
		//话题名称 || 推荐至话题 选中项
		const checkedUpdateRecTopicNameValues = this.$el.find("#updateRecTopicName input[name='selectedItemsValue']").val();
		const checkedDialogRecTopicNameValues = this.$el.find("#dialogRecTopicName input[name='selectedItemsValue']").val();
		//帖子位置：页||位
		const pageNoDialogText = this.$el.find("#pageNoDialog").val();
		const rankingText = this.$el.find("#ranking").val();

		this.$el.html(tpl(data));
		const {topicNameList, recTopicNameList, postMasterId, type, beginTime, endTime} = data;
		// topicNameList && this.renderUpdateTopicNameList(topicNameList, "#updateRecTopicName");
		this.initFromValue();
		//推荐内容-select框 || input框(多次渲染)数据回显
		contextType && this.$el.find("#skipTo").val(contextType);
		// this.toggleContentDetail({isRender: true});
		skipToContent && this.$el.find("input[name='contentDetail']").val(skipToContent);
		//话题名称数据回填
		topicNameList && this.renderDialogSelect(this.formatTopicNameList(topicNameList, checkedUpdateRecTopicNameValues), "#updateRecTopicName");
		//推荐至话题（多次渲染）数据回填
		recTopicNameList && this.renderDialogSelect(this.formatTopicNameList(recTopicNameList, checkedDialogRecTopicNameValues), "#dialogRecTopicName");
		//帖子位置：页||位 （多次渲染）数据回显
		pageNoDialogText && this.$el.find("#pageNoDialog").val(pageNoDialogText);
		rankingText && this.$el.find("#ranking").val(rankingText);
		//开始结束时间（多次渲染）
		beginTime && this.$el.find("#beginTime").val(beginTime);
		endTime && this.$el.find("#endTime").val(endTime);
		//用户归属-学院|家属
		this.renderCollegeAndFamilySelect();

		//to do
		//话题详情页-更新新需求暂时不开通前端权限-隐藏本次开发的需求
		(type == '2' || type == '3') && this.hideDialogOfNewDeveloped(type);
		//to do
		//话题详情页-更新新需求暂时不开通前端权限-隐藏本次开发的需求
		type == '1' && this.hideAddDialogOfNewDeveloped();
	}
});

export {Update};