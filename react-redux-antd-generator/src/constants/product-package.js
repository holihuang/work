const UPDATE_STATE = 'product-package/UPDATE_STATE'
const UPDATE_PRODPACKAGE = 'product-package/UPDATE_prodPackage'
const RESET = 'product-package/RESET'

const DO_SEARCH = 'product-package/DO_SEARCH'
const CHECK_UNDERCARRIAGE = 'product-package/UNDERCARRIAGE'
const CREATE_NEW = 'product-package/CREATE_NEW'
const UPDATE_PACKAGE_STATUS = 'product-package/UPDATE_PACKAGE_STATUS'

const packageCategories = [
    {
        id: -1,
        name: '全部',
    },
    {
        id: 2,
        name: '未设置',
    },
    {
        id: 0,
        name: '普通班型',
    },
    {
        id: 1,
        name: '不过退费班型',
    },
]


const insuranceTypes = [
    {
        id: 1,
        name: '是',
    },
    {
        id: 0,
        name: '否',
    },
]

const moduleTypes = {
    module: 'module',
    textBook: 'textBook',
    video: 'video',
    datum: 'datum',
    exercises: 'exercises',
}

const payMethods = [
    {
        name: '允许使用百度钱包支付',
        id: 'baifubao',
    },
    {
        name: '允许使用咖啡易融支付',
        id: 'FM_JINRONG',
    },
    {
        name: '允许使用海尔金融支付',
        id: 'FM_HAIER',
    },
    {
        name: '允许使用北银贷款支付',
        id: 'FM_LOAN',
    },
    {
        name: '允许使用浦发有卡贷款支付',
        id: 'SCH_PAY_SPDB_CARD',
    },
    {
        name: '允许使用浦发无卡贷款支付',
        id: 'SCH_PAY_SPDB_NOCARD',
    },
    {
        name: '允许使用京东白条支付',
        id: 'FM_BAITIAO',
    },
]

const saleMethods = [
    {
        name: '支持促销活动',
        id: 'cuxiao',
    },
]

const OFFTABLE_STATUS_CODE = 'PS_STOPPED'
const ONTABLE_STATUS_CODE = 'PS_ON_SALE'

export default {
    UPDATE_STATE,
    UPDATE_PRODPACKAGE,
    RESET,
    DO_SEARCH,
    CHECK_UNDERCARRIAGE,
    CREATE_NEW,
    packageCategories,
    insuranceTypes,
    OFFTABLE_STATUS_CODE,
    ONTABLE_STATUS_CODE,
    UPDATE_PACKAGE_STATUS,
    moduleTypes,
    payMethods,
    saleMethods,
}
