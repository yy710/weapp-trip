
var app = getApp();
var common = require('../../common.js');
var session = common.session;
var request = common.request;
var log = common.log;

Page({
    data: {

    },

    onLoad: function (op) {
        console.log("op: ", op);
        this.setData({ bus: op, prices: op.price });
    },

    book: function (e) {
        var that = this;
        var book = e.detail.value;
        console.log("book", book);
        book.bus = this.data.bus;
        book.msg2 = "车票预订信息";
        book.prices = this.data.prices;
        book.bookName = `${book.bus.startLoc}到${book.bus.endLoc}`;
        book.picurl = "/image/byd-tang.jpg";
        app.globalData.books.push(book);

        request("/book", book, app.globalData.sid)
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
                        // success
                    },
                    fail: function (res) {
                        // fail
                    },
                    complete: function (res) {
                        // complete
                        wx.switchTab({
                            url: '/pages/my/my',
                            success: function (res) {
                                // success
                            }
                        })
                    }
                });
            })
            .catch(log);
    },

    amountChanged: function (e) {
        var amount = e.detail.value;
        //console.log("amount: ", amount);
        this.setData({
            prices: this.data.bus.price * amount
        });
    },

    showTopTips: function () {
        var that = this;
        this.setData({
            showTopTips: true
        });
        setTimeout(function () {
            that.setData({
                showTopTips: false
            });
        }, 3000);
    },
});