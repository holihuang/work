const { parseJsonFile } = require('./util.js');

const mock = {
    // 适应老的json file的数据
    [`POST /api/login`] (req, res) {
        setTimeout(_=>{ // mock loading
            res.json(
                parseJsonFile('./testdata/login')
            )
        }, 100)
    },

    // 适应老的json file的数据
    [`POST /api/logout`] (req, res) {
        setTimeout(_=>{ // mock loading
            res.json(
                parseJsonFile('./testdata/logout')
            )
        }, 100)
    },

    [`GET /api/users`] (req, res) {
        res.json(
            {
                "flag": "1",
                "message": "" ,
                "data": [
                    {
                        "name": "周轶",
                        "email": "zhouyi@sunlands.com",
                        "title": "engineer",
                    },
                ]
            }
        );
    }
}
module.exports = mock;