import React, { Component } from 'react'
import { Icon, Modal, Button } from 'antd'

import { common } from 'common/common'
import util from 'common/util'

import service from '../service'

import PdfViewer from '../pdfViewer/PdfViewer'

const OFFICE_ONLINE_VIEW_URL = 'https://view.officeapps.live.com/op/embed.aspx?src='
const noop = _ => {}
class FilePreview extends Component {
    constructor(props) {
        super(props)
        this.state = {
            prewHtml: '<p>加载中...</p>'
        }
    }

    componentDidMount() {
        // 1.大点 => 周知后端有查看  2.如果是html类型，则获取具体的预览内容
        service.getVersion({
            index: this.props.source.pageIndex
        }).then(rst => {
            // 如果是html，则更新下state
            this.props.source.pageType === 0 && this.setState({
                prewHtml: rst.data[0].pageContent
            })
        }, rst => {
            console.warn('get html version fail')
            this.setState({
                prewHtml: `<p>${rst}</p>`
            })
        })

        const { pageType } = this.props.source

        const { userId } = common.getUserInfo()

        util.slog('im_kn_prew', { userId, pageType })
    }

    renderPreviewContent = _ => {
        const { pageType, pageResourceUrl } = this.props.source

        if ([3].indexOf(+pageType) > -1) {
            return <PdfViewer filePath={pageResourceUrl}></PdfViewer>
        } else if ([1, 2, 9].indexOf(+pageType) > -1) {
            return <iframe style={{width: '100%', border: 'none', height: '600px'}} src={OFFICE_ONLINE_VIEW_URL + encodeURIComponent(pageResourceUrl)}></iframe>
        } else if ([5].indexOf(+pageType) > -1) {
            return <video style={{maxWidth: '100%',display: 'block', margin: 'auto'}} controls="controls">
            <source src={pageResourceUrl} type="video/mp4" />
            </video>
        } else if ([6].indexOf(+pageType) > -1) {
            return <audio style={{maxWidth: '100%',display: 'block', margin: 'auto'}} controls="controls">
                <source src={pageResourceUrl} type="audio/mp3" />
            </audio>
        } else if ([8].indexOf(+pageType) > -1) {
            return <img style={{maxWidth: '100%',display: 'block', margin: 'auto'}} src={pageResourceUrl}/>
        } else if ([0].indexOf(+pageType) > -1) {
            return (
                <div dangerouslySetInnerHTML = {{ __html: this.state.prewHtml}}></div>
            )
        }
    }
    // 发送文件 TODO是json还是链接
    send() {
        const source = this.props.source

        if (source.pageType === 0) {
            alert('该文本类型不支持自动发送，请手动复制操作~')
            return
        }

        this.props.send({
            pageType: source.pageType,
            fileUrl: source.pageResourceUrl,
            fileName: source.pageTitle,
            fileSize: source.pageSize,
        })
    }

    down() {
        this.props.source.pageResourceUrl && window.open(this.props.source.pageResourceUrl)
    }

    render() {
        const { source, handleCancel = noop } = this.props
        const { pageTitle, pageType } = source
        
        const modalProps = [5,6,8].indexOf(+pageType) > -1 ? {} : {width: 860}

        const sendProps = {
            key: 'knbase-send',
            type: 'primary',
            style: {
                marginRight: '20px',
            },
            onClick: (e) => {
                this.send(e)

                const { userId } = common.getUserInfo()
            }
        }

        const downProps = {
            key: 'knbase-dowb',
            type: 'primary',
            style: {
                marginRight: '20px',
            },
            onClick: () => {
                this.down()

                const { userId } = common.getUserInfo()
            }
        }

        return (
            <Modal title={pageTitle} visible={true}
                onCancel={handleCancel}
                footer={null}
                {...modalProps}
                >
                {
                    this.renderPreviewContent()
                }
                {
                    +this.props.source.pageType === 0 || <div style={{
                        textAlign: 'right',
                        paddingTop: '15px',
                    }}>
                        <Button {...sendProps}>发送</Button>
                        <Button {...downProps}>下载</Button>
                    </div>
                }
            </Modal>
        )
    }
}

export default FilePreview
