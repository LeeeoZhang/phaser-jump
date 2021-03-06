import $ from 'jquery'
import anime from 'animejs'
import md5 from './md5'
import { set, get } from './globalData'
import config from './config'

function Olert() {
  this.wrap = null
  this.contentWrap = null
  this.olertWrap = null
  this.confirmBtn = null
  this.confirmHandler = null
  this.init()
  this.bind()
}

Olert.prototype = {
  constructor: Olert,

  init: function () {
    let html = `<div class="olert">
                        <p class="content"></p>
                        <div class="confirm-button">确定</div>
                </div>
               
`
    let wrap = document.createElement('div')
    wrap.classList.add('olert-modal')
    wrap.innerHTML = html
    document.body.appendChild(wrap)
    this.wrap = document.querySelector('.olert-modal')
    this.contentWrap = document.querySelector('.olert-modal .content')
    this.olertWrap = document.querySelector('.olert-modal .olert')
    this.confirmBtn = document.querySelector('.olert-modal .confirm-button')
  },

  show: function (options) {
    this.contentWrap.innerText = options.content
    this.olertWrap.classList.add(options.tween || 'scaleIn')
    this.wrap.style.display = 'block'
    this.confirmHandler = options.comfirm
  },

  bind: function () {
    let _this = this
    _this.confirmBtn.addEventListener('click', function () {
      _this.wrap.style.display = 'none'
      _this.confirmHandler && _this.confirmHandler.call()
    })
  },

}

export const olert = new Olert()

//修复ios输入框失去焦点后页面不回弹的问题
export function inputBlurBugFix() {
  let timer = null
  if (/iphone|ipad/i.test(navigator.userAgent)) {
    $('input,select').on('blur', () => {
      timer = setTimeout(() => {
        window.scrollTo(0, 0)
      }, 50)
    }).on('focus', () => {
      clearTimeout(timer)
    })
  }
}

export function checkResIsValid(res) {
  if (res.code === 10103 || res.code === 10108) {
    window.location = `${config.domain}/game/authorize/index?callback=${encodeURIComponent(window.location.href)}`
  } else {
    olert.show({ content: res.msg })
  }
}

export function setLoading(type) {
  $('.loading-modal')[type]()
}

export function randomStr(num) {
  const dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * dict.length)
    result += dict[random]
  }
  return result
}

export function encodeData(data) {
  function getRandom() {
    return Math.ceil((Math.random() * 5) + 1)
  }

  const paramsNum = getRandom()
  const result = Object.assign({}, data)
  for (let i = 0; i < paramsNum; i += 1) {
    result[randomStr(getRandom())] = randomStr(getRandom())
  }
  const sortKeys = Object.keys(result).sort()
  sortKeys.forEach((key, index) => sortKeys[index] = `${key}=${result[key]}`)
  let dataStr = sortKeys.join('&')
  dataStr += `&key=LAAvXSOYZfFq6fQNyT7D8uyqLPkzikVV`
  result.sign = md5(dataStr).toUpperCase()
  return result
}

export function checkAuth(cb, isFirst = false) {
  setLoading('show')
  $.get({
    url: `${config.domain}/game/index/isAuthorize`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({}),
    success: function (res) {
      setLoading('hide')
      if (res.data.isAuth === 0) {
        window.location = `${config.domain}/game/authorize/index?callback=${encodeURIComponent(window.location.href)}`
      } else {
        const gitStatus = { 0: '', 1: 'can-open', 2: 'opened' }
        if (isFirst) {
          set('isBindMobile', res.data.isBindMobile)
          set('totalScore', res.data.score)
          set('chance', res.data.num)
          $('.score-bar').text(res.data.score)
          $('.life-bar').text(res.data.num)
          $('.home').show()
          $('.status-bar-wrap').show()
        }
        set('firstBoxStatus', res.data.firstStatus)
        set('secondBoxStatus', res.data.secondStatus)
        $('.gift1').addClass(gitStatus[res.data.firstStatus])
        $('.gift2').addClass(gitStatus[res.data.secondStatus])
        cb && cb()
      }
    }
  })
}

export function bindMobile(mobile, cb) {
  setLoading('show')
  $.post({
    url: `${config.domain}/game/index/bindMobile`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({ mobile }),
    success: function (res) {
      setLoading('hide')
      if (res.code === 200) {
        cb && cb()
      } else {
        checkResIsValid(res)
      }
    }
  })
}

export function renderRank(cb) {
  setLoading('show')
  $.get({
    url: `${config.domain}/game/index/rank`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({}),
    success: function (res) {
      setLoading('hide')
      if (res.code === 200) {
        const rankNumMap = { 0: 'first', 1: 'second', 2: 'third' }
        let html = ''
        res.data.lists.forEach((item, index) => {
          html += `
          <div class="rank-item">
            <div class="rank-num ${rankNumMap[index] || 'normal'}">${index + 1}</div>
            <div class="info">
              <img class="avatar" src="${item.avatar}" alt="">
              <span>${item.nickname}</span>
            </div>
            <div class="score">${item.score}</div>
          </div>
         `
        })
        $('.rank-gift-modal .rank').html(html)
        cb && cb()
      } else {
        checkResIsValid(res)
      }
    }
  })
}

export function postScore(score, cb) {
  setLoading('show')
  $.post({
    url: `${config.domain}/game/index/playGame`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({ score }),
    success: function (res) {
      setLoading('hide')
      if (res.code === 200) {
        cb && cb(res.data.totalScore)
      } else {
        checkResIsValid(res)
      }
    }
  })
}

export function onShare() {
  setLoading('show')
  $.get({
    url: `${config.domain}/game/index/shareAdd`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({}),
    success: function (res) {
      setLoading('hide')
      if (res.code === 200) {
        if (res.data.isAddNum === 1) {
          set('chance', get('chance') + 5)
          $('.life-bar').text(get('chance'))
        }
      } else {
        checkResIsValid(res)
      }
    }
  })
}

export function showTheCityTips(text) {
  $('.city-tips').text(`恭喜您已经到达${text}!`).show()
  setTimeout(() => {
    $('.city-tips').hide()
  }, 2000)
}

export function openGiftAnimate(target, cb) {
  anime({
    targets: target,
    duration: 1000,
    backgroundPosition: [' -215px 0', '-860px 0'],
    easing: 'steps(3)',
    complete: function () {
      cb && cb()
    }
  })
}

export function openBox(index, target, cb) {
  setLoading('show')
  $.get({
    url: `${config.domain}/game/index/openBox`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({ index }),
    success: function (res) {
      const indexMap = { 1: 'firstBoxStatus', 2: 'secondBoxStatus' }
      setLoading('hide')
      if (res.code === 200) {
        const currentTotalScore = get('totalScore')
        set(indexMap[index], 2)
        set('totalScore', currentTotalScore + res.data.score)
        $('.git-result-modal .result').text(`恭喜您获得${res.data.score}积分`)
        $('.score-bar').text(parseInt(get('totalScore'), 10))
        openGiftAnimate(target, cb)
      } else {
        checkResIsValid(res)
      }
    }
  })
}

//查看是否还有机会
export function checkShareChance() {
  $.get({
    url: `${config.domain}/game/index/userStatus`,
    xhrFields: {
      withCredentials: true
    },
    data: encodeData({}),
    success: function (res) {
      if (res.code === 200) {
        if (res.data.isAllUse === 0) {
          setTimeout(() => checkShareChance(), 2000)
        } else {
          set('chance', get('chance') + res.data.num)
        }
      } else {
        checkResIsValid(res)
      }
    }
  })
}
