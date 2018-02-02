//获取应用实例
//var app = getApp();
//var Promise = require('../../es6-promise.min.js');
var common = require('../../common.js');
var request = common.request;
var log = common.log;
//var getLocation = common.getLocation;

//注册页面
Page({
  data: {
    orders: [],
    driver: {},
    books: []
  },

  payTaxiOrder: function (event) {
    //console.log("payTaxiOrder: ", event.currentTarget.dataset);
    var that = this;
    var data = { orderId: event.currentTarget.dataset.orderid};
   
    request("/payTaxiOrder", data, app.globalData.sid)
      .then(log)
      .then(res => {
        var payres = res.data.payres;
        wx.requestPayment({
          "timeStamp": payres.timeStamp,
          "nonceStr": payres.nonceStr,
          "package": payres.package,
          "signType": 'MD5',
          "paySign": payres.paySign,
          success: function (res) {
            wx.showToast({
              title: '已成功支付出行订单！',
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '支付失败！请和我们客服联系',
            })
          }
        });
      })
      .catch(log);
  },

  getTaxiOrders: function () {
    request('/getTaxiOrders', {}, wx.getStorageSync('sid'))
      .then(log)
      .then(res => this.setData({ orders: res.data.orders, taxiOrdersTitle: res.data.title}))
      .catch(log);
  },

  getDriver: function () {
    request('/getDriver', {}, wx.getStorageSync('sid'))
      .then(log)
      .then(res => this.setData({ driver: res.data }))
      .catch(log);
  },

  getBusOrders: function () {
    request('/getBusOrders', { sid: wx.getStorageSync('sid') })
      .then(log)
      .then(res => {
        var busOrders = res.data.map(function (item) {
          var s = item.statuses.pop();
          item.lastStatus = s;
          return item;
        });
        this.setData({ books: busOrders, bookTitle: res.data.title || "车票预订信息" });
        console.log("busOrders: ", busOrders);
      })
      //.then(log)
      .catch(log);
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: '我的出行'
    })
  },

  onShow: function () {
    this.getTaxiOrders();
    this.getBusOrders();
    this.getDriver();
  },
});
