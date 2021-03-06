import $ from 'jquery'
import { onShare } from './utils'

function weixin(callback) {
  function randomString(len) {
    len = len || 16
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    var maxPos = $chars.length
    var pwd = ''
    for (var i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  }

  var wxTimestamp = String((new Date).getTime()).slice(0, -3)
  var wxNonceStr = randomString()
  var wxData = {
    timestamp: wxTimestamp,
    noncestr: wxNonceStr,
    url: window.location.href
  }

  $.post('https://jhs.dochuang.cn/game/authorize/getApiTicket', wxData, function (res) {
    onwxSignReady(res.data)
  })

  function onwxSignReady(data) {
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: data.appid, // 必填，公众号的唯一标识
      timestamp: wxTimestamp, // 必填，生成签名的时间戳
      nonceStr: wxNonceStr, // 必填，生成签名的随机串
      signature: data.signature, // 必填，签名，见附录1
      jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'] //必填，需要使用的JS接口列表，所有JS接口列表见附录2
    })
  }

  wx.ready(function () {
    $('.bgm')[0].play()
    wx.onMenuShareTimeline({
      title: wxShare.title, // 分享标题
      link: wxShare.link, // 分享链接
      imgUrl: wxShare.img_url, // 分享图标
      success: function () {
        onShare()
        // 用户确认分享后执行的回调函数
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
      }
    })

    wx.onMenuShareAppMessage({
      title: wxShare.title, // 分享标题
      desc: wxShare.desc, // 分享描述
      link: wxShare.link, // 分享链接
      imgUrl: wxShare.img_url, // 分享图标
      type: '', // 分享类型,music、video或link，不填默认为link
      dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
      success: function () {
        onShare()
        // 用户确认分享后执行的回调函数
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
      }
    })

  })
  
}

export default weixin
