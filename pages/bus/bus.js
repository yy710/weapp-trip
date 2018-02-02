//var Promise = require('../../es6-promise.min.js');
var common = require('../../common.js');
var request = common.request;
var log = common.log;
var app = getApp();

Page({
    data: {
        buses: null
    },
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
        
    },
    onShow: function () {
        // 生命周期函数--监听页面显示
        var that = this;
        request('/getBuses', {}, app.globalData.sid)
            .then(log)
            .then(res => {
                that.setData({ buses: res.data });
            })
            .catch(log);
    },
    onShareAppMessage: function () {
        // 用户点击右上角分享
        return {
            title: '陆杰出行', // 分享标题
            desc: '云南城际快车就用陆杰出行', // 分享描述
            path: '/pages/bus/bus' // 分享路径
        }
    }
})