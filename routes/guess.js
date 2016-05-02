/**
 * Created by CCOOCC on 2016/5/2.
 */
var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {

    res.success("success");

});

module.exports = router;