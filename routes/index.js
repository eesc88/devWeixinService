var express = require('express');
var router = express.Router();
var AV = require('leanengine');
var sha1 = require('sha1');

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Todo = AV.Object.extend('Todo');
TOKEN = "TokenDevservice";
SORT_STRING = "i1jyidORZNeDkyaLTLgWwr4UKXLvXxwPuYx0KIhZUxy";
/**
 * 定义路由：获取所有 Todo 列表
 */
router.get('/', function (req, res, next) {
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    console.log("signature:" + signature + "<>timestamp:" + timestamp + "<>nonce:" + nonce);
    var token = TOKEN;
    var tmpArr = [token, timestamp, nonce];
    tmpArr.sort();
    var sha = sha1('mima123465');
    console.log("sha:" + sha);
    //sort(tmpArr, SORT_STRING);
    //var tmpStr = implode(tmpArr);
    //tmpStr = sha1(tmpStr);
    //
    //if (tmpStr == signature) {
    //    return true;
    //} else {
    //    return false;
    //}
    res.send("success");
});

/**
 * 定义路由：创建新的 todo
 */
router.post('/', function (req, res, next) {
    var content = req.body.content;
    var todo = new Todo();
    if (req.AV.user) {
        // 设置 ACL，可以使该 todo 只允许创建者修改，其他人只读
        // 更多的 ACL 控制详见： https://leancloud.cn/docs/js_guide.html#其他对象的安全
        var acl = new AV.ACL(req.AV.user);
        acl.setPublicReadAccess(true);
        todo.setACL(acl);
    }
    todo.set('content', content);
    todo.set('status', 0);
    if (req.AV.user) {
        todo.set('author', req.AV.user);
    }
    todo.save(null, {
        success: function (todo) {
            res.redirect('/todos')
        },
        error: function (todo, err) {
            next(err);
        }
    });
});

/**
 * 定义路由：删除指定 todo
 */
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    var status = req.query.status;
    var todo = AV.Object.createWithoutData('Todo', id);
    todo.destroy({
        success: function (todo) {
            res.redirect('/todos?status=' + status);
        },
        error: function (todo, err) {
            res.redirect('/todos?status=' + status + '&errMsg=' + JSON.stringify(err))
        }
    })
})

/**
 * 定义路由：标记指定 todo 状态为「完成」
 */
router.post('/:id/done', function (req, res, next) {
    var id = req.params.id;
    var todo = AV.Object.createWithoutData('Todo', id);
    todo.save({'status': 1}, {
        success: function () {
            res.redirect('/todos')
        },
        error: function (todo, err) {
            res.redirect('/todos?errMsg=' + JSON.stringify(err))
        }
    })
})

/**
 * 定义路由：标记指定 todo 状态为「未完成」
 */
router.post('/:id/undone', function (req, res, next) {
    var id = req.params.id;
    var todo = AV.Object.createWithoutData('Todo', id);
    todo.save({'status': 0}, {
        success: function () {
            res.redirect('/todos?status=1')
        },
        error: function (status, err) {
            res.redirect('/todos?status=1&errMsg=' + JSON.stringify(err))
        }
    })
})

module.exports = router;
