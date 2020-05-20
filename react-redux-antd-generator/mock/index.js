const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const mockApi = require('./mock.js')

app.set('port', process.env.PORT || 8227)
app.use(bodyParser.urlencoded({
    extended: false,
}))
app.use(bodyParser.json())

app.listen(app.get('port'), () => {
    console.log(`mock server started...`)
})

const parseAPI = api => {
    const splited = api.trim().replace(/\s+/g, ' ').split(' ')
    if (splited.length === 1) {
        return ['get', splited[0]]
    }
    return [splited[0].toLowerCase(), splited[1]]
}

mockApi && Object.keys(mockApi).forEach(api => {
    const [method, url] = parseAPI(api)
    app[method](url, mockApi[api])
})
