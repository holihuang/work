import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {Dialog} from '../../../components/dialog/index'
import {Select as MultiSelect} from '../../../components/multiSelect/index';
import {Select} from '../../../components/select/index';

let tpl = require('./add.html');

let Model = Backbone.Model.extend({
	defaults: {
		collegeChanged: false,
		checkHide: 'checked',
		checkShow: '',
		uploaded: false,
		userClass: 'hidden',
		freeUserChecked: '',
		payingUserChecked: '',
		allUserChecked: 'checked',
		showUserAndTopicInfo: false,
		collegeList: [],
		topicClassifyList: []
	}
});

let View = Backbone.View.extend({
	
	initialize: function() {
		this.model = new Model();
		//this.model.set(options);
		this.initiaCollegeList();
		// this.initiaFamilyList({schoolName: "全部"});

		this.listenTo(this.model, 'change:showUserAndTopicInfo', this.render);
		this.listenTo(this.model, 'change:collegeList', this.render);
		this.listenTo(this.model, 'change:familyList', this.render);
		this.listenTo(this.model, 'change:topicClassifyList', this.render);
		this.getTopicClassify();
		this.render();
	},
	
	events: {
		"click #freeUser": "renderUserAndTopicInfo",
		"click #payingUser": "renderUserAndTopicInfo",
		"click #allUser": "renderUserAndTopicInfo",
		'click #file': 'uploadPic',
		"blur #topicTitle": "getIptTitle",
		"blur #topicBrief": "getTxtaraBrief",
		"click input[name='isShow']": "getCheckedRadio",
		"blur #roundIds": "checkRoundIds"
	},

	getCheckedRadio: function(e) {
		let {checkHide, checkShow} = this.model.toJSON();
		let iptRadioVal = $(e.currentTarget).val();
		if(!iptRadioVal) {
			checkHide = 'checked';
			checkShow = '';
		} else {
			checkHide = '';
			checkShow = 'checked';
		}
		this.model.set({
			checkHide,
			checkShow
		})
	},

	checkRoundIds: function() {
		const roundIds = this.$el.find('#roundIds').val();
		if(roundIds) {
			service.checkRoundIdList({roundIds}, (response) => {
				if(response.rs) {
					if(response.resultMessage instanceof Array && response.resultMessage.length) {
						const noRoundIdList = response.resultMessage.toString();
						alert(`您输入的轮次id不存在,请检查后重新填写～`);
						this.$el.find("#roundIds").val('');
					}
					
				} else {
					alert(response.rsdesp);
				}
			})
		}
	},

	uploadPic: function() {
		let {uploaded} = this.model.toJSON();
		common.picUploaderNew((upSuccess) => {
			const mediaLinks = upSuccess.resultMessage[0].linkUrl || '';
			const width = upSuccess.resultMessage[0].width || '';
			const height = upSuccess.resultMessage[0].height || '';
			
			if (width * 6 != height * 11) {
				alert('图片长宽比需为11:6');
			} else {
				this.$el.find("#file").text("");
				const dataTxt = "更新";
				this.$el.find("#file").append(dataTxt);
				uploaded = true;
				this.model.set({uploaded, mediaLinks});
			}
			
		}, (onChange) => {
			const uploadPicName = onChange.name || '';
			const uploadPicSize = onChange.size || '';

			if(uploadPicSize > 1048576) {
				alert("图片大小需在1M以内！");
			} else {
				this.$el.find("#fileName").text("");
				this.$el.find("#fileName").append(uploadPicName);
				this.model.set({uploadPicName});
			}

		});
	},

	formatTopicClassify(str) {
		let arr = [];
		if(str) {
			arr = str.indexOf('0') !== -1 ? [0] : str.split(',')
		}
		let resultArr = [];
		arr.forEach((item, index) => {
			resultArr.push(+item);
		}) 
		return resultArr;
	},

	getIptTitle: function() {
		let iptTitleVal = this.$el.find("#topicTitle").val();
		iptTitleVal && this.model.set({iptTitleVal});	
	},

	getTxtaraBrief: function () {
		let txtAraBriefVal = this.$el.find("#topicBrief").val();
		txtAraBriefVal && this.model.set({txtAraBriefVal});
	},

	renderUserAndTopicInfo: function(e) {
		let {showUserAndTopicInfo, freeUserChecked, payingUserChecked, allUserChecked, userClass} = this.model.toJSON();

		let $val = $(e.currentTarget).attr("value");
		switch(+$val) {
			case 1: 
				showUserAndTopicInfo = true;
				payingUserChecked = 'checked';
				freeUserChecked = '';
				allUserChecked = '';
				userClass = 'red';
				break;
			case 0: 
				showUserAndTopicInfo = false;
				freeUserChecked = 'checked';
				payingUserChecked = '';
				allUserChecked = '';
				userClass = 'hidden';
				break;
			case 2: 
				showUserAndTopicInfo = false;
				allUserChecked = 'checked';
				freeUserChecked = '';
				payingUserChecked = '';
				userClass = 'hidden';
				break;
			default:
				break;
		}
		this.model.set({
			showUserAndTopicInfo,
			freeUserChecked,
			payingUserChecked,
			allUserChecked,
			userClass
		})
		if(+$val === 1) {
			this.$el.find("#dialogCollegeList").val('0');
			this.$el.find("#dialogFamilyList").val('0');
		}
		this.renderMultiSelect();
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
		
		service.getSelectedFamilyList(params, (response) => {
			if(response.rs) {
				let familyList = response.resultMessage;
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

	arrToObjArr: function(list=[], flag) {
		//@params: flag=1***collegeList
		//@params: flag=2***familyList
        const arr = [];
        list.forEach((item, index) => {
        	if(flag === 1) {
        		// if(item.value) {
	        	// 	arr.push({
			       //      value: item.value,
			       //      text: item.collegeListItem
			       //  })
        		// }
        		arr.push({
		            value: item.value,
			        text: item.collegeListItem
			    })
	        	
        	} else if(flag === 2) {
        		// if(item.value) {
        		// 	//'E_O_F'是每个学院下家族列表的结尾
        		// 	if(item.familyListItem == 'E_O_F') {
	        	// 		arr.push({
				      //       value: item.value,
				      //       text: item.familyListItem,
				      //       divider: true
				      //   })
        		// 	} else {
	        	// 		arr.push({
				      //       value: item.value,
				      //       text: item.familyListItem
				      //   })
        		// 	}
	        		
        		// }
        		//'E_O_F'是每个学院下家族列表的结尾
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

    validateUserLocOrRoundsId: function(college, family, roundIds) {
    	const {showUserAndTopicInfo} = this.model.toJSON();
    	if(showUserAndTopicInfo) {
	    	if(roundIds) {
	    		return true;
	    	} else {
	    		if(college && family) {
	    			return true;
	    		} else {
	    			if(!college) {
	    				alert("请选择学院！");
	    				return false;
	    			}
	    			if(!family) {
	    				alert("请选择家族！");
	    				return false;
	    			}
	    		}
	    	}
    	}
    	return true;
    },

    convertToSelectList: function(data, dataList=[], flag) {
		//@params: flag=1***collegeList
		//@params: flag=2***familyList
        let arr = [];
        dataList.forEach((item, index) => {
        	// if(item.value) {
        	// 	if(flag === 1) {
	        // 		arr.push({
		       //          value: item.value,
		       //          text: item.collegeListItem
		       //      })
        	// 	} else if(flag === 2) {
        	// 		arr.push({
		       //          value: item.value,
		       //          text: item.familyListItem
		       //      })
        	// 	}
	        	
        	// }
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
        	// //convert type of data from string to array
        	// //源数组，以该数组中字段匹配目标数组对应字段
        	// let sourceArr = data.split(',');
        	// let objOfArr = {};
        	// //arr 为目标数组，在该数组内查找
        	// arr.forEach(item => {
        	// 	objOfArr[item.text] = item;
        	// });
        	// sourceArr.forEach(e => {
        	// 	objOfArr[e] && (objOfArr[e].checked = 'checked');
        	// });
        	// arr = [];
        	// for(let key in objOfArr) {
        	// 	arr.push(objOfArr[key]);
        	// }
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

	getTopicClassify() {
		const params = {
			userAccount: window.userInfo.userAccount
		};
		service.getTopicClassify(params, (response) => {
			if(response.rs) {
				const resultList = response.resultMessage || [];
				this.model.set({
					topicClassifyList: resultList
				});
			} else {
				alert(response.rsdesp);
			}
		})
	},

	convertClassifyListToSelectList(topicClassifyList, classifyNameList) {
		const arr = [];
		topicClassifyList.forEach((item, index) => {
			arr.push({
				value: item.classifyId,
				text: item.classifyName
			});
		});
		// arr.unshift({
		// 	value: 0,
		// 	text: '全部'
		// });

		return arr;
	},

	renderClassifySelect() {
		const {topicClassifyList, classifyNameList} = this.model.toJSON();
		const list = this.convertClassifyListToSelectList(topicClassifyList, classifyNameList);
		this.classifySelect = new Select({
			el: this.$el.find("#topicClassifyAddDialog")[0],
			itemList: list,
			name: 'topicClassifyAddDialog',
			selectedItemsText: '请选择话题分类'
		});
	},

    renderMultiSelect: function () {
    	const {showUserAndTopicInfo, collegeList, familyList, collegeCallBackParams} = this.model.toJSON();
    	if(showUserAndTopicInfo) {
    		let collegeObjList = this.arrToObjArr(collegeList, 1);
    		if(collegeCallBackParams) {
    			const {schoolName} = collegeCallBackParams;
    			collegeObjList = this.convertToSelectList(schoolName, collegeList, 1);
    		}
    		
			this.collegeSelect && this.collegeSelect.undelegateEvents();
			this.collegeSelect = new MultiSelect({
				el: this.$el.find('#dialogCollegeList')[0],
				itemList: collegeObjList,
				name: 'collegeList',
				selectedItemsText: '请选择学院',
				onChecked: this.initiaFamilyList.bind(this)
			});
			
			const familyObjList = this.arrToObjArr(familyList, 2);
			this.familySelect && this.familySelect.undelegateEvents();
			this.familySelect = new MultiSelect({
				el: this.$el.find('#dialogFamilyList')[0],
				itemList: familyObjList,
				name: 'familyList',
				selectedItemsText: '请选择家族'
			});
    	} else {
    		this.$el.find('#dialogCollegeList').empty();
    		this.$el.find('#dialogFamilyList').empty();
    	}
    },

	render: function() {
		let data = this.model.toJSON();
		this.$el.html(tpl(data));

		const {iptTitleVal, txtAraBriefVal, uploaded, uploadPicName, collegeChanged, schoolName, collegeVal, showUserAndTopicInfo, 
			collegeList, familyList, topicClassifyList} = data;
		iptTitleVal && this.$el.find("#topicTitle").val(iptTitleVal);
		txtAraBriefVal && this.$el.find("#topicBrief").val(txtAraBriefVal);
		if(uploaded) {
			const dataTxt = "更新";
			this.$el.find("#file").text("");
			this.$el.find("#file").append(dataTxt);
			this.$el.find("#fileName").text("");
			this.$el.find("#fileName").append(uploadPicName);
		}
		if(collegeChanged) {
			this.$el.find("#dialogCollegeList").val(collegeVal);
		}
		this.renderMultiSelect();
		topicClassifyList && this.renderClassifySelect();
	}
});



let Add = function(options) {
	this.options = options;
	this.view = new View();	
	let that = this;
	this.dialog = new Dialog({
		title: '新增话题',
		type: 4,
		content: that.view.el,
		ok: function() {
			var params = common.getFormData({formId: 'form'});
			let college = this.$el.find('#dialogCollegeList input[name="selectedItemsText"]').val();
			if(!college) {
				college = "-1";
			}
			let family = this.$el.find('#dialogFamilyList input[name="selectedItemsText"]').val();
			if(!family) {
				family = "-1";
			}
			let roundIds = this.$el.find('#form #roundIds').val();
			var isShow = +($("#form").find("input[name='isShow']:checked").val());

			let {mediaLinks} = that.view.model.attributes;
			//话题类型
			const classifyNameList = this.$el.find('#topicClassifyAddDialog input[name="selectedItemsText"]').val();
			//话题类型入参
			const classifyIdList = that.view.formatTopicClassify(this.$el.find('#topicClassifyAddDialog input[name="selectedItemsValue"]').val());
			if(!classifyNameList) {
				alert("请选择话题类型");
				return false;
			}
			Object.assign(params, {isShow},  {college}, {family}, {mediaLinks}, {roundIds}, {classifyIdList});
			let hasUploaded = Boolean(this.$el.find("#fileName").html());
			if(hasUploaded) {
				if(that.view.validateUserLocOrRoundsId(college, family, roundIds)) {
					service.addSelectedTopics(params, $.proxy(function(response) {
						if(response.rs) {
							alert('新增成功!');
							if(typeof that.options.onSuccess == 'function') {
								that.options.onSuccess({pageSize: 50, pageNo: 1});
							}
							this.closeDialog();
						} else {
							alert(response.rsdesp);
						}
					}, this))
				}	
			} else {
				alert("请上传话题底图！");
			}
		}
	});
};

export {Add};