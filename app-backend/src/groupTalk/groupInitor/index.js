import { common } from '../../common/common'
import { service } from '../../common/service'
import { global } from '../../common/global'
import { Dialog } from '../../components/dialog/index'
import { DialogContent } from './dialogContent/index'
import { Subject } from './dialogContent/subject'

const tpl = require('./tpl.html')
// 汉字校验
const chineseCharactersReg = new RegExp('[\\u4E00-\\u9FFF]+')

const Model = window.Backbone.Model.extend({
    defaults: {
        seletSubId: '',
        seletSubName: '',
        isEmptyGroupType: false,
        typeList: [{
            value: 1,
            label: '新生群',
        },
        // {
        //     value: 2,
        //     label: '班级群',
        // },
        {
            value: 3,
            label: '学霸俱乐部',
        },
        {
            value: 5,
            label: '课程群',
        },
        {
            value: 4,
            label: '活动运营群',
        },
        // {
        //     value: 9,
        //     label: '学习小组',
        // },
        {
            value: 7,
            label: '其他',
        }],
    },
})

const GroupInitor = window.Backbone.View.extend({
    initialize() {
        this.model = new Model()

        this.listenTo(this.model, 'change:groupType', this.render)
        this.listenTo(this.model, 'change:seletSubId', this.render)

        service.getImIdByAccount({
            userAccount: window.userInfo.userAccount,
        }, response => {
            if (response.rs) {
                window.userInfo.imIdForGroup = response.resultMessage
                // 判断是否是班主任/值班老师身份
                this.model.set({
                    isDutyTeacherOrSCHTeacher: (window.userInfo.userRole.indexOf('SCH_DUTYTEACHER') !== -1)
                        || (window.userInfo.userRole.indexOf('SCH_TEACHER') !== -1),
                })
                this.render()
            } else {
                alert(response.rsdesp)
                // return
            }
        })
    },

    events: {
        'click #uploadGroupUserBtn': 'uploadGroupUser',
        'click #insertGroupTalkBtn': 'insertGroupTalk',
        'click #uploadGroupAvatarBtn': 'uploadAvatar',
        'change #groupType': 'getGroupType',
        'click #subject-link': 'selectSubject',
    },


    selectSubject() {
        this.selectSubject = new Subject({})
        this._selectSubjectDialog = new Dialog({
            title: '选择科目',
            type: 4,
            showFooter: true,
            content: this.selectSubject.$el,
            ok: () => {
                const { selectId, selectName } = this.selectSubject.model.toJSON()

                if (!selectId) {
                    alert('请选择查询结果。')
                    return null
                }

                this.model.set({
                    seletSubId: selectId,
                    seletSubName: selectName,
                })

                this._selectSubjectDialog.closeDialog()

                return null
            },
        })
    },

    getGroupType(e) {
        this.model.set({
            groupType: e.target.value,
            seletSubId: '',
            seletSubName: '',
        })
        if (+this.model.get('groupType') === 2) {
            this.$el.find('#groupNameInput').attr('placeholder', '命名规则：专业+随意花名+考期')
        } else {
            this.$el.find('#groupNameInput').attr('placeholder', '请输入群聊名称')
        }
    },

    uploadAvatar(e) {
        if ($(e.currentTarget).hasClass('disabled')) {
            return
        }
        common.picUploaderNew(response => {
            if (response.rs) {
                const url = response.resultMessage[0].linkUrl
                this.$el.find('#groupUrl').val(url)
                this.$el.find('#groupUrlHolder').attr('src', url)
                this.$el.find('#uploadGroupAvatarBtn').html('更新')
            } else {
                alert(`上传图片失败:${response.rsdesp}`)
            }
            this.$el.find('#uploadGroupAvatarBtn').removeClass('disabled')
            this.$el.find('#isAvatarLoading').hide()
        }, ({ name, size }) => {
            this.$el.find('#isAvatarLoading').show()
            this.$el.find('#uploadGroupAvatarBtn').addClass('disabled')
        })
    },

    uploadGroupUser() {
        service.uploadGroupNameFile(options => {
            const { name, size } = options
            const ext = name.substr(name.lastIndexOf('.') + 1, name.length - 1)

            if (!(ext && /^(xlsx|xls)$/.test(ext.toLowerCase()))) {
                alert('请上传表格格式文件！')
                return false
            }

            if (size > 10 * 1024 * 1024) {
                alert('上传文件大小不可超过10MB~')
                return false
            }
            this.$el.find('#isUserLoading').show()
            this.$el.find('#uploadGroupUserBtn').addClass('disabled')
            return null
        }, response => {
            if (response.rs) {
                const { resultMessage } = response
                this.model.set({ ...resultMessage[0] })
                const { fileName, sucList } = resultMessage[0]
                this.$el.find('#fileName').html(`${fileName}, 成功上传${sucList.length}位成员`)
                this.$el.find('#isUserLoading').hide()
                this.$el.find('#uploadGroupUserBtn').html('更新')
            } else {
                alert(response.rsdesp || '上传失败~')
                this.$el.find('#isUserLoading').hide()
            }

            this.$el.find('#uploadGroupUserBtn').removeClass('disabled')
        })
    },

    insertGroupTalk() {
        const params = common.getFormData({
            formId: 'form',
        })

        // 参数校验
        // 去掉创建人昵称memberName
        const { groupName, groupType, groupDescrp } = params
        // const {groupName, groupType, memberName, groupDescrp} = params;
        if (!groupName) {
            alert('请填写群聊名称！')
            return false
        }
        if (decodeURIComponent(groupName).length > 15) {
            alert('群名称不可超过15个字~')
            return false
        }
        if (!groupType) {
            alert('请选择群聊类型！')
            return false
        }
        // 若类型为班级群，群名称必须包括数字
        if (+groupType === 2) {
            const regex = /[0-9]/
            const isHaveNumber = regex.test(decodeURIComponent(groupName)) // true,说明有数字
            if (!isHaveNumber) {
                alert('班级群命名规则须包含考期字段，请键入考期数字重新命名')
                return false
            }
        }
        if (groupDescrp && groupDescrp.length) {
            if (!chineseCharactersReg.test(decodeURIComponent(groupDescrp))) {
                alert('请至少输入一个汉字！')
                return false
            } else if (decodeURIComponent(groupDescrp).length > 100) {
                alert('群聊简介过长，请重新输入！')
                return false
            }
        }
        // 去掉创建人昵称, 改成从getUserAccount的接口中获取appNickname,如果此参数为空，则传群主老师
        // if (!memberName) {
        //     alert('请填写创建人昵称！');
        //     return false;
        // }
        const { appNickname } = window.userInfo
        const memberName = appNickname === '' ? '群主老师' : appNickname
        const { userAccount } = common.getUserInfo()
        const imUserId = common.getUserInfo().imIdForGroup
        const { sucList = [], seletSubId, seletSubName } = this.model.toJSON()

        if (!sucList.length) {
            alert('请上传群成员！')
            return false
        }
        // 学习小组 必须选择科目信息
        if (+groupType === 9) {
            if (seletSubId !== '') {
                params.subjectId = seletSubId
                params.subjectName = seletSubName
            } else {
                alert('请选择学习小组科目。')
                return false
            }
        }

        service.insertGroupTalk({
            userAccount,
            imUserId,
            sucList,
            memberName,
            ...params,
        }, response => {
            if (response.rs) {
                alert('发起群聊成功！')
                const groupId = response.resultMessage
                const jumpUrl = `#myGroupTalk/${groupId}`
                window.location.hash = jumpUrl
                $('.sitemap-container').find('.active').removeClass('active')
                $('#myGroupTalkLink').parent().addClass('active')
                // 建群成功，buildGroupSuccess置为true
                global.buildGroupSuccess = true
            } else if (response.failedUserUrl) {
                const groupId = response.resultMessage
                const jumpUrl = `#myGroupTalk/${groupId}`
                if (this.dialogContent) {
                    this.dialogContent.undelegateEvents()
                }
                this.dialogContent = new DialogContent({ ...response, jumpUrl })
                this._d_success = new Dialog({
                    title: '发起群聊成功！',
                    type: 4,
                    showFooter: false,
                    content: this.dialogContent.$el,
                    cancel: _ => {
                        window.location.hash = jumpUrl
                        $('.sitemap-container').find('.active').removeClass('active')
                        $('#myGroupTalkLink').parent().addClass('active')
                    },
                })
            } else {
                alert(response.rsdesp)
            }
        })

        return null
    },

    render() {
        const data = this.model.toJSON()
        data.showName = data.seletSubId ? data.seletSubName : '请选择科目'
        data.showText = data.showName.length > 15 ? `${data.showName.substring(0, 14)}...` : data.showName
        data.showText = +data.groupType === 9 ? data.showText : ''
        data.typeList = data.typeList.map(item => {
            const rst = {
                ...item,
            }

            rst.selected = item.value === +data.groupType ? 'selected' : ''

            return rst
        })

        this.$el.html(tpl(data))
    },
})

export { GroupInitor }
