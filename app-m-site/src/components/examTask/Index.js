/*
** @file: ExamTask组价
** @author: huanghaolei
** @date: 2020-02-26
*/
import React from 'react'
import { Toast } from 'antd-mobile'
import classnames from 'classnames'
import Constants from 'Constants/examTask'

import ExchangeModal from './ExchangeModal'
import ShareClassModal from './ShareClassModal'
import cfg from './cfg'
import style from 'styles/less/examTask.less'

const EXAM_REWARD_BASE_URL = process.env.NODE_ENV === 'production' ? 'http://luntan.sunlands.com' : 'http://172.16.100.203:7089'

class ExamTask extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showExchangeModal: false,
            showShareModal: false,
        }
    }

    componentDidMount() {
        this.setTitle()
        this.setPageAppearCb()
        this.getList()
    }

    getList = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_GET_STU_TASKS_REQUESTED,
            payload: {
                params: {
                    ...this.getBasicParams()
                },
            },
        })
    }

    setPageAppearCb = _ => {
        window.JSBridgeOnPageAppear = (JSONStr) => {
            const { type = '', source = '' } = JSONStr ? JSON.parse(JSONStr) : {}
            const ua = navigator.userAgent
            const reg = /ios/i
            if (reg.test(ua)) {
                if (type === 'native') {
                    this.getList()
                } else {
                    location.reload()
                }
            } else {
                this.getList()
            }
        }
    }

    getTikuInfo = _ => {
        return new Promise((resolve, reject) => {
            const { dispatch } = this.props
            dispatch({
                type: Constants.GET_TIKU_INFO_REQUESTED,
                payload: {
                    params: {
                        ...this.getBasicParams()
                    },
                    cb: () => {
                        resolve()
                    }
                },
            })
        })
    }

    setTitle = _ => {
        if (typeof JSBridge !== 'undefined') {
            JSBridge.doAction('actionSetTitle', '', JSON.stringify({
                title: cfg.docTitle,
            }))
        }
    }

    goToNative = opt => {
        const toNativeWithParamsArr = ['topic']
        if (typeof JSBridge !== 'undefined') {
            const { targetPath, targetParam, taskType } = opt
            let data = {}
            if(toNativeWithParamsArr.includes(taskType)) {
                data = {
                    topicContent: targetParam,
                }
            }
            this.toNative({
                page: targetPath,
                data: targetParam,
            }, JSON.stringify(data))
        }
    }

    toNative = (opt, dataStr) => {
        const { page = '', hooks = {}, data = {}, actionType = 'gotoNative' } = opt
        if (typeof JSBridge !== 'undefined') {
            const list = [page]
            if (actionType === 'gotoNative') {
                list.push(dataStr)
            } else if(actionType === 'doAction') {
                 const nameSet = {}
                 const now = new Date().getTime()
                 Object.keys(hooks).forEach(item => {
                     window[`${item}${now}`] = hooks[item]
                     nameSet[item] = `${item}${now}`
                 })
 
                 // 其他回调参数（succeedCallback，failedCallback，canceledCallback 之外的参数 ）
                 const otherHookKeys = Object.keys(hooks)
                     .filter(item => item !== 'succeedCallback' && item !== 'failedCallback' && item !== 'canceledCallback')
 
                 const others = otherHookKeys.reduce((res, item) => {
                     return { ...res, [item]: nameSet[item] }
                 }, {})
 
                 list.push(JSON.stringify({
                     succeedCallback: nameSet['succeedCallback'],
                     failedCallback: nameSet['failedCallback'],
                     canceledCallback: nameSet['canceledCallback'],
                     ...others,
                 }), dataStr)
            }
            JSBridge[actionType](...list)
        }
    }

    appShare = (hooks = {}, params = {}) => {
        const nameSet = {}
        if (typeof JSBridge !== 'undefined') {
            const now = new Date().getTime()
            Object.keys(hooks).forEach(item => {
                window[`${item}${now}`] = hooks[item]
                nameSet[item] = `${item}${now}`
            })
            JSBridge.doAction('actionShare', JSON.stringify({
                succeedCallback: nameSet['succeedCallback'],
                failedCallback: nameSet['failedCallback'],
                canceledCallback: nameSet['canceledCallback']
            }), JSON.stringify({
                title: '',
                content: '',
                url: '',
                imgUrl: '',
                channel: 6,
                ...params,
            }))
        }
    }

    handleShare = opt => {
        const { targetParam: { channel }, taskType } = opt
        this.appShare({
            succeedCallback: () => {
                this.doTask({ taskType })
            },
        }, {
            title: '集卡瓜分10万考试补贴',
            content: '最高可得666元，快来参加吧！',
            imgUrl: 'https://sfs-public.shangdejigou.cn/social_community/original/20200302/1234376136293744640.jpg',
            url: `${EXAM_REWARD_BASE_URL}/community-pc-war/m/#/appDownload`,
            channel,
        })
    }

    handleExchange = opt => {
        this.getTikuInfo().then(e => {
            this.setState({
                showExchangeModal: true,
            })
        })
    }

    handleShareClass = opt => {
        this.setState({
            showShareModal: true,
        })
    }

    handleAcquire = opt => {
        const { totalOppoCnt, taskType } = opt
        Toast.info(`增加${totalOppoCnt}次抽奖机会`)
        setTimeout(() => {
            this.doTask({ taskType })
        }, 1000)
    }

    toNext = opt => {
        const { targetType, targetPath, taskType, taskStatus } = opt
        if (targetType === 'h5') {
            window.location.href = targetPath
        } else if(targetType === 'native') {
            this.goToNative(opt)
        } else if(targetType === 'share') {
            this.handleShare(opt)
        } else if(targetType === 'exchange') {
            this.handleExchange(opt)
        } else if(targetType === 'shareClass') {
            this.handleShareClass(opt)
        }
        if (!+taskStatus) {
            const noDoTaskList = ['share', 'shareClass', 'exchangeTiku']
            if (noDoTaskList.includes(taskType)) return
            this.doTask({ taskType })
        }
    }

    handleBtnClk = (opt = {}) => {
        const { taskStatus } = opt
        if (!+taskStatus) {
            // 去完成
            this.toNext(opt)
        } else if (+taskStatus === 1) {
            // 领取
            this.handleAcquire(opt)
        } else if(+taskStatus === 2) {
            // 完成
            this.toNext(opt)
        }
    }

    mergeData = _ => {
        const { examTask: { list } } = this.props
        const arr = []
        list.forEach(item => {
            const { taskType } = item
            const shareObj = taskType in cfg.shares ? { targetType: cfg.shares[taskType].type, targetParam: { channel: cfg.shares[taskType].channel } } : {}
            const exchangeObj = taskType in cfg.exchanges ? { targetType: 'exchange' } : {}
            arr.push({
                ...item,
                icon: cfg.icons[taskType],
                ...shareObj,
                ...exchangeObj,
            })
        })
        return arr
    }

    renderTaskList = _ => {
        const list = this.mergeData()
        const { states } = cfg
        return list.map(item => {
            const { taskName, totalOppoCnt, taskType, taskStatus, currentStepCnt = 0, totalStepCnt = 0, icon } = item
            const btnProps = {
                className: classnames(style.operBtn, { [style.btnRed]: +taskStatus === 1, [style.btnGray]: +taskStatus === 2 }),
                onClick: this.handleBtnClk.bind(this, item),
            }

            return (
                <div className={style.row}>
                    <div className={style.left}>
                        <img src={icon} className={style.icon} />
                        <div>
                            <div className={style.title}>{ taskName }</div>
                            <div className={style.count}>增加{ totalOppoCnt }次抽卡机会</div>
                        </div>
                    </div>
                    <div className={style.right}>
                        <div {...btnProps}>
                            { typeof states[taskStatus] === 'string' ? states[taskStatus] : states[taskStatus][taskType] }
                        </div>
                        {
                            +totalStepCnt > 1 ? (
                                <div className={style.step}>进度{currentStepCnt}/{totalStepCnt}</div>
                            ) : null 
                        }
                    </div>
                </div>
            )
        })
    }

    getBasicParams = _ => {
        let params = {}
        if (typeof JSBridge !== 'undefined') {
            const { userId, userAuth } = JSON.parse(JSBridge.getData('userInfo'))
            params = {
                stuId: userId,
                userAuth,
            }
        }
        return params
    }

    handleExchangeModal = key => {
        this.closeModal(key)
    }

    handleShareClassModal = key => {
        this.closeModal(key)
    }

    closeModal = (key = '') => {
        this.setState({
            [key]: false
        })
    }

    onConfirm = opt => {
        const { taskType } = opt
        this.closeModal('showExchangeModal')
        this.doTask({ taskType })
    }

    doTask = opt => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.DO_TASK_REQUESTED,
            payload: {
                params: {
                    ...opt,
                    ...this.getBasicParams(),
                },
                cb: () => {
                    this.getList()
                }
            },
        })
    }

    sharePic = opt => {
        const { key, field } = opt
        const { dispatch } = this.props
        if (typeof JSBridge !== 'undefined') {
            const basicParams = {
                imgUrl: 'https://sfs-public.shangdejigou.cn/social_community/original/20200310/1237342955963023360.jpg',
            }
            if (key === 'wx') {
                JSBridge.doAction('shareImgToWx', '{}', JSON.stringify({
                    ...basicParams,
                }))
            } else if(key === 'pyq') {
                JSBridge.doAction('sharePoster', '{}', JSON.stringify({
                    ...basicParams,
                    sharePlatForm: 2,
                }))
            }
            this.doTask({ taskType: field })
            this.closeModal('showShareModal')
        }
    }

    handleShareClassConfirm = opt => {
        this.sharePic(opt)
    }

    render() {
        const { examTask } = this.props
        const { showExchangeModal, showShareModal } = this.state
        const exchangeProps = {
            showExchangeModal,
            onClose: this.handleExchangeModal.bind(this, 'showExchangeModal'),
            onConfirm: this.onConfirm,
            data: examTask,
        }
        const shareClassProps = {
            showShareModal,
            onClose: this.handleShareClassModal.bind(this, 'showShareModal'),
            onConfirm: (key) => {
                this.handleShareClassConfirm({ key, field: 'shareClass' })
            },
        }
        return (
            <div className={style.wrapper}>
                <div className={style.cardTitleWrapper}>
                    <div className={style.cardTitle}>{cfg.title}</div>
                </div>
                <div className={style.contentWrapper}>
                    <div className={style.content}>
                        { this.renderTaskList() }
                    </div>
                </div>
                <ExchangeModal {...exchangeProps} />
                <ShareClassModal {...shareClassProps} />
            </div>
        )
    }
}

export default ExamTask
