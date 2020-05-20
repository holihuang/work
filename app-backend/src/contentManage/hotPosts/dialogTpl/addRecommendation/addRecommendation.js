import { Dialog } from '../../../../components/dialog/index'
import { Select } from '../../../../components/select/index'
import { Select as MultiSelect } from '../../../../components/multiSelect/index'
import { validate } from '../../../../common/validate'
import { service } from '../../../../common/service'
import { common } from '../../../../common/common'
import { PostsListItm } from '../../itemlists/index'

const tpl = require('./addRecommendation.html')

const Model = Backbone.Model.extend({
    defaults: {
        collegeChanged: false,
        isShowTopicNameFlag: false, // 标志：查询(依据posterMasterId)列表结果没有数据
        topicNameList: [],
        recTopicNameList: [],
        collegeList: [],
        familyList: [],
        uploaded: false, // 是否上传标志位
    },
})

const AddRec = Backbone.View.extend({

    initialize(options) {
        this.model = new Model()
        this.options = options
   		const { isShowTopicName, type } = options
	    // this.listenTo(this.model, 'change:isShowTopicName', this.render);
	    this.listenTo(this.model, 'change:isShowTopicNameFlag', this.render)
	    this.listenTo(this.model, 'change:collegeList', this.render)
	    this.listenTo(this.model, 'change:familyList', this.render)

	    this.initiaCollegeList()
	    this.model.set({
	    	isShowTopicName,
	    	type,
	    })
        this.render()
        this.listenTo(this.model, 'change:topicNameList', this.render)
        this.listenTo(this.model, 'change:recTopicNameList', this.render)
        this.initiaRecTopicNameList()
        this.initiaSelect()
    },

    events: {
        'click #beginTime': 'dataTimeShow',
        'click #endTime': 'dataTimeShow',
        'input #postMasterId': 'isDetailTopicNameList',
        'change #skipTo': 'toggleContentDetail',
        'click .uploadPicBtn': 'uploadPic',
        'input .contentDetail': 'deleteInvalidateValue',
        'blur .contentDetail': 'checkUrl',
    },

    deleteInvalidateValue(e) {
        const skipIdVal = $(e.currentTarget).val()
        const type = +this.$el.find('#skipTo option:selected').val()
        if (type === 1 || type === 3 || type === 5) {
            const reg = new RegExp('^[0-9]*$')
            if (!reg.test(skipIdVal)) {
                $(e.currentTarget).val('')
            }
        }
    },

    checkUrl(e) {
        const skipIdVal = $(e.currentTarget).val().trim()
        const type = +this.$el.find('#skipTo option:selected').val()
        if (type === 4 && skipIdVal) {
            if (!validate.isUrlPrefix(skipIdVal)) {
                $(e.currentTarget).val('')
            }
        }
    },

    uploadPic(e) {
        common.picUploaderNew(onSuccess => {
            const { width = '', height = '', linkUrl } = onSuccess.resultMessage[0]
            this.$el.find('.uploadPicBtn').text('更新图片').prop('disabled', false)
            if (width * 220 != height * 750) {
                alert('上传图片尺寸需为750*220')
                return false
            }
            this.model.set({
                uploaded: true,
                contentPic: linkUrl,
            })
            this.$el.find('#contentPic').val(linkUrl)
        },	onChange => {
            const { size = '' } = onChange
            if (size > 500 * 1024) {
                alert('图片大小需在500K以内！')
                return false
            }
            this.$el.find('.uploadPicBtn').text('上传中...').prop('disabled', true)
        })
    },

    toggleContentDetail() {
        const selectedOptionValue = this.$el.find('#skipTo option:selected').val()
        this.caseOption(selectedOptionValue)
    },

    caseOption(opt) {
        this.$el.find('.content-detail').removeClass('hide')
        this.$el.find('.form-group-topicname').addClass('hide')
        this.$el.find('.form-group-pageTitle').addClass('hide')
        this.$el.find('.form-group-upload').removeClass('hide')
        this.$el.find('#collegeFamilyWrapper').removeClass('hide')
        this.$el.find('.uploadedAsterisk').addClass('hide')

        this.$el.find(".content-detail input[name='contentDetail']").removeAttr('maxlength')


        let placeholderText,
            inputId
        if (opt == '1') {
            placeholderText = '请输入帖子id'
            inputId = 'postMasterId'
            this.$el.find('.form-group-topicname').removeClass('hide')
        } else if (opt == '2') {
            placeholderText = '请输入话题名称'
            inputId = 'topicNameInput'
        } else if (opt == '3') {
            placeholderText = '请输入用户userid'
            inputId = 'userIdInput'
        } else if (opt == '4') {
            placeholderText = '请输入完整url（以http/https/ftp开头）'
            inputId = 'pageUrl'
            this.$el.find('.form-group-pageTitle').removeClass('hide')
            this.$el.find('.uploadedAsterisk').removeClass('hide')
        } else if (opt == '5') {
            placeholderText = '请输入问题ID'
            inputId = 'questionId'
            this.$el.find('.form-group-upload').addClass('hide')
            this.$el.find('#collegeFamilyWrapper').addClass('hide')
        } else if (+opt === 7) {
            placeholderText = '请输入推荐小程序名称'
            inputId = 'skipTitle'
            this.$el.find(".content-detail input[name='contentDetail']").attr('maxlength', '20')
            this.$el.find('.uploadedAsterisk').removeClass('hide')
        }

        this.toggleShowMiniProgramItem(opt)

        this.$el.find(".content-detail input[name='contentDetail']").attr('placeholder', `${placeholderText}`)
        this.$el.find(".content-detail input[name='contentDetail']").attr('id', `${inputId}`).val('')
    },

    toggleShowMiniProgramItem(value) {
        if (+value === 7) {
            this.$el.find('.form-group-miniProgram').removeClass('hide')
        } else {
            this.$el.find('.form-group-miniProgram').addClass('hide')
        }
    },

    dataTimeShow(e) {
    	let selector = $(e.currentTarget).attr('id')
    	selector = `#${selector}`
        this.$el.find(selector).datetimepicker('show')
    },

    isDetailTopicNameList() {
        const { isShowTopicName } = this.model.toJSON()
        if (isShowTopicName) {
            this.initTopicNameList()
        }
    },

    initTopicNameList() {
        const postMasterId = this.$el.find('#postMasterId').val()
        let { isShowTopicNameFlag } = this.model.toJSON()
        const isPage = 0
        if (postMasterId.length) {
            const params = { postMasterId, isPage }
            let { topicNameList } = this.model.toJSON()
            service.getTopicNameList(params, response => {
                if (response.rs) {
                    if (response.hasOwnProperty('resultMessage')) {
                        if (response.resultMessage && response.resultMessage.resultList) {
                            topicNameList = response.resultMessage.resultList
                            this.model.set({
                                postMasterId,
                                topicNameList,
                            })
                        }
                    } else {
                        isShowTopicNameFlag = true
                        this.model.set({
                            postMasterId,
                            isShowTopicNameFlag,
                        })
                    }
                } else {
			    	alert('获取话题名称下拉列表选项失败，请刷新重试！')
			    }
            })
        }
    },

    initiaRecTopicNameList() {
        const params = { isPage: 0 }
        service.getTopicNameList(params, response => {
            if (response.rs) {
                const { resultList = [] } = response.resultMessage
                this.model.set({
                    recTopicNameList: resultList,
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    initFromValue(options) {
        // 时间选择框
        this.$el.find('#beginTime').datetimepicker({
            format: 'yyyy-mm-dd hh:00:00',
		    autoclose: true,
		    todayBtn: true,
		    minView: 'day',
        })
        this.$el.find('#endTime').datetimepicker({
	      format: 'yyyy-mm-dd hh:00:00',
	      autoclose: true,
	      todayBtn: true,
	      minView: 'day',
	    })
	    $('#pageNoDialog').on('keydown', e => {
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
                return
            }
            const pageNoKeyCodeList = [49, 50, 51, 52, 53, 97, 98, 99, 100, 101]
            const len = $('#pageNoDialog').val().length
	    	if ($.inArray(e.keyCode, pageNoKeyCodeList) == -1 || len) {
                e.preventDefault()
            }
	    })

	  	$('#ranking').on('keydown', e => {
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
	  				return
	  		}

	  		const rankingKeyCodeList = [49, 50, 51, 52, 53, 54, 55, 56, 57,
	  								97, 98, 99, 100, 101, 102, 103, 104, 105]
	  		const len = $('#ranking').val().length
	      	if ($.inArray(e.keyCode, rankingKeyCodeList) == -1 || len) {
	  			e.preventDefault()
	  		}
	  	})

        // 设置默认时间
        const date = new Date()
        const y = date.getFullYear()
        const m = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
        const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
        const h = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`
        this.$el.find('#beginTime').val(`${y}-${m}-${day} ${h}:00:00`)

        const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const endY = endDate.getFullYear()
        const endM = endDate.getMonth() + 1 > 9 ? endDate.getMonth() + 1 : `0${endDate.getMonth() + 1}`
        const endDay = endDate.getDate() > 9 ? endDate.getDate() : `0${endDate.getDate()}`
        const endH = endDate.getHours() > 9 ? endDate.getHours() : `0${endDate.getHours()}`
        this.$el.find('#endTime').val(`${endY}-${endM}-${endDay} ${endH}:00:00`)
    },

    initiaSelect() {
        this.$el.find('#skipTo').val('1')
    },

    convertFamilyObjectListToFamilyObject(list = []) {
        const resultList = []
        list.forEach((item, index) => {
            resultList.push(`${item.family}-${item.college}`)
        })
        return resultList
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

    getMiniProgramParams() {
        const iptArr = [...this.$el.find('.miniProgramIpt')]
        const obj = {}
        iptArr.forEach(item => {
            const { id, value } = item
            obj[id] = value
        })
        return obj
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
                    ...this.getMiniProgramParams(),
                })
            }

            collegeChanged = true
        } else {
            params = { schoolName: '全部' }
            collegeChanged = false
        }

        service.listFamilyByColleges(params, response => {
            if (response.rs) {
                let familyList = response.resultMessage
                familyList = that.convertFamilyObjectListToFamilyObject(familyList)
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

    arrToObjArr(list = [], flag) {
        // @params: flag=1***collegeList
        // @params: flag=2***familyList
        const arr = []
        list.forEach((item, index) => {
        	if (flag === 1) {
        		arr.push({
		            value: item.value,
			        text: item.collegeListItem,
			    })
        	} else if (flag === 2) {
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
        return arr
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
       			arr.push({
	                value: item.value,
	                text: item.familyListItem,
	            })
       		}
        })

        // select下拉list checkbox回显选中
        if (arr.length) {
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

    renderCollegeAndFamilySelect() {
    	const { collegeList, familyList, collegeCallBackParams } = this.model.toJSON()
    	let collegeObjList = this.arrToObjArr(collegeList, 1)
    	if (collegeCallBackParams) {
    		const { schoolName } = collegeCallBackParams
    		collegeObjList = this.convertToSelectList(schoolName, collegeList, 1)
    	}

        this.collegeSelect && this.collegeSelect.undelegateEvents()
        this.collegeSelect = new MultiSelect({
            el: this.$el.find('#collegeWrapper')[0],
            itemList: collegeObjList,
            name: 'collegeList',
            selectedItemsText: '请选择学院',
            onChecked: this.initiaFamilyList.bind(this),
        })

        const familyObjList = this.arrToObjArr(familyList, 2)
        this.familySelect && this.familySelect.undelegateEvents()
        this.familySelect = new MultiSelect({
            el: this.$el.find('#familyWrapper')[0],
            itemList: familyObjList,
            name: 'familyList',
            selectedItemsText: '请选择家族',
        })
    },

    renderDialogSelect(topicNameList = [], id) {
        const list = this.convertToValTxtObj(topicNameList)
        // this.topicNameSelect && this.topicNameSelect.undelegateEvents();
	    id == '#dialogTopicName' ? (
	    	this.topicNameSelect = new Select({
	        	el: this.$el.find(id)[0],
	        	itemList: list,
	        	name: 'dialogTopicName',
	        	selectedItemsText: '全部',
	    	})
	    ) : (
	    	this.recToTopicNameSelect = new Select({
	        	el: this.$el.find(id)[0],
	        	itemList: list,
	        	name: 'dialogRecTopicName',
	        	selectedItemsText: '全部',
	    	})
	    )
    },

    convertToValTxtObj(list) {
	    const arr = []
	    list.forEach((item, index) => {
	      arr.push({
	        value: item.topicId,
	        text: item.topicTitle,
	        checked: item.checked,
	      })
	    })
	    return arr
    },

    formatTopicNameList(topicNameList = [], checkedItemValues) {
        const targetArr = checkedItemValues ? checkedItemValues.split(',') : []
        for (let i = 0; i < topicNameList.length; i++) {
            for (let j = 0; j < targetArr.length; j++) {
                if (topicNameList[i].topicId == targetArr[j]) {
                    topicNameList[i].checked = 'checked'
                }
            }
        }
        return topicNameList
    },

    // to do
    // 话题详情页-新增新需求暂时不开通前端权限-隐藏本次开发的需求
    hideDialogOfNewDeveloped(type) {
        // @params {String} type
        // type == '2' ** 热门推荐位置=话题详情页
        // type == '3' ** 热门推荐位置=问答
        this.$el.find('#collegeFamilyWrapper').addClass('hide')
        this.$el.find('.form-group-rectopicname').addClass('hide')
        this.$el.find('.form-group-upload').addClass('hide')
        if (type == '3') {
            this.$el.find('#skipTo').val('5').prop('disabled', 'disabled')
            this.$el.find(".content-detail input[name='contentDetail']").attr('placeholder', '请填写问题ID').val()
            this.$el.find('.form-group-topicname').addClass('hide')
        } else if (type == '2') {
            this.$el.find('#skipTo').val('1').prop('disabled', 'disabled')
            this.$el.find(".content-detail input[name='contentDetail']").attr('placeholder', '请输入帖子id').val()
            this.$el.find('.form-group-topicname').removeClass('hide')
        }
        // this.$el.find(".form-group-skiptype").addClass("hide");
    },
    // to do
    // 话题详情页-新增新需求暂时不开通前端权限-隐藏本次开发的需求
    hideAddDialogOfNewDeveloped() {
        this.$el.find('.form-group-rectopicname').addClass('hide')
    },

    render() {
        const data = this.model.toJSON()
        // 判断“素材跳转页面位置”选中的选项
        const skipToSelectedOption = this.$el.find('#skipTo option:selected').val() || '0'
        const contentDetailText = this.$el.find(".content-detail input[name='contentDetail']").val()
        // 话题名称 || 推荐至话题 选中项
        const checkedTopicNameListValues = this.$el.find("#dialogTopicName input[name='selectedItemsValue']").val()
        const checkedDialogRecTopicNameValues = this.$el.find("#dialogRecTopicName input[name='selectedItemsValue']").val()
        const pageNoDialogText = this.$el.find('#pageNoDialog').val()
        const rankingText = this.$el.find('#ranking').val()
        // 开始结束时间选择项内容
        const beginTime = this.$el.find('#beginTime').val()
        const endTime = this.$el.find('#endTime').val()
        // 页面标题
        const skipTitle = this.$el.find('#pageTitle').val()
        this.$el.html(tpl(data))
        // 调用dialogTopicNameSelect-API
        const {
            topicNameList, recTopicNameList, postMasterId, collegeChanged, uploaded, collegeVal, type, contentPic,
        } = data


        // if(topicNameList) {
        // 	const formattedTopicNameList = this.formatTopicNameList(topicNameList, checkedItemValues);
        // 	this.renderDialogSelect(formattedTopicNameList, "#dialogTopicName");
        // }
        // 话题名称数据回填
        topicNameList && this.renderDialogSelect(this.formatTopicNameList(topicNameList, checkedTopicNameListValues), '#dialogTopicName')
        // 推荐至话题数据回填
        recTopicNameList && this.renderDialogSelect(this.formatTopicNameList(recTopicNameList, checkedDialogRecTopicNameValues), '#dialogRecTopicName')

        // 页面标题回显
        skipTitle && this.$el.find('#pageTitle').val(skipTitle)

        this.initFromValue()
        postMasterId && this.$el.find('#postMasterId').val(postMasterId)
        if (collegeChanged) {
            this.$el.find('#collegeWrapper').val(collegeVal)
        }
        // 话题推荐位置：话题详情页下，手动选中“素材跳转页面位置”，“帖子详情页”选项
        this.$el.find('#skipTo').val(skipToSelectedOption)
        this.toggleContentDetail()
        this.$el.find(".content-detail input[name='contentDetail']").val(contentDetailText)
        this.$el.find(".content-detail input[name='contentDetail']").focus()
        // 上传图片
        if (uploaded) {
            this.$el.find('.uploadPicBtn').text('更新图片')
            this.$el.find('#contentPic').val(contentPic)
        }
        // 帖子位置：页(多次渲染中的数据回填)
        pageNoDialogText && this.$el.find('#pageNoDialog').val(pageNoDialogText)
        // 帖子位置：位(多次渲染中的数据回填)
        rankingText && this.$el.find('#ranking').val(rankingText)
        // 开始结束时间（多次渲染）
        beginTime && this.$el.find('#beginTime').val(beginTime)
        endTime && this.$el.find('#endTime').val(endTime)
        // 用户归属-学院|家属
        this.renderCollegeAndFamilySelect();

        // to do
        // 话题详情页-新增新需求暂时不开通前端权限-隐藏本次开发的需求
        (type == '2' || type == '3') && this.hideDialogOfNewDeveloped(type)
        // to do
        // 话题详情页-新增新需求暂时不开通前端权限-隐藏本次开发的需求
        type == '1' && this.hideAddDialogOfNewDeveloped()
    },
})

export { AddRec }
