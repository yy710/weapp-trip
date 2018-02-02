//var Promise = require('./es6-promise.min.js');
var common = require('./common.js');
var request = common.request;
var log = common.log;

var session = {
    sid: null,
    userInfo: null,
    req: {}
};

session.setUserInfo = function (u) {
    this.userInfo = u;
}

session.start = function () {
    return this.check().then(res => { return res ? this.loginedTo() : this.noLoginTo(); }).catch(log);
}

session.noLoginTo = function () {
    var req = {};
    return this.login(req)
        //.then(log)
        .then(this.getUserInfo(true))
        //.then(log)
        .then(this.requestSid)
        //.then(log)
        .then(this.saveSid)
        //.then(log)
        .catch(log);
}

session.loginedTo = function () {
    var that = this;
    return this.verifySid().then(res => {
        if (res.valid === true) {
            console.log("verify sid ok!");
            return that.getUserInfo(false)(res).then(log);
        } else {
            console.log("verify sid fail!!");
            return that.noLoginTo();
        }
    }).catch(log);
}

session.verifySid = function () {
    var data = { sid: this.getSid() };
    return request('/verifySid', data).then(res => {
        data.valid = res.data.valid;
        return data;
    }).catch(log);
}

session.getSid = function () {
    return this.sid ? this.sid : wx.getStorageSync('sid');
}

session.saveSid = function (req) {
    //[weapp Promise bug] can't use 'this' in the function that return a promise object
    //this.sid = req.sid;
    return new Promise(function (resolve, reject) {
        wx.setStorage({
            key: 'sid',
            data: req.sid,
            success: res => resolve(req),
            fail: reject
        });
    });
}

session.getUserInfo = function (b) {
    return function (req) {
        return _getUserInfo(req, b);
    };
}


var _getUserInfo = function (req, b) {
    //var that = this;
    return new Promise(function (resolve, reject) {
        wx.getUserInfo({
            withCredentials: b,
            success: res => {
                // success
                //that.setUserInfo(res.userInfo);
                req.wxGetUserInfoRes = res;
                resolve(req);
            },
            fail: reject,
            complete: function (res) {
                // complete
            }
        })
    });
}

session.requestSid = function (req) {
    var data = {};
    data.code = req.wxLoginRes.code;
    data.encryptedData = req.wxGetUserInfoRes.encryptedData;
    data.iv = req.wxGetUserInfoRes.iv;
    return request('/onlogin', data).then(r => {
        req.sid = r.data.sid;
        return req;
    }).catch(log);
}

session.check = function () {
    return new Promise(function (resolve, reject) {
        wx.checkSession({
            success: res => resolve(true),
            fail: res => resolve(false)
        });
    });
}

session.login = function (req) {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function (res) {
                // success Object {errMsg: "login:ok", code: "003UFGFC0r2Jef2qEJDC06eEFC0UFGFK"
                if (!res.code) reject(res.errMsg);
                //var req = {};
                req.wxLoginRes = res;
                resolve(req);
            },
            fail: reject,
            complete: function (res) {
                // complete
            }
        });
    });
}

module.exports = session;