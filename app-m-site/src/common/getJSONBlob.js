import { Toast } from 'antd-mobile'
import $ from 'jquery'

export default (url, data) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            type: 'post',
            data,
            dataType: 'json',
            processData: false,
            cache: false,
            contentType: false,
        }).done(res => {
            resolve(res)
        }).fail((jqXHR, textStatus) => {
            Toast.fail(jqXHR.responseText)
            reject()
        })
    })
}