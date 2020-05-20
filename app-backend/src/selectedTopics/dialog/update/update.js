import { service } from '../../../common/service'
import { common } from '../../../common/common'
import { Dialog } from '../../../components/dialog/index'
import { Select as MultiSelect } from '../../../components/multiSelect/index'
import { Select } from '../../../components/select/index'

const tpl = require('./update.html')

const Model = Backbone.Model.extend({
    defaults: {
        uploaded: false,
        userClass: 'hidden',
        hideChecked: '',
        showChecked: 'checked',
        freeUserChecked: '',
        payingUserChecked: '',
        allUserChecked: 'checked',
        showUserAndTopicInfo: false,
        topicClassifyList: [],
    },
})

const View = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        const itm = options
        this.model.set(itm)
        this.initiaCollegeList()
        this.initiaUserType()
        const schoolName = itm.college
        if (schoolName && schoolName !== '全部') {
            this.initiaFamilyList({ schoolName })
        }
        this.listenTo(this.model, 'change:showUserAndTopicInfo', this.render)
        this.listenTo(this.model, 'change:familyList', this.render)
        this.listenTo(this.model, 'change:collegeList', this.render)
        this.listenTo(this.model, 'change:topicClassifyList', this.render)
        this.getTopicClassify()
        this.render()
    },

    events: {
        'click #freeUser': 'renderUserAndTopicInfo',
        'click #payingUser': 'renderUserAndTopicInfo',
        'click #allUser': 'renderUserAndTopicInfo',
        'click #file': 'uploadPic',
        "click input[name='isShow']": 'getRadioChecked',
        'blur #roundIds': 'checkRoundIds',
    },

    initiaUserType() {
        let {
            userType, showUserAndTopicInfo, payingUserChecked, freeUserChecked, allUserChecked, userClass,
        } = this.model.toJSON()
        switch (userType) {
        case 1:
            showUserAndTopicInfo = true
            payingUserChecked = 'checked'
            freeUserChecked = ''
            allUserChecked = ''
            userClass = 'red'
            break
        case 0:
            showUserAndTopicInfo = false
            freeUserChecked = 'checked'
            payingUserChecked = ''
            allUserChecked = ''
            userClass = 'hidden'
            break
        case 2:
            showUserAndTopicInfo = false
            allUserChecked = 'checked'
            freeUserChecked = ''
            payingUserChecked = ''
            userClass = 'hidden'
            break
        default:
            break
        }
        this.model.set({
            showUserAndTopicInfo,
            payingUserChecked,
            freeUserChecked,
            allUserChecked,
            userClass,
        })
    },

    getRadioChecked(e) {
        let { isShow } = this.model.toJSON()
        const iptRdoVal = $(e.currentTarget).val()
        if (!+iptRdoVal) {
            isShow = false
        } else {
            isShow = true
        }
        this.model.set({ isShow })
    },

    checkRoundIds() {
        const roundIds = this.$el.find('#roundIds').val()
        if (roundIds) {
            service.checkRoundIdList({ roundIds }, response => {
                if (response.rs) {
                    if (response.resultMessage instanceof Array && response.resultMessage.length) {
                        const noRoundIdList = response.resultMessage.toString()
                        alert('您输入的轮次id不存在,请检查后重新填写～')
                        this.$el.find('#roundIds').val('')
                    }
                } else {
                    alert(response.rsdesp)
                }
            })
        }
    },

    uploadPic() {
        let { uploaded } = this.model.toJSON()
        common.picUploaderNew(upSuccess => {
            const mediaLinks = upSuccess.resultMessage[0].linkUrl || ''
            const width = upSuccess.resultMessage[0].width || ''
            const height = upSuccess.resultMessage[0].height || ''
            if (width * 6 != height * 11) {
                alert('图片长宽比需为11:6')
            } else {
                this.$el.find('#file').text('')
                const dataTxt = '更新'
                this.$el.find('#file').append(dataTxt)
                uploaded = true
                this.model.set({ uploaded, mediaLinks })
            }
            this.model.set({ mediaLinks })
        }, files => {
            const uploadPicName = files.name || ''
            const uploadPicSize = files.size || ''

            if (uploadPicSize > 1048576) {
                alert('图片大小需在1M以内！')
            } else {
                this.$el.find('#fileName').text('')
                this.$el.find('#fileName').append(uploadPicName)
                uploaded = true
                this.model.set({ uploadPicName, uploaded })
            }
        })
    },

    renderUserAndTopicInfo(e) {
        let {
            showUserAndTopicInfo, freeUserChecked, payingUserChecked, allUserChecked, userClass, college, family,
        } = this.model.toJSON()
        const $val = $(e.currentTarget).attr('value')

        switch (+$val) {
        case 1:
            showUserAndTopicInfo = true
            payingUserChecked = 'checked'
            freeUserChecked = ''
            allUserChecked = ''
            userClass = 'red'
            break
        case 0:
            showUserAndTopicInfo = false
            freeUserChecked = 'checked'
            payingUserChecked = ''
            allUserChecked = ''
            userClass = 'hidden'
            break
        case 2:
            showUserAndTopicInfo = false
            allUserChecked = 'checked'
            freeUserChecked = ''
            payingUserChecked = ''
            userClass = 'hidden'
            break
        default:
            break
        }
        this.model.set({
            showUserAndTopicInfo,
            freeUserChecked,
            payingUserChecked,
            allUserChecked,
            userClass,
        })
        this.renderMultiSelect()
    },

    formatTopicClassify(str) {
        let arr = []
        if (str) {
            arr = str.indexOf('0') !== -1 ? [0] : str.split(',')
        }
        const resultArr = []
        arr.forEach((item, index) => {
            resultArr.push(+item)
        })
        return resultArr
    },

    covertTextToVal(arr, text) {
        const l = arr.length
        for (let i = 0; i < l; i++) {
            if (arr[i].text == text) {
                return arr[i].value
            }
        }
    },

    initiaCollegeList() {
        const params = {}
        const that = this
        service.getSelectedCollegeList(params, response => {
            if (response.rs) {
                let collegeList = response.resultMessage
                collegeList = that.formatCollegeListOrFamilyList(collegeList, 1)
                that.model.set({
                    collegeList,
                })
            } else {
                alert('用户归属中学院列表加载失败！请刷新重试。')
            }
        })
    },

    initiaFamilyList(text) {
        const that = this
        let { collegeChanged } = this.model.toJSON()
        let params
        if (typeof text === 'string') {
            // select onChecked回调
            params = { schoolName: text }
            if (text) {
                const collegeCallBackParams = { schoolName: text }
                this.model.set({
                    collegeCallBackParams,
                })
            }

            collegeChanged = true
        } else {
            params = { schoolName: text.schoolName }
            collegeChanged = false
        }
        service.getSelectedFamilyList(params, response => {
            if (response.rs) {
                let familyList = response.resultMessage
                familyList = that.formatCollegeListOrFamilyList(familyList, 2)
                that.model.set({
                    familyList,
                    collegeChanged,
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    formatCollegeListOrFamilyList(list, flag) {
        /*
		**@flag
		** flag==1 *** 格式化collegeList
		** flag==2 *** 格式化familyList
		*/
        const arr = []
        if (list) {
            list.unshift('全部')
            list.forEach((item, index) => {
                const value = index
                if (flag == 1) {
                    const collegeListItem = item
                    arr.push(Object.assign({}, { value }, { collegeListItem }))
                } else if (flag == 2) {
                    const familyListItem = item
                    arr.push(Object.assign({}, { value }, { familyListItem }))
                }
            })
        }
        return arr
    },

    validateUserLocOrRoundsId(college, family, roundIds) {
    	const { showUserAndTopicInfo } = this.model.toJSON()
    	if (showUserAndTopicInfo) {
	    	if (roundIds) {
	    		return true
	    	}
	    		if (college && family) {
	    			return true
	    		}
	    			if (!college) {
	    				alert('请选择学院！')
	    				return false
	    			}
	    			if (!family) {
	    				alert('请选择家族！')
	    				return false
	    			}
    	}
    	return true
    },

    convertToSelectList(data, dataList = [], flag) {
        // @params: flag=1***collegeList
        // @params: flag=2***familyList
        const arr = []
        dataList.forEach((item, index) => {
        	if (flag === 1) {
	       		arr.push({
	                value: item.value,
	                text: item.collegeListItem,
		        })
        	} else if (flag === 2) {
       			// 'E_O_F'是每个学院下家族列表的结尾
    			if (item.familyListItem == 'E_O_F') {
	       			arr.push({
			            value: item.value,
			            text: item.familyListItem,
			            divider: true,
			        })
        		} else {
	       			arr.push({
		                value: item.value,
		                text: item.familyListItem,
		            })
       			}
        	}
        })

        // select下拉list checkbox回显选中
        if (arr.length) {
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
	        	const sourceArr = data.split(',')
	        	const sourceLength = sourceArr.length
	        	const arrLength = arr.length
	        	for (let i = 0; i < sourceLength; i++) {
	        		for (let j = 0; j < arrLength; j++) {
	        			if (sourceArr[i] == arr[j].text) {
	        				arr[j].checked = 'checked'
	        			}
	        		}
	        	}
	        }

        return arr
    },

    convertToRedisplayList(temptList, classifyIds) {
        if (classifyIds) {
            if (temptList.length > 1) {
                if (classifyIds.indexOf(',') == -1) {
                    // 单个话题类型
                    for (let i = 0; i < temptList.length; i++) {
                        if (temptList[i].value == classifyIds) {
                            temptList[i].checked = 'checked'
                        }
                    }
                } else {
                    // 多个话题类型
                    const classifyIdsArr = classifyIds.split(',')
                    for (let i = 0; i < temptList.length; i++) {
                        for (let j = 0; j < classifyIdsArr.length; j++) {
                            if (temptList[i].value == classifyIdsArr[j]) {
                                temptList[i].checked = 'checked'
                            }
                        }
                    }
                }
            }
        }
        return temptList
    },

    getTopicClassify() {
        const params = {
            userAccount: window.userInfo.userAccount,
        }
        service.getTopicClassify(params, response => {
            if (response.rs) {
                const resultList = response.resultMessage || []
                this.model.set({
                    topicClassifyList: resultList,
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    convertClassifyListToSelectList(list) {
        const arr = []
        list.forEach((item, index) => {
            arr.push({
                value: item.classifyId,
                text: item.classifyName,
            })
        })
        // arr.unshift({
        // 	value: 0,
        // 	text: '全部'
        // });
        return arr
    },

    renderClassifySelect() {
        const { topicClassifyList, classifyIds } = this.model.toJSON()
        const temptList = this.convertClassifyListToSelectList(topicClassifyList)
        const list = this.convertToRedisplayList(temptList, classifyIds)
        this.classifySelect = new Select({
            el: this.$el.find('#topicClassifyUpdateDialog')[0],
            itemList: list,
            name: 'topicClassifyAddDialog',
            selectedItemsText: '请选择话题分类',
        })
    },

    renderMultiSelect() {
    	const {
            showUserAndTopicInfo, collegeList, college, familyList, family, collegeCallBackParams,
        } = this.model.toJSON()
    	if (showUserAndTopicInfo) {
            let collegeSelectList = this.convertToSelectList(college, collegeList, 1)
            if (collegeCallBackParams) {
                const { schoolName } = collegeCallBackParams
    			collegeSelectList = this.convertToSelectList(schoolName, collegeList, 1)
            }
            this.collegeSelect && this.collegeSelect.undelegateEvents()
            this.collegeSelect = new MultiSelect({
                el: this.$el.find('#dialogCollegeList')[0],
                itemList: collegeSelectList,
                name: 'collegeList',
                selectedItemsText: '请选择学院',
                onChecked: this.initiaFamilyList.bind(this),
            })

            const familySelectList = this.convertToSelectList(family, familyList, 2)
            this.familySelect && this.familySelect.undelegateEvents()
            this.familySelect = new MultiSelect({
                el: this.$el.find('#dialogFamilyList')[0],
                itemList: familySelectList,
                name: 'familyList',
                selectedItemsText: '请选择家族',
            })
        } else {
    		this.$el.find('#dialogCollegeList').empty()
    		this.$el.find('#dialogFamilyList').empty()
    	}
    },

    format(data) {
        // 话题状态-radio
        let { isShow, hideChecked, showChecked } = data
        hideChecked = isShow == false ? 'checked' : ''
        showChecked = isShow == true ? 'checked' : ''
        Object.assign(data, { hideChecked }, { showChecked })
        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
        const {
            upFileName, uploaded, collegeChanged, showUserAndTopicInfo, schoolName, collegeVal, roundIds, topicClassifyList,
        } = data
        if (uploaded) {
            this.$el.find('#fileName').text('')
            this.$el.find('#fileName').append(upFileName)
        }

        if (collegeChanged) {
            this.$el.find('#dialogCollegeList').val(collegeVal)
            this.$el.find('#dialogFamilyList').val('0')
        }
        this.renderMultiSelect()
        topicClassifyList && this.renderClassifySelect()
        if (roundIds) {
            this.$el.find('#roundIds').val(roundIds)
        }
    },

})

const Update = function (options) {
    const that = this
    const { itm, topicId, topicOwner } = options
    this.options = options
    // const data = this.view.model.toJSON();
    // itm && this.view.model.set(Object.assign({}, itm, data));
    this.view = new View(itm)
    this.dialog = new Dialog({
        title: '更新话题',
        type: 4,
        content: that.view.el,
        ok() {
            const params = common.getFormData({ formId: 'form' })
            let college = this.$el.find('#dialogCollegeList input[name="selectedItemsText"]').val()
            if (!college) {
                college = '-1'
            }
            let family = this.$el.find('#dialogFamilyList input[name="selectedItemsText"]').val()
            if (!family) {
                family = '-1'
            }
            const roundIds = this.$el.find('#form #roundIds').val()
            const isShow = +($('#form').find("input[name='isShow']:checked").val())

            // 话题类型
            const classifyNameList = this.$el.find('#topicClassifyUpdateDialog input[name="selectedItemsText"]').val()
            // 话题类型入参
            const classifyIdList = that.view.formatTopicClassify(this.$el.find('#topicClassifyUpdateDialog input[name="selectedItemsValue"]').val())
            if (!classifyNameList) {
                alert('请选择话题类型')
                return false
            }

            const { mediaLinks } = that.view.model.attributes
            const updateParams = {
                ...params,
                topicId,
                isShow,
                college,
                family,
                mediaLinks,
                roundIds,
                classifyIdList,
                topicOwner,
            }
            if (that.view.validateUserLocOrRoundsId(college, family, roundIds)) {
                service.updateSelectedTopics(updateParams, $.proxy(function (response) {
                    if (response.rs) {
                        alert('更新成功!')
                        if (typeof that.options.onSuccess === 'function') {
                            that.options.onSuccess({ pageSize: 50, pageNo: 1 })
                        }
                        this.closeDialog()
                    } else {
                        alert(response.rsdesp)
                    }
                }, this))
            }
        },
    })
}

export { Update }
