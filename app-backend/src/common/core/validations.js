/**
 * 常用校验机 和业务无关
 * @author gushouchuang
 * @version 0.0.1
 * @date 2017-12-22
 */

// bytes
const getLengthInBytes = (str) => {
    const b = str.match(/[^\x00-\xff]/g)
    return (str.length + (!b ? 0: b.length))
}

// 存在
const isExisty = (value) => {
    return value !== null && value !== undefined
}

// 为空
const isEmpty = (value) => {
    return value === '' || (value instanceof Array && value.length === 0)
}

/**
 * 是否通过正则检查。值不存在，或值为空字符串，也视为通过校验
 * @interface matchRegexp
 * @param {Any} value 待校验值
 * @param {Reg} regexp 正则表达式
 * @return {ValidateResult} 校验结果对象
 */
const matchRegexp = (value, regexp) => {
    return !isExisty(value) || isEmpty(value) || regexp.test(value)
}

const isRequired = value => {
    return {
        rst: isExisty(value) && !isEmpty(value),
        message: '不能为空',
    }
}

/**
 * 是否是合法的email地址，内部调用this.matchRegexp
 * @interface isEmail
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const  isEmail = (value) => {
    const reg = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
    return {
        rst: matchRegexp(value, reg),
        message: '请输入正确的邮件地址',
    }
}

/**
 * 是否是合法的url地址，内部调用this.matchRegexp
 * @interface isUrl
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isUrl = (value) => {
    value = value && value.trim()
    const reg = /((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&ampx:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/
    return {
        rst: matchRegexp(value, reg),
        message: '请输入正确的URL地址',
    }
}

/**
 * 是否是带协议（不支持大写）的合法的url地址，内部调用this.matchRegexp
 * @interface isUrl
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isProtocolUrl = (value) => {
    value = value && value.trim()
    const reg = /((http|ftp|https):\/\/){1}[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/
    return {
        rst: matchRegexp(value, reg),
        message: '请输入正确的URL地址',
    }
}

/**
 * 是否是合法的座机号码或手机号码，内部调用this.matchRegexp
 * @interface isAnyPhone
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isAnyPhone = (value) => {
    const reg_phone = /^1[34578]\d{9}$/ig
    const reg_telephone = /^(0\d{2,3}-)?\d+$/ig
    return {
        rst: matchRegexp(value, reg_phone) || matchRegexp(value, reg_telephone),
        message: '请输入正确的电话号码',
    }
}

/**
 * 是否是合法的手机号码，内部调用this.matchRegexp
 * @interface isPhone
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isPhone = (value) => {
    const reg = /^1[34578]\d{9}$/ig
    return {
        rst: matchRegexp(value, reg),
        message: '请输入正确的手机号码',
    }
}

/**
 * 是否是合法的座机号码，内部调用this.matchRegexp
 * @interface isTelephone
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isTelephone = (value) => {
    const reg = /^(0\d{2,3}-)?\d+$/ig
    return {
        rst: matchRegexp(value, reg),
        message: '请输入正确的座机号码',
    }
}

/**
 * 是否是合法数字，内部调用this.matchRegexp
 * @interface isNumeric
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isNumeric = (value) => {
    return {
        rst: typeof value === 'number' || matchRegexp(value, /^[-+]?(?:\d*[.])?\d+$/),
        message: '请输入数字',
    }
}

/**
 * 正整数
 * @interface isNumeric
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isPosInter = (value) => {
    return {
        rst: /^\d+$/g.test(value),
        message: '请输入数字',
    }
}

/**
 * 是否是英文字母，内部调用this.matchRegexp
 * @interface isAlpha
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isAlpha = (value) => {
    return {
        rst: matchRegexp(value, /^[A-Za-z]+$/i),
        message: '请输入英文字母',
    }
}

/**
 * 是否是英文字母或数字，内部调用this.matchRegexp
 * @interface isAlphanumeric
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const isAlphanumeric = (value) => {
    return {
        rst: matchRegexp(value, /^[0-9A-Za-z_]+$/i),
        message: '请勿使用除字母、数字和英文下划线外的其他字符',
    }
}

/**
 * 是否小于最大长度，值如果不存在也会通过校验
 * @interface maxLength
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const maxLength = (value, length) => {
    return {
        rst: !isExisty(value) || value.length < length + 1,
        message: '输入长度不能超过' + length,
    }
}

/**
 * 是否小于最大字节长度，值如果不存在也会通过校验，一个汉字的长度为2
 * @interface maxByteLength
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const maxByteLength = (value, length) => {
    return {
        rst: !isExisty(value) || getLengthInBytes(value) < length + 1,
        message: '不能超过' + length + '个字符',
    }
}

/**
 * 是否大于最小长度，值如果不存在或值为空也会通过校验
 * @interface minLength
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const minLength = (value, length) => {
    return {
        rst: !isExisty(value) || isEmpty(value) || value.length > length - 1,
        message: '输入长度不能小于' + length,
    }
}

/**
 * 是否大于最小字节长度，值如果不存在或值为空也会通过校验，一个汉字的长度为2
 * @interface minByteLength
 * @param {Any} value 待校验值
 * @return {ValidateResult} 校验结果对象
 */
const minByteLength = (value, length) => {
    return {
        rst: !isExisty(value) || getLengthInBytes(value) > length - 1,
        message: '不能少于' + length + '个字符',
    }
}

export default {
    isRequired,
    isEmail,
    isUrl,
    isProtocolUrl,
    isAnyPhone,
    isPhone,
    isTelephone,
    isNumeric,
    isPosInter,
    isAlpha,
    isAlphanumeric,
    maxLength,
    maxByteLength,
    minLength,
    minByteLength,
}
