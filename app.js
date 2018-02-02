var common = require('./common.js');
var session = require('./session.js');
var log = common.log;
//var EventProxy = require('./eventproxy.js');

App({
  onLaunch: function () {
    var that = this;
    session.start()
      //.then(log)
      .then(res => {
        that.globalData.userInfo = res.wxGetUserInfoRes.userInfo;
        that.globalData.sid = res.sid;
      })
      .catch(log);
  },
  //定义全局数据
  globalData: {
    //保存用户信息
    userInfo: null,
    //保存订单信息
    order: null,
    //保存 sid
    sid: null,
    books: []
  }
});