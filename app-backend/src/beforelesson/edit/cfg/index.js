/**
 * @file 体验前置
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

export default {
    delMap: {
        basic: '',
        qa: '确定删除该视频吗？',
        class: '确定要删除该班型？删除后该班型所独有的地域信息和科目信息会被同时删除，请谨慎操作！',
        teacher: '确定删除该讲师吗',
        region: '',
        subject: '',
        school: '确定删除该院校吗？',
    },
    serviceMap: {
        basic: {
            get: 'getMajorById',
            add: '',
            del: '',
            mod: 'updateMajor',
        },
        qa: {
            get: 'getVideoList',
            add: 'addVideo',
            del: 'deleteVideo',
            mod: 'updateVideo',
        },
		teacher: {
			get: 'getTeacherList',
			add: 'addTeacher',
			del: 'deleteTeacher',
			mod: 'updateTeacher',
		},
		class: {
			get: 'getClassList',
			add: 'addClass',
			del: 'deleteClassById',
			mod: 'updateClassById',
		},
		region: {
			get: 'getRegionList',
			add: '',
			del: '',
			mod: 'updateRegionInfo',
        },
		subject: {
			get: 'getCourseList',
			add: '',
			del: '',
			mod: 'updateCourse',
		},
        school: {
            get: 'getSchoolList',
            add: 'addSchool',
            del: 'deleteSchool',
            mod: 'updateSchool',
        },
    },
    editText: {
        add: '新增',
        edit: '编辑',
    },
	pageSizeOptions: ['15', '30', '50'],
	major: [{
        label: '请选择',
        value: '',
    },
    {
        label: '研究生',
        value: '1',
    },
    {
        label: '自考本科',
        value: '2',
    },
    {
        label: '自考专科',
        value: '3',
    },
    {
        label: '资格证书',
        value: '4',
    }],
    stat: [{
        label: '请选择',
        value: '',
    },
    {
        label: '隐藏',
        value: '1',
    },
    {
        label: '显示',
        value: '2',
    }]
}