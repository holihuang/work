import React from 'react'
import ReactDom from 'react-dom'
import moment from 'moment';
import {common} from '../../../common/common';
import {service} from '../../../common/service';
import {Dialog} from '../../../components/dialog/index';
import {Items} from './items/index';
import tpl from './tpl.html';
import cfg from '../cfg'
import WxPushModal from '../modal/wxPushModal'

const LOGS = {
    UPDATE: '更新',
    DELETE: '删除',
    COMMIT: '提交',
    CHECKED: '审核通过',
    UNCHECKED: '审核驳回',
    ONLINE: '上线',
    OFFLINE: '下线',
    SYSTEM: '下线'
}

//const PIC_SIZE = {
//    1: '图片尺寸为750*420，大小<60k，格式jpg/png',
//    2: '图片尺寸为750*1136，大小不超过1M',
//    3: '图片尺寸为600*800，大小不超过1M',
//}

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
}

const Model = Backbone.Model.extend({
    defaults: {
        type: 1,  //默认为1，表示新增；2-编辑；3-审核；4-查看
        skipType: 3, //默认是选中跳转到url
        userType: 2, //默认是全部用户
        nativePages: [],
        collegeList: [], //所有学院列表
        family: {ALL: 'ALL'}, //对于付费用户，选择了部分学院，选择的家族数据
        professionList: {}, // 专业
        corps: '', //对于免费用户，选择的军团数据
        logs: [], //对于审核的查看状态，需要展示该条记录的操作日志
        firstProject: [], // 一级项目
        firstProjectSel: [], // 一级项目
        secProjectList: [], // 二级项目
    },
})

const View = Backbone.View.extend({
    initialize(options) {
        const { onReview, onSubmit, onCancel, type = 1, infoId, infoType } = options
        this.onReview = onReview
        this.onSubmit = onSubmit
        this.onCancel = onCancel
        this.model = new Model({
            type,
            infoId,
            infoType,
        })

        // 每种情况nativePages都会变化，所以用这个变量来监听。
        // 不监听整个model是为了防止意外render
        this.listenTo(this.model, 'change:nativePages', this.render)
        this.listenTo(this.model, 'change:firstProjectSel', this.render)
        this.render()

        this.initData()
        // this.getFirstProjectList()
        this.miniProgressModal = false
    },

    events: {
        'focus #startTime': 'showSTdatetimepicker',
        'focus #endTime': 'showETdatetimepicker',
        'click #uploadPicBtn': 'uploadPic',
        'change [name="skipType"]': 'handleSkipTypeChange',
        'change [name="skipName"]': 'handleSkipNameChange',
        'change [name="userType"]': 'handleUserTypeChange',
        // 'change [name="skipType"]': 'handleSkipTypeChange',
        // 'change [name="skipName"]': 'handleSkipNameChange',
        'change [name="collegeRadioIpt"]': 'handleCollegeChange',
        'click #addCollegeBtn': 'addCollege',
        'click #addProfessionBtn': 'addProfession',
        'click .removeCollegeBtn': 'removeCollege',
        'click .removeProfessionBtn': 'removeProfession',
        'click #reviewPassedBtn': 'reviewPassed',
        'click #reviewRejectedBtn': 'reviewRejected',
        'click #submitBtn': 'submit',
        'click #cancelBtn': 'cancel',
        'click #showWxPushModalBtn': 'showWxPushModal'
    },

    initData() {
        const { type } = this.model.toJSON()
        // debugger
        switch (type) {
        case 1: // 新增
            // 获取所有原生页面和所有学院
            Promise.all([
                this.getAllNativePage(),
                this.getAllCollege(),
                this.getFirstProjectList(),
            ]).then((values) => {
                this.model.set({
                    nativePages: values[0],
                    collegeList: values[1],
                    firstProject: values[2],
                    firstProjectSel: values[2].map(item => item.firstProjectValue),
                })
            })
            break
        case 2: // 编辑
            // 获取详情、获取nativepages和学院列表
            Promise.all([
                this.getOptInfo(),
                this.getAllNativePage(),
                this.getAllCollege(),
                this.getFirstProjectList(),
            ]).then((values) => {
                this.model.set({
                    ...values[0],
                    nativePages: values[1],
                    collegeList: values[2],
                    firstProject: values[3],
                    firstProjectSel: values[3].map(item => item.firstProjectValue),
                })

                // 如果是编辑的话，需要初始化选择的学院和军团的数据
                const { corps, family, secondProject } = this.model.toJSON()
                if (corps) {
                    // 说明是军团，此时需要请求军团数据，并初始化
                    this.listAllCorps()
                }
                if (family) {
                    // 说明是学院和家族，一个个获取选择的学院的数据
                    if (family['ALL']) {
                        // 说明是选择了全部学院
                        return
                    }

                    for (let k in family) {
                        this.listFamilyByCollege(k, family[k])
                    }
                }

                if (secondProject) {
                    if (secondProject['ALL']) {
                        // 说明是选择了全部专业
                        return
                    }

                    for (let k in secondProject) {
                        this.listPprofession(k, secondProject[k])
                    }

                    this.$el.find('#partCollegeContainer').addClass('hide')
                    this.$el.find('#partProfessionContainer').removeClass('hide')
                }
            })
            break
        case 3:
        case 4:
            // 审核和查看时，获取详情和操作日志
            Promise.all([
                this.getOptInfo(),
                this.getOperationLog(),
                this.getAllNativePage(),
                this.getFirstProjectList(),
            ]).then((values) => {
                this.model.set({
                    ...values[0],
                    logs: values[1],
                    nativePages: values[2],
                    firstProject: values[3],
                    firstProjectSel: values[3].map(item => item.firstProjectValue),
                })
            })
            break
        default: break
        }
    },

    getFirstProjectList() {
        return new Promise((resolve, reject) => {
            service.adminGetFirstProjectList({}, (response) => {
                if (response.rs) {
                    resolve(response.resultMessage)
                } else {
                    alert(response.rsdesp)
                }
            })
        })
    },

    getOptInfo() {
        const {infoId} = this.model.toJSON();
        return new Promise((resolve, reject) => {
            service.adminGetOptInfoById({
                infoId
            }, (response) => {
                if (response.rs) {
                    resolve(response.resultMessage);
                }
            })
        })
    },

    removeListOption(arr = []) {
        return arr.filter(item => item.pageDescription !== '签到页面')
    },

    getAllNativePage() {
        const { infoType } = this.model.toJSON()
        return new Promise((resolve, reject) => {
            service.getAllNativePage({}, (response) => {
                if (response.rs) {
                    const arr = +infoType === 5 ? this.removeListOption(response.resultMessage) : response.resultMessage
                    resolve(arr)
                } else {
                    alert(response.rsdesp);
                }
            })
        })
    },

    getAllCollege() {
        return new Promise((resolve, reject) => {
            service.getAllCollege({}, (response) => {
                if (response.rs) {
                    resolve(response.resultMessage);
                } else {
                    alert(response.rsdesp);
                }
            })
        })
    },

    getOperationLog() {
        const {infoId} = this.model.toJSON();
        return new Promise((resolve, reject) => {
            service.adminGetOperationLog({
                infoId
            }, (response) => {
                if (response.rs) {
                    resolve(response.resultMessage);
                }
            })
        })
    },

    showSTdatetimepicker(e) {
        if ($(e.currentTarget).attr('readonly')) {
            return;
        }
        $(e.currentTarget).datetimepicker(datepickerCfg);
        $(e.currentTarget).datetimepicker('show');
    },

    showETdatetimepicker(e) {
        if ($(e.currentTarget).attr('readonly')) {
            return;
        }
        $(e.currentTarget).datetimepicker(datepickerCfg);
        $(e.currentTarget).datetimepicker('show');
    },

    pickOutPicSize() {
        const { infoType } = this.model.toJSON()
        //匹配中文字符
        const reg = /[\u4e00-\u9fa5]/g
        const widthHeightSize = cfg['picSize'][infoType].replace(reg, '')
        const arr = widthHeightSize.split('，') || []
        //默认长度为2，长度为3的需校验所上传的图片格式
        const heightWidthStr = arr[0]
        const sizeStr = arr[1]
        const picFormat = arr.length === 3 ? arr[2] : ''
        return {
            width: +heightWidthStr.split('*')[0],
            height: +heightWidthStr.split('*')[1],
            sizeStr,
            picFormat,
        }
    },

    uploadPic() {
        //从配置文件中过滤出待上传的图片尺寸，大小
        const picSize = this.pickOutPicSize()
        common.picUploaderNew((response) => {
            if (response.rs) {
                let { linkUrl, width, height, name } = response.resultMessage[0];
                const { infoType } = this.model.toJSON();
                //if (infoType == 1) {
                //    if (width * 420 != height * 750) {
                //        alert('图片尺寸不符合要求，请提供750*420的图片');
                //        this.$el.find('#uploadPicBtn').removeClass('disabled');
                //        return;
                //    }
                //}
                if (width * picSize.height != height * picSize.width) {
                    alert(`图片尺寸不符合要求，请提供${picSize.width}*${picSize.height}的图片`);
                    this.$el.find('#uploadPicBtn').removeClass('disabled');
                    return;
                }

                this.$el.find('#infoImage').val(linkUrl);
                this.$el.find('#uploadPicBtn').html('更新');
                this.$el.find('#infoImageHolder').attr('src', linkUrl);
            } else {
                alert(response.rsdesp);
            }

            this.$el.find('#uploadPicBtn').removeClass('disabled');
        }, (opt) => {
            const { size, name } = opt
            const {infoType} = this.model.toJSON();

            //if (infoType == 1) {
            //    //首页banner
            //    if (size > 1024 * 60) {
            //        alert('请上传不超过60k的图片');
            //        return false;
            //    }
            //} else {
            //    const MAX_SIZE = 1024 * 1024;
            //
            //    if (size > MAX_SIZE) {
            //        alert('图片大小不能超过1M');
            //        return false;
            //    }
            //}

            //校验图片格式
            if(picSize.picFormat) {
                let regStr = ''
                picSize.picFormat.split('/').forEach(item => {
                    regStr += `${item}|`
                })
                regStr = regStr.slice(0, -1)
                const reg = new RegExp(`\.(${regStr})$`)
                if(!reg.test(name)) {
                    alert(`图片格式不符合要求，请提供${picSize.picFormat}格式`)
                    this.$el.find('#uploadPicBtn').removeClass('disabled');
                    return;
                }
            }

            //图片大小权值
            let weight = 1
            if(picSize.sizeStr.indexOf('M') > -1 || picSize.sizeStr.indexOf('m') > -1) {
                weight = 1024 * 1024
            }
            if(picSize.sizeStr.indexOf('k') > -1 || picSize.sizeStr.indexOf('K') > -1) {
                weight = 1024
            }
            const MAX_SIZE = picSize.sizeStr.replace(/\D/g, '') * weight

            if(size > MAX_SIZE) {
                alert(`图片大小不能超过${picSize.sizeStr}`)
                return false
            }

            this.$el.find('#uploadPicBtn').addClass('disabled');
        })
    },

    handleUserTypeChange() {
        let {nativePages} = this.model.toJSON();
        let nativePagesToShow = [];
        let rs = '<option value="">请选择跳转位置</option>';

        const checkedVal = this.$el.find('[name="userType"]:checked').val();
        if (checkedVal == 1 || checkedVal == 3) {
            //付费用户 或者 超服务期付费用户
            this.$el.find('#addReceiver').show();
            this.$el.find('#vipFilterPanel').show();
            this.$el.find('#freeFilterPanel').hide();

            nativePagesToShow = nativePages;
        } else if (checkedVal == 0) {
            this.$el.find('#vipFilterPanel').hide();
            this.$el.find('#freeFilterPanel').show();
            nativePagesToShow = nativePages.filter(item => !item.isVipPage);

            this.listAllCorps();
        } else {
            this.$el.find('#vipFilterPanel').hide();
            this.$el.find('#freeFilterPanel').hide();

            nativePagesToShow = nativePages.filter(item => !item.isVipPage);
        }

        nativePagesToShow.forEach(item => {
            let {pageKey, isHaveParam, pageDescription} = item;
            rs += `
                <option value="${pageKey}-${isHaveParam}">${pageDescription}</option>
            `;
        });

        this.$el.find('#skipName').html(rs);
        this.$el.find('#skipId').hide();
    },

    //获取所有军团列表
    listAllCorps() {
        const {corps} = this.model.toJSON();
        if (!this.corpsItems) {
            service.listAllCorps({
                isPage: 0
            }, (response) => {
                if (response.rs) {
                    this.corpsItems = new Items({
                        el: this.$el.find('#corpsItemsContanier')[0],
                        resultList: response.resultMessage.resultList.map(item => {
                            return {
                                value: item.corpsName,
                                text: item.corpsName,
                                checked: (corps.indexOf(item.corpsName) !== -1 || corps === 'ALL') ? 'checked' : ''
                            }
                        }),
                        checkedAll: corps === 'ALL' ? 'checked' : ''
                    })
                }
            })
        }
    },

    //当选择app页面时，显示native列表
    //当选择活动页面时，显示url输入框
    handleSkipTypeChange() {
        let skipType = this.$el.find('[name="skipType"]:checked').val();
        if (skipType == 1) {
            //app页面
            this.$el.find('#nativePagesContainer').show();
            this.$el.find('#miniProgramUrlContainer').hide();
            this.$el.find('#urlInputContainer').hide();
        } else if(skipType == 3){
            //活动页面
            this.$el.find('#nativePagesContainer').hide();
            this.$el.find('#miniProgramUrlContainer').hide();
            this.$el.find('#urlInputContainer').show();
        } else {
            //小程序页
            this.$el.find('#nativePagesContainer').hide();
            this.$el.find('#miniProgramUrlContainer').show();
            this.$el.find('#urlInputContainer').hide();
        }
    },

    //当选择的native page变化时，判断是否带参数
    handleSkipNameChange() {
        const pageKey = this.$el.find('[name="skipName"]').val().split('-')[0];
        const isHaveParam = +this.$el.find('[name="skipName"]').val().split('-')[1];

        this.$el.find('#skipId').val('');
        if (isHaveParam) {
            //有参数
            this.$el.find('#skipId').show();
        } else {
            this.$el.find('#skipId').hide();
        }
    },

    handleCollegeChange() {
        const collegeType = +this.$el.find('[name="collegeRadioIpt"]:checked').val()

        this.$el.find('#familyItemsContainer').html('')
        this.$el.find('#professionItemsContainer').html('')
        if (collegeType === 1) {
            // 选择了全部学院
            this.$el.find('#partCollegeContainer').addClass('hide')
            this.$el.find('#partProfessionContainer').addClass('hide')
            // 重置状态
            this.model.set({
                family: {
                    ALL: 'ALL',
                },
                professionList: {},
                secProjectList: [],
            })
        } else if (collegeType === 0) {
            // 选择部分学院
            this.model.set({
                family: {},
                professionList: {},
                secProjectList: [],
            })
            this.$el.find('#partCollegeContainer').removeClass('hide')
            this.$el.find('#partProfessionContainer').addClass('hide')
        } else if (collegeType === 2) {
            this.$el.find('#partCollegeContainer').addClass('hide')
            this.$el.find('#partProfessionContainer').removeClass('hide')
            // 选择部分专业
            this.model.set({
                family: {},
                professionList: {},
                secProjectList: [],
            })
        }
    },

    addCollege() {
        const college = this.$el.find('#college').val()
        const { family } = this.model.toJSON()
        if (!family[college] && college) {
            // 如果当前没有添加过这个学院，则添加
            this.listFamilyByCollege(college)
        }
    },

    addProfession() {
        const profession = this.$el.find('#profession').val()
        const { professionList } = this.model.toJSON()
        if (!professionList[profession] && profession) {
            // 如果当前没有添加过这个专业，则添加
            this.listPprofession(profession)
        }
    },

    removeProfession(e) {
        const profession = $(e.currentTarget).attr('profession')
        const { professionList } = this.model.toJSON()

        delete professionList[profession]

        // 移除dom
        $(e.currentTarget).parent().remove()
    },

    removeCollege(e) {
        const college = $(e.currentTarget).attr('college');
        const {family} = this.model.toJSON();

        delete family[college];

        //移除dom
        const parentDom = $(e.currentTarget).parent().remove();
    },

    listPprofession(profession, pList = []) {
        const { professionList, firstProject } = this.model.toJSON()
        const firstProjectId = firstProject.find(item => item.firstProjectValue === profession).firstProjectId
        // console.log(firstProject.find(item => item.firstProjectValue === profession))
        service.adminGetSecProjectList({
            firstProjectId,
        }, response => {
            if (response.rs) {
                this.model.set({
                    secProjectList: response.resultMessage,
                })
                const items = new Items({
                    // TODO 二级项目没存
                    resultList: response.resultMessage.map(item => {
                        const text = item.secProjectValue
                        return {
                            value: text,
                            text,
                            checked: (pList.indexOf(text) !== -1 || pList.indexOf('ALL') !== -1) ? 'checked' : '',
                        }
                    }),
                    checkedAll: pList.indexOf('ALL') !== -1 ? 'checked' : '',
                })

                const $div = $($.parseHTML(`<div class="form-group">${profession}: <span class="btn btn-small orange w70 removeProfessionBtn" profession="${profession}">删除</span></div>`))
                $div.append(items.$el)
                this.$el.find('#professionItemsContainer').append($div)

                professionList[profession] = items
            }
        })
    },

    listFamilyByCollege(schoolName, families = []) {
        const {family} = this.model.toJSON();
        service.listFamilyByCollege({
            schoolName
        }, (response) => {
            if (response.rs) {
                const items = new Items({
                    resultList: response.resultMessage.map(item => {
                        return {
                            value: item,
                            text: item,
                            checked: (families.indexOf(item) != -1 || families.indexOf('ALL') != -1) ? 'checked' : ''
                        }
                    }),
                    checkedAll: families.indexOf('ALL') != -1 ? 'checked' : ''
                });

                const $div = $($.parseHTML(`<div class="form-group">${schoolName}: <span class="btn btn-small orange w70 removeCollegeBtn" college="${schoolName}">删除</span></div>`));
                $div.append(items.$el);
                this.$el.find('#familyItemsContainer').append($div);

                family[schoolName] = items;
            }
        })
    },

    reviewPassed() {
        const {infoId} = this.model.toJSON();
        this.onReview({
            state: 2, //审核通过
            infoId,
        });
    },

    reviewRejected() {
        const {infoId} = this.model.toJSON();
        const that = this;
        this.rejectDialog = new Dialog({
            title: '审核驳回',
            content: `
                <form action="" class="form">
                    <textarea name="" id="" cols="70" rows="10" class="w_100" placeholder="请在此处填写审核驳回原因"></textarea>
                    <div class="form-group">
                        <p class="tip">注：审核驳回原因将会记录在操作日志中，便于查阅。</p>
                    </div>
                </form>
            `,
            ok: function() {
                const operateReason = this.$el.find('textarea').val().trim();
                if (!operateReason) {
                    alert('请填写原因！');
                    return;
                }

                that.onReview({
                    state: 0,
                    operateReason,
                    infoId
                }, () => {
                    this.closeDialog();
                })
            }
        })
    },

    submit() {
        let params = common.getFormData({
            formId: 'cfgOptForm'
        })

        const {name, position, infoImage, startTime, endTime} = params
        const { infoType } = this.model.toJSON()

        if (!name) {
            alert('请填写名称！')
            return
        }
        // 排位校验条件待定
        if (!position) {
            alert('请选择排位！')
            return
        }
        if (parseInt(position) != position) {
            alert('排位请填写1~9的整数！')
            return
        }
        if (!(position > 0 && position < 10)) {
            alert('排位请填写1~9的整数！')
            return
        }
        if (!infoImage) {
            alert('请上传图片')
            return
        }
        if (!startTime) {
            alert('请选择开始时间！')
            return
        }
        if (!endTime) {
            alert('请选择结束时间！')
            return
        }
        if (moment(decodeURIComponent(startTime)).valueOf() - moment(decodeURIComponent(endTime)).valueOf() > 0) {
            alert('开始时间不能晚于结束时间！')
            return
        }

        const { userType } = params
        if (+userType === 0) {
            // 免费用户
            params.corps = this.corpsItems.getData().join(',')

            if (!params.corps) {
                alert('请选择军团')
                return
            }

            delete params.college
        }

        if (+userType === 1 || +userType === 3) {
            // 付费用户
            const { collegeRadioIpt } = params
            if (+collegeRadioIpt === 1) {
                // 全部学院
                params.family = {
                    ALL: 'ALL',
                }
            } else if (+collegeRadioIpt === 0) {
                const { family } = this.model.toJSON()
                params.family = {}
                for (let k in family) {
                    params.family[k] = family[k].getData()
                }

                if ($.isEmptyObject(params.family)) {
                    alert('请选择学院！')
                    return
                }
            } else if (+collegeRadioIpt === 2) {
                const { professionList } = this.model.toJSON()
                // params.firstProject = params.profession // 一级专业，其实是个废弃字段，后端不再使用
                params.secondProject = {} // 二级专业，包含了一级专业信息
                for (let k in professionList) {
                    params.secondProject[k] = professionList[k].getData()
                }
                if ($.isEmptyObject(params.secondProject)) {
                    alert('请选择专业！')
                    return
                }
            }
        }

        // 跳转类型
        const {skipType, skipName, skipLink, skipId, skipMiniProgramLink, skipMiniProgramAppId, skipMiniProgramOriginalId} = params;
        const { isShowJumpType } = cfg['newCreateDialogContentPermission'][infoType]
        if (isShowJumpType) {
            if (skipType == 3) {
                //如果是跳转到活动页，校验url合法性
                if (!common.testUrl(decodeURIComponent(skipLink))) {
                    alert('请输入合法的跳转地址！');
                    return false;
                }

                params.skipName = skipLink;
                delete params.skipLink;
            }else if(skipType == 5){
                //如果是跳转到活动页，校验url合法性
                // if (!common.testUrl(decodeURIComponent(skipMiniProgramLink))) {
                //     alert('请输入合法的跳转地址！');
                //     return false;
                // }

                // params.pagePath = skipMiniProgramLink;
                // params.appid = skipMiniProgramAppId;
                // params.originalId = skipMiniProgramOriginalId;
                params.skipName = 'smallprogram'
                // delete params.skipId;
                // delete params.skipLink;
            } else {
                params.skipName = skipName.split('-')[0];
                let hasParams = +skipName.split('-')[1];

                if (!params.skipName) {
                    alert('请选择跳转位置');
                    return false;
                }

                if (hasParams) {
                    params.skipType = 1; //有参数跳转
                    if (!skipId) {
                        alert('请输入id');
                        return false;
                    }
                } else {
                    params.skipType = 2; //无参数跳转
                    delete params.skipId;
                }
            }
        }

        this.onSubmit(params)
    },

    cancel() {
        this.onCancel()
    },

    format(data) {
        const {type, infoImage, userType, skipType, skipName, skipId, nativePages,pagePath,appid,originalId} = data;
        switch(type) {
            case 1:
            case 2:
                data.isAddOrUpdate = true;
                break;
            case 3:
                data.isOperate = true;
                data.readonly = "readonly";
                data.disabled = 'disabled';
                break;
            case 4:
                data.isCheck = true;
                data.readonly = "readonly";
                data.disabled = 'disabled';
                break;
        }

        /************** 页面跳转类型 *********************/

        if(skipType == 1 || +skipType === 2){
            data.nativePagesContainerHideClass = '';
            data.urlInputContainerHideClass = 'hide';
            data.miniProgramUrlContainerHideClass = 'hide';
            data.activityPageChecked = '';
            data.appPageChecked = 'checked';
            data.miniProgramPageChecked = '';
        }else if(skipType == 3){
            data.nativePagesContainerHideClass = 'hide';
            data.urlInputContainerHideClass = '';
            data.miniProgramUrlContainerHideClass = 'hide';
            data.activityPageChecked ='checked';
            data.appPageChecked = '';
            data.miniProgramPageChecked = '';
        }else{
            data.nativePagesContainerHideClass = 'hide';
            data.urlInputContainerHideClass = 'hide';
            data.miniProgramUrlContainerHideClass = '';
            data.activityPageChecked = '';
            data.appPageChecked = '';
            data.miniProgramPageChecked = 'checked';
        }
        // data.nativePagesContainerHideClass = skipType === 3 ? 'hide' : '';
        // data.urlInputContainerHideClass = skipType === 3 ? '' : 'hide';
        // data.appPageChecked = skipType === 3 ? '' : 'checked';
        // data.activityPageChecked = skipType === 3 ? 'checked' : '';
        //跳转类型
        if (skipType == 3) {
            data.skipLink = skipName;
        }
        if (skipType == 5) {
            data.skipMiniProgramLink = pagePath;
            data.skipMiniProgramAppId = appid;
            data.skipMiniProgramOriginalId = originalId;
        }
        //默认不显示跳转页面id输入框
        data.skipIdHideClass = 'hide';
        nativePages.forEach((item) => {
            item.selected = item.pageKey === skipName ? 'selected' : '';

            if (item.selected && item.isHaveParam) {
                data.skipIdHideClass = '';
            }
        });
        if (userType != 1 && userType != 3) {
            data.nativePagesToShow = nativePages.filter(item => !item.isVipPage);
        } else {
            data.nativePagesToShow = nativePages;
        }
        /************************************************/

        data.uploadPicBtnText = infoImage ? '更新' : '上传';

        /****************受众类型***************************/
        data.freeUserChecked = userType == 0 ? 'checked' : '';
        data.vipUserChecked = userType == 1 ? 'checked' : '';
        data.allUserChecked = userType == 2 ? 'checked' : '';
        data.OverServicePeriodVipUserChecked = userType == 3 ? 'checked' : '';
        data.vipFilterPanelHideClass = (userType == 1 || userType == 3) ? '' : 'hide';
        data.freeFilterPanelHideClass = userType == 0 ? '' : 'hide';

        if ($.isEmptyObject(data.family)) {
            data.partCollegeIptChecked = ''
            data.partCollegeContainerHideClass = ''
            if (!$.isEmptyObject(data.secondProject)) {
                data.partProfessionIptChecked = 'checked'

                data.projectList = []
                for (let k in data.secondProject) {
                    data.projectList.push({
                        firstName: k,
                        sectName: data.secondProject[k],
                    })
                }
            }
        } else {
            data.partProfessionIptChecked = ''
            if (data.family['ALL']) {
                //说明是全部学院
                data.allCollegeIptChecked = 'checked';
                data.partCollegeContainerHideClass = 'hide';
            } else {
                data.partCollegeIptChecked = 'checked';
                data.partCollegeContainerHideClass = '';
                //如果是部分学院
                data.familyList = [];
                for (let k in data.family) {
                    data.familyList.push({
                        collegeName: k,
                        families: data.family[k]
                    })
                }
            }
        }
        /************************************************/

        data.logsFormatted = data.logs.map(item => {
            const newOperatorAccount = item.operatorAccount.replace(/@sunlands.com/i, "");
            return `${LOGS[item.operatorDesc]}：${item.reason} <br/>操作人：${newOperatorAccount} 时间：${item.createTime}<br/>`;
        })

        //图片尺寸文案
        //data.picSize = PIC_SIZE[+data.infoType];
        data.picSize = cfg['picSize'][data.infoType]

        //新建-跳转页面类型|跳转页面位置-前端权限
        data.isShowJumpType = cfg['newCreateDialogContentPermission'][data.infoType]['isShowJumpType']
        data.isShowJumpTo = cfg['newCreateDialogContentPermission'][data.infoType]['isShowJumpTo']

        return data;
    },

    //close小程序推送必读提示弹窗
    miniProgressModalClose(){
        this.miniProgressModal = false
        this.initModalReact()
    },

    //引入react组件
    initModalReact() {
        const that = this
        // 页面加载直接渲染leftNav react 组件
        const props = {
            miniProgressModal:that.miniProgressModal,
            miniProgressModalClose:that.miniProgressModalClose.bind(this)
            // ...this.model.toJSON(), // 获取model中的所有数据
            // dispatch: (name = '', evt = {}) => {
            //     if(that[name]) {
            //         that[name](evt)
            //     }else {
            //         console.warn(`方法name不存在`)
            //     }
            // },
            // getDefaultParams: this.getDefaultParams,
            // sendMessage: this.sendMessage,
            // onClick: this.onClick,
            // generateKey: this.generateKey,
        }
        // debugger
        ReactDom.render(
            <WxPushModal {...props} />,
            document.getElementById('showWxPushModalContainer'),
        )
    },
    showWxPushModal(){
        this.miniProgressModal = true
        this.initModalReact()
    },
    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        // this.initModalReact()
    }
})

class CfgOptDialog {
    constructor(options) {
        this.refreshCallback = options.callback;
        this.view = new View({
            onReview: this.review.bind(this),
            onSubmit: this.submit.bind(this),
            onCancel: this.cancel.bind(this),
            ...options
        });
        this.infoId = options.infoId;
        this.infoType = options.infoType;
        this.show();
    }

    review(params, callback) {
        service.adminUpdateStateById({
            ...params
        }, (response) => {
            if (response.rs) {
                //关闭弹窗
                alert('操作成功！');
                if (typeof callback === 'function') {
                    callback();
                }
                this.d.closeDialog();

                if (typeof this.refreshCallback === 'function') {
                    this.refreshCallback();
                }
            } else {
                alert(response.rsdesp);
            }
        })
    }

    submit(params) {
        const reqUrl = this.infoId ? 'adminUpdateOptInfo' : 'adminAddOptInfo'
        const { infoType } = params
        // infoType = 4（签到背景图管理），后端强制让加上三个不相关的入参, pagePath, appid, originalId
        let otherBackgroundPicObj = {}
        if (+infoType === 4) {
            otherBackgroundPicObj = {
                pagePath: '',
                appid: '',
                originalId: '',
            }
        }
        service[reqUrl]({
            ...params,
            ...otherBackgroundPicObj,
        }, (response) => {
            if (response.rs) {
                alert('提交成功，新的内容已新建成功，并提交审核！');
                this.d.closeDialog();

                if (typeof this.refreshCallback === 'function') {
                    this.refreshCallback();
                }
            } else {
                alert(response.rsdesp);
            }
        })
    }

    cancel() {
        this.d.closeDialog();
    }

    show() {
        //const title = this.infoType == 1 ? '首页banner' : (this.infoType == 2 ? 'APP开屏' : '首页弹窗');
        const title = cfg['dialogTitle'][this.infoType]
        this.d = new Dialog({
            title,
            content: this.view.$el,
            type: 4,
            showFooter: false,
        });
    }
}

export {CfgOptDialog}
