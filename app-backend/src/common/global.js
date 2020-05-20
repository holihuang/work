
const global = {
    permissions: {},
    pageParams: {},
    knbaseInited: false, // 个人中心 - 知识库token & init成功标志
    buildGroupSuccess: false, // 建群成功的标志
    allQuicklyReplys: [], // 所有话术
    BJ_MONTIOR_ID: '-', // badjs page id
}
window.global = global
export { global }
