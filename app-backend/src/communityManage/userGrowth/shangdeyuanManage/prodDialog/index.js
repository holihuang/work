import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import moment from 'moment';
require('datepicker/js/bootstrap-datetimepicker');

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        // schoolFamilys: null,
        datepickerCfg: {
            format: 'yyyy-mm-dd hh:00:00',
            autoclose: true,
            todayBtn: true,
            minView: 'day'
        }
    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        let {type, prodInfo} = options;
        this.model = new Model();
        this.model.set({type, ...prodInfo});
        this.listenTo(this.model, 'change:categoryList', this.setCategoryList);
        this.render();
        this.listProductCategory();
        this.initCollegeAndFamilies();
        this.initDatepicker();
        this.numberFieldValidate();
    },

    events: {
        'click #userIdRadioIpt': 'handleClickUserId',
        'click #userTypeAll': 'handleCheckUserTypeAll',
        'click #userTypeVip': 'handleCheckUserTypeVip',
        'click #schoolFamilys': 'handleCheckschoolFamilys',
        'click .college-checkbox': 'handleClickCollegeCheckbox',
        'change .family-checkbox': 'handleChangeFamilyCheckbox',
        'mouseover .college-item': 'handleHoverCollegeItem',
        'click .check-all': 'toggleCheckAllFamily',
        'click #prodDeactivateTime': 'initDaypicker',
        'click #prodDeactivateTimeSingle': 'initDaypicker',
        'change [name="timeType"]': 'handleTimeTypeChange',
        'change [name="categoryId"]': 'handleCategoryIdChange'
    },

    initDatepicker() {
        let {datepickerCfg} = this.model.toJSON();
        let datepickerArr = ['onSaleTime', 'offSaleTime'];

        datepickerArr.forEach(item => {
            this.$el.on('click', `#${item}`, function() {
                $(this).datetimepicker(datepickerCfg);
                $(this).datetimepicker('show');
            })
        })
    },

    initDaypicker(e) {
        $(e.currentTarget).datetimepicker({
            format: 'yyyy-mm-dd 00:00:00',
            autoclose: true,
            todayBtn: true,
            minView: 'month'
        });
        $(e.currentTarget).datetimepicker('show');
    },

    //数字域
    numberFieldValidate() {
        let inputNumberList = ['#prodPrice', '#prodFee', '#prodLocation', '#prodInventory', '#validDay'];

        inputNumberList.forEach((item) => {
            this.$el.on('keydown', item, (e) => {
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

                let keyCodeList = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
                                       96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
                //let len = $(item).val().length;
                if ($.inArray(e.keyCode, keyCodeList) == -1) {
                    e.preventDefault();
                }
            });

            this.$el.on('keyup', item, function(e) {
                let val = $(this).val();
                $(this).val(val.replace(/[^0-9]/ig,""));  //只能输入0-9
            })

            this.$el.on('input', item, function(e) {
                let val = $(this).val();
                $(this).val(val.replace(/[^0-9]/ig,""));  //只能输入0-9
            })
        })
    },

    handleCheckUserTypeAll() {
        this.$el.find('#userIdInputPanel').hide();
        this.$el.find('#schoolFamilysPanel').hide();
    },

    handleCheckUserTypeVip() {
        this.$el.find('#userIdInputPanel').hide();
        this.$el.find('#schoolFamilysPanel').hide();
    },

    handleCheckschoolFamilys() {
        this.$el.find('#userIdInputPanel').hide();
        this.$el.find('#schoolFamilysPanel').show();
    },

    handleClickUserId() {
        this.$el.find("#userIdInputPanel").show();
        this.$el.find('#schoolFamilysPanel').hide();
    },

    listProductCategory: function() {
        service.listProductCategory({}, (response) => {
            if (response.rs) {
                this.model.set({categoryList: response.resultMessage});
            } else {
                alert(response.rsdesp);
            }
        })
    },

    //获取学院和家族信息
    initCollegeAndFamilies: function() {
        this.listAllCollege().then(this.listFamilyByCollege.bind(this));
    },
    //获取所有学院
    listAllCollege: function(resolve) {
        return new Promise((resolve, reject) => {
            service.listAllCollege({}, (response) => {
                if (response.rs) {
                    resolve(response.resultMessage[0]);
                    this.model.set({colleges: response.resultMessage});
                    this.setCollegesInfo();
                } else {
                    alert(response.rsdesp);
                }
            })
        })
    },

    //获取家族
    listFamilyByCollege: function(college) {
        service.listFamilyByCollege({
            schoolName: college
        }, (response) => {
            if (response.rs) {
                this.model.set({
                    families: response.resultMessage
                })
                this.setFamiliesInfo(college);
            } else {
                alert(response.rsdesp);
            }
        })
    },

    handleHoverCollegeItem: function(e) {
        let schoolName = $(e.currentTarget).attr("college");
        this.listFamilyByCollege(schoolName);
    },

    //当点击学院时，默认选中其下所有家族；取消选择时，取消选中其下所有家族;
    handleClickCollegeCheckbox: function(e) {
        let schoolName = $(e.currentTarget).val();
        let checked = $(e.currentTarget).prop('checked');
        let {schoolFamilys = []} = this.model.toJSON();

        if (checked) {
            this.listFamilyByCollege(schoolName);
            schoolFamilys.push({
                schoolName
            });
        } else {
            schoolFamilys = schoolFamilys.filter(item => item.schoolName != schoolName);
            this.$el.find(`input[school="${schoolName}"]`).prop('checked', false);
        }

        this.model.set({schoolFamilys});
    },

    //选择或取消选择家族
    handleChangeFamilyCheckbox: function(e) {
        let family = $(e.currentTarget).val(); //家族
        let school = $(e.currentTarget).attr('school'); //对应的学院
        let checked = $(e.currentTarget).prop('checked');
        let {schoolFamilys = []} = this.model.toJSON();

        let schoolIndex = -1;
        schoolFamilys.forEach((item, index) => {
            if (item.schoolName == school) {
                schoolIndex = index;
                return;
            }
        })


        if (checked) {
            //选中
            /**
             * dom
             * 若学院没有选中，选中其学院
             */
            this.$el.find(`input[value="${school}"]`).prop('checked', true);

            /**
             * model
             */
            if (schoolIndex === -1) {
                schoolFamilys.push({
                    schoolName: school
                })

                schoolIndex = schoolFamilys.length - 1;
            }

            if (family) {
                if (!schoolFamilys[schoolIndex].familyNames) {
                    schoolFamilys[schoolIndex].familyNames = [];
                }   

                schoolFamilys[schoolIndex].familyNames.push(family);
            } else {
                //说明是全部
                //familyNames 空数组
                schoolFamilys[schoolIndex].familyNames = [];
            }

        } else {
            /**
             * dom
             * 取消选中,取消全选状态
             * 若取消选中后，该学院下没有选择任何家族，取消选中学院
             */
            this.$el.find(`.check-all-checkbox[school=${school}]`).prop('checked', false);

            //从model中移除该家族
            let familyNames = schoolFamilys[schoolIndex].familyNames || [];
            let familyIndex = familyNames.indexOf(family);
            familyNames.splice(familyIndex, 1);

            //该学院下没有选择任何家族，学院取消选择，从model中移除
            if (!this.$el.find(`.family-checkbox:checked`).length) {
                this.$el.find(`input[value="${school}"]`).prop('checked', false);

                //从model中移除该学院
                schoolFamilys.splice(schoolIndex, 1);
            }
        }

        this.model.set({schoolFamilys});
    },

    toggleCheckAllFamily: function(e) {
        let checkAll = $(e.currentTarget).find('input').prop('checked');
        
        $(e.currentTarget).siblings().find('input').prop('checked', !!checkAll);
    },

    setCollegesInfo() {
        let {colleges, type, prodSellPeople} = this.model.toJSON();
        let rs = '';
        if (type === 'add' || (prodSellPeople != 2)) {
            colleges.forEach((item, index) => {
                // let checked = !index ? 'checked' : '';
                rs += `<li>
                            <label style="cursor:pointer;" class="college-item" college="${item}">
                                <input type="checkbox" value="${item}" class="college-checkbox">${item}</input>
                            </label>
                       </li>`;
            })
        } else {
            let {schoolFamilys} = this.model.toJSON();
            colleges.forEach(item => {
                let checked = '';
                schoolFamilys.forEach(schoolFamily => {
                    if (schoolFamily.schoolName == item) {
                        checked = 'checked';
                        return;
                    }
                })

                rs += `<li>
                            <label style="cursor:pointer;" class="college-item" college="${item}">
                                <input type="checkbox" value="${item}" ${checked} class="college-checkbox">${item}</input>
                            </label>
                       </li>`;
            })
        }
        
        this.$el.find('#collegeListPanel').html(rs);
    },

    //每次家族列表变化时，根据是否被选中设置其状态
    setFamiliesInfo(school) {
        let {families, schoolFamilys = []} = this.model.toJSON();
        let itemIndex = -1;
        schoolFamilys.forEach((schoolFamily, _index) => {
            if (schoolFamily.schoolName == school) {
                itemIndex = _index;
                return;
            }
        })

        let itemsStr = '';
        let allCheckedStatus = 'checked';
        if (!families.length && itemIndex == -1) {
            allCheckedStatus = 'false';
        }
        families.forEach((item, index) => {
            let checked = '';
            
            if (itemIndex != -1) {
                //数组，全部时为空数组
                let familyNames = schoolFamilys[itemIndex].familyNames || [];

                if (!familyNames.length) {
                    //说明是全部
                    checked = 'checked';
                } else {
                    //说明是部分
                    familyNames.forEach((family) => {
                        if (item == family) {
                            checked = 'checked';
                            return;
                        }
                    })
                }
            }

            if (!checked) {
                allCheckedStatus = '';
            }

            itemsStr += `<li><label><input type="checkbox" school="${school}" value="${item}" class="family-checkbox" ${checked}>${item}</input></label></li>`;
        })

        let rs = `<li class="check-all">
                    <label><input type="checkbox" class="check-all-checkbox family-checkbox" school="${school}" value="" ${allCheckedStatus}>全部</input></label>
                 </li>
                 ${itemsStr}`;

        this.$el.find('#familyListPanel').html(rs);
    },

    //商品类别
    setCategoryList() {
        let {type, categoryList, categoryId, prodSellPeople} = this.model.toJSON();
        let rs = type === 'add' ? '<option value="">请选择商品分类</option>' : ''; //更新的时候不显示请选择分类
        categoryList.forEach((item) => {
            let selected = item.categoryId === categoryId ? 'selected' : '';
            rs += `<option value="${item.categoryId}" ${selected}>${item.categoryName}</option>`;
        })

        this.$el.find('#categoryList').html(rs);
    },

    handleTimeTypeChange() {
        let type = this.$el.find('[name="timeType"]:checked').val();
        if (type == "1") {
            this.$el.find('#validDayPanel').removeClass('hide');
            this.$el.find('#prodDeactivateTimePanel').addClass('hide');
        } else {
            this.$el.find('#validDayPanel').addClass('hide');
            this.$el.find('#prodDeactivateTimePanel').removeClass('hide');
        }
    },

    //当选择社区卡片时，可以设置使用天数
    handleCategoryIdChange() {
        let categoryName = this.$el.find('[name="categoryId"]').find('option:selected').text();
        //每次选择变化时，重置数据
        this.$el.find('#prodDeactivateTime').val('');
        this.$el.find('#prodDeactivateTimeSingle').val('');
        this.$el.find('[name="timeType"]').prop('checked', false);
        this.$el.find('#validDay').val('');
        
        if (categoryName == '社区卡片') {
            this.$el.find('#twoTimeTypesContainer').show();
            this.$el.find('#singleTimeTypeContainer').hide();

            this.$el.find('.form-group-prodImage').show();
            this.$el.find('.form-group-prodThumbImage').show();
            this.$el.find('.form-group-prodFee').show();
            this.$el.find('.form-group-prodInventory').show();
            this.$el.find('.form-group-prodDirect').show();
            this.$el.find('.form-group-saleGroup').show();
        } else if(categoryName == '补签卡') {
            this.$el.find('#twoTimeTypesContainer').hide();
            this.$el.find('#singleTimeTypeContainer').show();

            this.$el.find('.form-group-prodImage').show();
            this.$el.find('.form-group-prodThumbImage').show();
            this.$el.find('.form-group-prodFee').show();
            this.$el.find('.form-group-prodInventory').show();
            this.$el.find('.form-group-prodDirect').show();
            this.$el.find('.form-group-saleGroup').show();
        } else if(categoryName == '直播礼物') {
            this.$el.find('#twoTimeTypesContainer').hide();
            this.$el.find('#singleTimeTypeContainer').hide();
            this.$el.find('.form-group-prodImage').hide();
            this.$el.find('.form-group-prodThumbImage').hide();
            this.$el.find('.form-group-prodFee').hide();
            this.$el.find('.form-group-prodInventory').hide();
            this.$el.find('.form-group-prodDirect').hide();
            this.$el.find('.form-group-saleGroup').hide();   
        }
    },

    getData() {
        let params = common.getFormData({
            formId: 'form'
        });

        for (let k in params) {
            params[k] = decodeURIComponent(params[k]);
        }

        params.categoryId = this.$el.find('#categoryList').val();

        let {categoryId, prodName, prodPrice, prodLocation, prodImage, prodThumbImage, prodInventory, prodDirect} = params;

        let categoryType = this.$el.find('#categoryList option:selected').text();

        if (!categoryId) {
            alert('请选择商品分类！');
            return false;
        }
        if (!prodName) {
            alert('请填写商品名称！');
            return false;
        }
        if (prodName.length > 20) {
            alert('商品名称不能超过20个字符！');
            return false;
        }
        if (!prodPrice) {
            alert('请填写商品价格！');
            return false;
        }
        if (!prodLocation) {
            alert('请填写商品位置！');
            return false;
        }
        if (categoryType!=='直播礼物' && !prodImage) {
            alert('请上传商品图片！');
            return false;
        }
        if (categoryType!=='直播礼物' && !prodThumbImage) {
            alert('请上传商品预览图！');
            return false;
        }

        if (prodInventory) {
            //如果填写了库存，库存必须大于0
            if (!(+prodInventory)) {
                alert('库存请填写大于0的整数');
                return false;
            }
        }

        if (prodDirect.length > 100) {
            alert('商品使用说明不能超过100个字符！');
            return false;
        }

        //时间校验
        let {onSaleTime, offSaleTime} = params;
        if (onSaleTime && offSaleTime) {
            if (moment(offSaleTime) - moment(onSaleTime) < 0) {
                alert('下架时间不能早于上架时间');
                return false;
            }
        }

        //售卖人群校验
        let {prodSellPeople} = params;
        if (prodSellPeople != 3) delete params.userIds;

        if (prodSellPeople == 3) {
            //校验userIds
            let {userIds} = params;
            if (!userIds) {
                alert('请填写用户id');
                return false;
            } else {
                //校验是否只有数字和英文逗号
                if (!(/^[\d,]*$/.test(userIds))) {
                    alert('请用英文逗号分隔各用户id');
                    return false;
                }

                params.userIds = params.userIds.split(',');
            }
        }

        if (prodSellPeople == 2) {
            //如果是学院和家族
            let {schoolFamilys = []} = this.model.toJSON();
            if (!schoolFamilys.length) {
                alert('请选择学院和家族~');
                return false;
            }

            params.schoolFamilys = schoolFamilys;
        }

        let {timeType, prodDeactivateTime, validDay} = params;
        if (timeType == 1) {
            if (validDay && !+validDay) {
                alert('可使用天数请输入数字！');
                return false;
            }

            if (validDay > 1000) {
                alert('使用天数不可超过1000！');
                return false;
            }

            //将有效期置空
            params.prodDeactivateTime = '';
        } else if (timeType == 0) {
            // if (!prodDeactivateTime) {
            //     alert('请选择有效期！');
            //     return false;
            // }

            //将有效天数置空
            params.validDay = '';
        } else {

        }

        let categoryName = this.$el.find('[name="categoryId"]').find('option:selected').text();
        if (categoryName != '社区卡片') {
            params.prodDeactivateTime = params.prodDeactivateTimeSingle;
        }

        return params;
    },

    format(data) {
        let {type} = data;
        data.userIdInputPanelClass = 'hide';
        data.schoolFamilysPanelClass = 'hide';
        if (type === 'add') {
            data.btnText = '上传';
            data.allUserChecked = "checked";
            data.prodDeactivateTimeChecked = '';
            data.validDayPanelClass = 'hide';
            data.singleTimeTypeContainerHideClass = '';
            data.twoTimeTypesContainerHideClass = 'hide';
        } else {
            data.isUpdate = true;
            data.btnText = '更新';
            let {prodSellPeople, prodDeactivateTime, validDay, categoryId, categoryName} = data;
            if (categoryName == '社区卡片') {
                data.singleTimeTypeContainerHideClass = 'hide';
                data.twoTimeTypesContainerHideClass = '';

                data.formGroupProdImageClass = '';
                data.formGroupProdThumbImageClass = '';
                data.formGroupProdFee = '';
                data.formGroupProdInventory = '';
                data.formGroupProdDirect = '';
                data.formGroupSaleGroup = '';
            } else if(categoryName == '补签卡') {
                data.singleTimeTypeContainerHideClass = '';
                data.twoTimeTypesContainerHideClass = 'hide';

                data.formGroupProdImageClass = '';
                data.formGroupProdThumbImageClass = '';
                data.formGroupProdFee = '';
                data.formGroupProdInventory = '';
                data.formGroupProdDirect = '';
                data.formGroupSaleGroup = '';
            } else if(categoryName == '直播礼物') {
                data.twoTimeTypesContainerHideClass = 'hide';
                data.singleTimeTypeContainerHideClass = 'hide';
                data.formGroupProdImageClass = 'hide';
                data.formGroupProdThumbImageClass = 'hide';
                data.formGroupProdFee = 'hide';
                data.formGroupProdInventory = 'hide';
                data.formGroupProdDirect = 'hide';
                data.formGroupSaleGroup = 'hide';
            }

            switch (prodSellPeople) {
                case 0:
                    data.allUserChecked = 'checked';
                    break;
                case 1:
                    data.vipUserChecked = 'checked';
                    break;
                case 2:
                    data.collegeChecked = 'checked';
                    data.schoolFamilysPanelClass = '';
                    break;
                case 3:
                    data.userIdChecked = 'checked';
                    data.userIdInputPanelClass = '';
                    break;
                default:
                    data.allUserChecked = 'checked';
                    break;
            }

            if (prodDeactivateTime) {
                data.prodDeactivateTimeChecked = 'checked';
                data.validDayPanelClass = 'hide';
            } else if (validDay) {
                data.validDayChecked = 'checked';
                data.prodDeactivateTimePanelClass = 'hide';
            } else {
                data.prodDeactivateTimeChecked = 'checked';
                data.validDayPanelClass = 'hide';
            }

            //更新的时候，如果选中了有效期或者有效时间，则不可更改
            if (prodDeactivateTime || validDay) {
                data.timeTypeDisabled = true;
            }
        }

        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

var ProdDialog = function(options = {}) {
    let {type, prodInfo, onSuccess} = options;
    this.type = type;
    this.onSuccess = onSuccess;
    this.view = new View({type, prodInfo});
    this.show();
}

ProdDialog.prototype.show = function() {
    let title = this.type === 'add' ? '新增物品' : '更新物品';
    let reqUrl = this.type === 'add' ? 'addProduct' : 'updateProduct';
    let that = this;
    this.d = new Dialog({
        title,
        content: this.view.$el,
        type: 4,
        hasUploadPicBtn: true,
        uploadArr: [
            {
                uploadPicBtnId: "uploadProdImage",
                imgUrlHolder: "prodImage",
                fileNameHolder: "fileName"
            },
            {
                uploadPicBtnId: 'uploadProdThumbImage',
                imgUrlHolder: 'prodThumbImage',
                fileNameHolder: 'thumbfileName'
            }
        ],
        ok: function() {
            //校验
            let params = that.view.getData();

            if (params) {
                service[reqUrl](params, (response) => {
                    if (response.rs) {
                        alert('操作成功');
                        if (typeof that.onSuccess === 'function') {
                            that.onSuccess();
                        }
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        }
    })
};

export {ProdDialog}
