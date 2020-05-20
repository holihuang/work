/*
** @file: userCenter
** @author: huanghaolei
** @date: 2019-08-01
*/
import { handleActions } from 'redux-actions'
import Constants from '../constants/userCenter'
import { Toast } from 'antd-mobile'

export default handleActions({
    [Constants.GET_PERSON_CENTER_RETRIVE_SUCCEEDED](state, action) {
        const { data } = action
        return {
            ...state,
            ...data,
        }
    },
    [Constants.GET_PERSON_CENTER_RETRIVE_FAILED](state, action) {
        const { e } = action
        Toast.fail(e)
        return {...state}
    },
    [Constants.GET_RECORD_SWITCHER_MANAGER_SUCCEEDED](state, action) {
        const { data } = action
        // Toast.success(data || '开关切换成功！')
        return { ...state }
    },
    [Constants.GET_RECORD_SWITCHER_MANAGER_FAILED](state, action) {
        const { e } = action
        // Toast.fail(e)
        return { ...state }
    }
}, {
    
})