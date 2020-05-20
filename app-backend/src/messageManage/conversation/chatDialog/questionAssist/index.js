import _ from 'lodash'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { Modal } from 'antd'

import { service } from 'common/service'
import { common } from 'common/common'
import AnswerList from './answerList'
import {chatInfoModelUtil} from '../../chatInfo'

const Model = Backbone.Model.extend({
    defaults: {
       
    },
})

const QuestionAssist = Backbone.View.extend({
    initialize(options) {
        const { answerList, callback, isShowAssist } = options
        this.model = new Model()
        this.listenTo(this.model, 'change', this.render)
        this.model.set({ answerList, callback, isShowAssist })
    },

    events: {
        // 'click #sendMessageBtn': 'sendTextMessage',
    },

    destroy(type = '') {
        chatInfoModelUtil.clearAnswerList(type)
        // this.$el.html('')
        unmountComponentAtNode(this.el)
    },

    logPublic(content) {},

    render() {
        const childProps = {
            ...this.model.toJSON(),
            dispatch: (name, ...rest) => {
                if (this[name] && typeof this[name] === 'function') {
                    return this[name](...rest)
                }
                console.warn(`can not find method: ${name}`)
                return undefined
            },
        }
        render(
            <div>
                <AnswerList key={Date()} {...childProps} />
            </div>, this.el)
    },
    remove() {
        // this.el.innerHTML = ''
        // console.log(555555, React.isValidElement(this.el))
        this.el && unmountComponentAtNode(this.el)
        this.stopListening()
    },
})

export default QuestionAssist
export { QuestionAssist }
