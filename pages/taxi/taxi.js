//var Promise = require('../../es6-promise.min.js');
var common = require('../../common.js');
var request = common.request;
var log = common.log;
var getLocation = common.getLocation;
var chooseLocation = common.chooseLocation;
var getNav = common.getNav;
//var app = getApp();
var phones = []; //已验证电话列表

Page({
  data: {
    showNav: true,
    startloc: null,
    destloc: null,
    nav: null,
    phone: null,
    vCode: null,
    vCodeText: "获取验证码",
    hiddenVerifyCodeInput: true,
    hiddenGetVerifyCode: true,
    disabledSubmit: true
  },

  //event: 点击获取验证码
  getVerifyCode: function (e) {
    var that = this;
    that.setData({ "vCodeText": "请查收短信", "hiddenVerifyCodeInput": false, "vCode": null });
    console.log("bindTap getVifyCode: ", e);
    //reque vCode use phone
    request('/getVerifyCode', this.data.phone, wx.getStorageSync("sid"))
      .then(res => {
        that.setData({ "vCodeText": "请查收短信", "hiddenVerifyCodeInput": false });
      })
      .catch();
  },

  inputVerifyCode: function (e) {
    e.detail.value.length == 4 ? this.setData({ disabledSubmit: false }) : this.setData({ disabledSubmit: true });
  },

  //event: 输入手机号
  getPhone: function (e) {
    //console.log("event getPhone: ", e);
    this.data.vCodeText === "获取验证码" || this.setData({ "vCodeText": "获取验证码" });
    var phone = e.detail.value;
    //valid phone
    if (phone.length === 11) {
      //this.setData({ "phone": e.detail.value });
      var flag = false;
      phones.forEach(item => {
        if (phone == item) {
          flag = true;
        };
      });
      flag ? this.setData({ "disabledSubmit": false }) : this.setData({ "hiddenGetVerifyCode": false });
    } else {
      this.data.disabledSubmit || this.setData({ "disabledSubmit": true });
      this.data.hiddenGetVerifyCode || this.setData({ "hiddenGetVerifyCode": true });
      this.data.hiddenVerifyCodeInput || this.setData({ "hiddenVerifyCodeInput": true });
    }
  },

  setLocation: function (e) {
    console.log("call setLocation()!!!", e);
    chooseLocation().then(log).then(res => {
      var loc = { latitude: Number(res.latitude), longitude: Number(res.longitude), label: res.address + res.name };
      if (e.target.id === 'startLoc') this.setData({ startloc: loc });
      if (e.target.id === 'endLoc') this.setData({ destloc: loc });
      var locs = [this.data.startloc, this.data.destloc];
      if (locs[0] && locs[1]) {
        wx.showToast({
          title: '加载中, 请稍候...',
          icon: 'loading',
          duration: 10000
        });
        getNav(locs).then(res => {
          this.setData({ nav: res.data, phones: res.data.phones, showNav: true });
        });
      }
    }).catch(log);
  },

  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    phones = [18669077710, 13708438123];//load 已验证电话
    if (phones !== []) {
      this.setData({ phone: phones[0], "disabledSubmit": false });
    }
    getLocation()
      .then(log)
      .then(res => this.setData({ startloc: { latitude: Number(res.latitude), longitude: Number(res.longitude), label: res.label } }))
      .catch(log);

    request("/getUserPhones", {}, wx.getStorageSync("sid"))
      .then(res => {
        phones = res.data.phones;
      })
      .catch(log);
  },

  /** handle button order
   * save order to server
   */
  order: function (e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail);
    if (e.detail.value.phone) {
      let data = {
        sid: wx.getStorageSync('sid'),
        vCode: e.detail.value.verifyCode,
        order: {
          nav: that.data.nav,
          phone: e.detail.value.phone,
          formId: e.detail.formId,
          points: [that.data.startloc, that.data.destloc]
        }
      };

      //send order to sever
      request('/order', data).then(res => {
        app.globalData.order = res.data;
        if (res.data.status.id) {
          wx.switchTab({ url: '/pages/my/my', success: res => that.setData({ showNav: false }) });
        } else {
          wx.showModal({ title: '提示', content: '系统繁忙，请稍后再试。。。' });
        }
      }).catch(log);

    } else {
      wx.showModal({ title: '提示', content: '请输入手机号码！' });
    }
  },

  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: '兴盛迅捷出行', // 分享标题
      desc: '在普洱，出行就找兴盛迅捷', // 分享描述
      path: '/pages/taxi/taxi' // 分享路径
    }
  },
});
