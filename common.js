var Promise = require('./es6-promise.min.js');

function request(action, data, sid) {
  return new Promise(function (resolve, reject) {
    if (sid) data.sid = sid;
    wx.request({
      url: 'https://www.xingshenxunjiechuxing.com/trip' + action,
      data: data,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: { 'Accept': 'application/json' }, // 设置请求的 header
      success: resolve,
      fail: reject,
      complete: function () {
        wx.hideToast();
      }
    })
  });
}

function getLabel(loc) {
  return request('/getLabel', loc).then(r => { return r.data });
}

function getLocation() {
  return _getLocation().then(getLabel).catch(r => r.label = "未能连接远程服务器！");
}

function _getLocation() {
  return new Promise(function (resolve, reject) {
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: resolve,
      fail: reject
    })
  });
}

function chooseLocation() {
  return new Promise(function (resolve, reject) {
    wx.chooseLocation({
      success: resolve,
      fail: reject
    })
  });
}

function getNav(locs) {
  return request('/nav', { points: locs , sid: wx.getStorageSync("sid")});
}

function log(req) {
  return new Promise(function (resolve, reject) {
    console.log(req);
    resolve(req);
  });
}

module.exports = {
  request: request,
  log: log,
  getLocation: getLocation,
  chooseLocation: chooseLocation,
  getNav: getNav
}