// 音频管理模块
const audioManager = {
  // 存储音频实例
  breakNotification: new Audio('/break-notification.mp3'),
  notification: new Audio('/notification.mp3'),

  // 从本地存储获取设置
  getSettings() {
    const settings = localStorage.getItem('audioSettings')
    return settings ? JSON.parse(settings) : {
      soundEnabled: true,
      notificationEnabled: true
    }
  },

  // 保存设置到本地存储
  saveSettings(settings) {
    localStorage.setItem('audioSettings', JSON.stringify(settings))
  },

  // 播放休息提醒音频
  playBreakNotification() {
    const settings = this.getSettings()
    if (settings.soundEnabled) {
      this.breakNotification.play().catch(error => {
        console.error('播放休息提醒音频失败:', error)
      })
    }
  },

  // 播放通知音频
  playNotification() {
    const settings = this.getSettings()
    if (settings.soundEnabled) {
      this.notification.play().catch(error => {
        console.error('播放通知音频失败:', error)
      })
    }
  },

  // 显示系统通知
  showNotification(title, options = {}) {
    const settings = this.getSettings()
    if (settings.notificationEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, options)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, options)
          }
        })
      }
    }
  }
}

export default audioManager