import { handleActions } from 'redux-actions';
import { 
    GET_MAJOR_INFO_SUCCEEDED, GET_MAJOR_INFO_FAILED, 
    GET_SCHOOL_INTRODUCTION_SUCCEEDED, GET_SCHOOL_INTRODUCTION_FAILED,
    GET_ALL_COURSE_LIST_SUCCEEDED, GET_ALL_COURSE_LIST_FAILED,
    GET_POST_BY_MAJORID_SUCCEEDED, GET_POST_BY_MAJORID_FAILED,
} from '../constants/course';
import { Toast } from 'antd-mobile';

export default handleActions({
    [GET_MAJOR_INFO_SUCCEEDED](state, action) {
        return {
            ...state,
            ...action.data
        }
    },
    [GET_MAJOR_INFO_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_POST_BY_MAJORID_SUCCEEDED](state, action) {
        const { cb } = action
        typeof cb === 'function' && cb(action.data)
        return {
            ...state,
            topicList: action.data
        }
    },
    [GET_POST_BY_MAJORID_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_ALL_COURSE_LIST_SUCCEEDED](state, action) {
        return {
            ...state,
            courseList: action.data,
        }
    },
    [GET_ALL_COURSE_LIST_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [GET_SCHOOL_INTRODUCTION_SUCCEEDED](state, action) {
        return {
            ...state,
            schoolInfo: action.data
        }
    },
    [GET_SCHOOL_INTRODUCTION_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
}, {
    videoList: [],
    teacherInfo: [],
    classInfo: [],
    schoolInfo: [],
    majorFeature: [],
    majorCode: '',
    school: '',
    courseCount: '',
    degreeType: '',
    condition: '',
    majorProperty: '',
    learnYears: '',
    examTime: '',
    introduction: '',
    learnPlanUrl: '',
    lessonFeature: '',
    topicList: {
        countPerPage: 10,
        pageCount: 0,
        pageIndex: 1,
        resultList: []
    },
    courseList: {
        examTime: '',
        result: [],
    },
    schoolInfo: {
        introduction: '',
        schoolUrl: '',
    },
})
