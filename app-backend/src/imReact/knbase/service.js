/**
 * @file IM接知识库
 *
 * @auth huangyiting
 * @date 2018-05-09
 */

import { ajax } from 'getJSON'

// 搜索
const getToken = params => ajax('/community-manager-war/public/getPersonCenterToken.action', params)
// const getToken = () => {}

// 搜索
const init = params => ajax('/community-manager-war/wiki-parent/svbk/common/init', params)

// 搜索
const getKnbase = params => ajax('/community-manager-war/wiki-parent/svbk/doc/get', params)

// 最近查看
const getHiskn = params => ajax('/community-manager-war/wiki-parent/svbk/doc/recentlyCheck', params)

// html格式预览内容
const getVersion = params => ajax('/community-manager-war/wiki-parent/svbk/doc/version', params)

export default {
    getToken,
    init,
    getKnbase,
    getHiskn,
    getVersion,
}
