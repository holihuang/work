/*
* @file: 新建|编辑 验空
* @author: huanghaolei
* @date: 2018-09-25
* */

export default {
    postId: {
        isRequired: true,
        text: '帖子id',
    },
    title: {
        isRequired: true,
        text: '帖子标题',
    },
    postCreateTime: {
        isRequired: true,
        text: '发帖时间',
    },
    studentId: {
        isRequired: true,
        text: '学员id',
    },
    studentName: {
        isRequired: true,
        text: '学员姓名',
    },
    education: {
        isRequired: true,
        text: '原学历',
    },
    academy: {
        isRequired: true,
        text: '学院',
    },
    majorName: {
        isRequired: true,
        text: '专业',
    },
    province: {
        isRequired: true,
        text: '省',
    },
    sex: {
        isRequired: true,
        text: '性别',
    },
    age: {
        isRequired: true,
        text: '年龄',
    },
    career: {
        isRequired: true,
        text: '职业',
    },
    // identityLabel: {
    //     isRequired: false,
    //     text: '身份标签',
    // },
    contentLabel: {
        isRequired: true,
        text: '内容标签',
    },
    postSource: {
        isRequired: true,
        text: '帖子来源',
    },
    content: {
        isRequired: true,
        text: '案例内容',
        step: 2,
    },
    productType: {
        isRequired: true,
        text: '产品分类',
        defaultValue: -1,
    },
}
