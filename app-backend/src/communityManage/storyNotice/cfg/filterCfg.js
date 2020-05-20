/*
** @file: filterCfg
** @author: huanghaolei
** @date: 2019-10-15
*/
import moment from 'moment'

export default component => {
    const { dispatch } = component
    const marginRight = '1%'
    const width = '19%'
    return {
        lineMargin: '20px',
        style: {
            marginTop: '30px',
        },
        list: [
            [{
                type: 'Input',
                field: 'pushTitle',
                placeholder: '通知标题关键词',
                marginRight,
                width,
                onChangeCb: e => {
                    dispatch('onChangePushTitle', { pushTitle: e.target.value.trim() })
                },
            }, {
                type: 'Input',
                field: 'operator',
                placeholder: '操作人263账号',
                marginRight,
                width,
                onChangeCb: e => {
                    dispatch('onChangeOperator', { operator: e.target.value.trim() })
                },
            },
            {
                type: 'RangePicker',
                field: 'pushTimeRangePicker',
                dateFormat: 'YYYY-MM-DD',
                marginRight,
                width: '39%',
                onChangeCb: e => {
                    const [startTime, endTime] = e.value
                    // const start = startTime ? moment(startTime).format('YYYY-MM-DD HH:mm:00') : startTime
                    // const end = endTime ? moment(endTime).format('YYYY-MM-DD HH:mm:00') : endTime
                    dispatch('onChangeRangePicker', { pushTimeStart: startTime, pushTimeEnd: endTime })
                },
            },
            {
                type: 'Button',
                field: 'query',
                text: '查询',
                skin: 'primary',
                marginRight,
                onClickCb: e => {
                    dispatch('onQuery', { pageNo: 1 })
                },
            }, {
                type: 'Button',
                field: 'create',
                text: '新建',
                skin: 'primary',
                onClickCb: (e, filterComponent) => {
                    // window.location.hash = '#/storyNotice/add'
                    dispatch('onAdd', { showCreateModal: true })
                },
            }],
        ],
    }
}
