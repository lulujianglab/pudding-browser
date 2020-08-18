import React, { useState } from 'react'
import styles from './Home.css'
import '../font'
import path from 'path'
import fs from 'fs-extra'
import { remote, clipboard, shell } from 'electron'

const { dialog, app } = remote

export default function Home(): JSX.Element {
  const currentWindow: any = remote.getCurrentWindow()
  const view: any = currentWindow.getBrowserView()
  const webContents: any = view.webContents

  const [title, setTitle] = useState(webContents.getTitle())
  const [inputValue, setInputValue] = useState(webContents.getURL())
  const [isForward, setForward] = useState(webContents.canGoForward())
  const [isBack, setBackword] = useState(webContents.canGoBack())

  webContents.on('page-title-updated', (event: any, title: any) => {
    setTitle(title)
  })

  webContents.on('new-window', (event: any, url: String) => {
    event.preventDefault()
    webContents.loadURL(url)
  })

  webContents.on('did-navigate', () => {
    setInputValue(webContents.getURL())
    setBackword(webContents.canGoBack()) // 更新后退 icon 样式
    setForward(webContents.canGoForward()) // 更新前进 icon 样式
  })

  const handleKeyDown = (e: any) => {
    if (e.key !== 'Enter') return
    let value = e.target.value
    if (!(value.slice(0, 5) === 'http:' || value.slice(0, 6) === 'https:')) {
      value = `https://${value}`
    }
    webContents.loadURL(value)
  }

  const handleInputChange = (e: any) => {
    setInputValue(e.currentTarget.value)
  }

  const goBack = () => {
    if (webContents.canGoBack()) {
      webContents.goBack()
    }
  }

  const goForward = () => {
    if (webContents.canGoForward()) {
      webContents.goForward()
    }
  }

  const handleRefresh = () => {
    webContents.reload()
  }

  const handlePageCapture = async () => {
    let image = await webContents.capturePage()
    let jpg = image.toJPEG(80)
    let { filePath }: any = await dialog.showSaveDialog({
      buttonLabel: '保存截图',
      defaultPath: path.resolve(app.getPath('downloads'), 'mini-browser.jpg')
    })

    await fs.writeFile(filePath, jpg)
  }

  const copyLink = () => {
    clipboard.writeText(webContents.getURL())
    dialog.showMessageBox({
      type: 'info',
      title: '提示信息',
      message: '复制链接成功',
      buttons: []
  })
  }

  const openWithDefaultBrowser = () => {
    shell.openExternal(webContents.getURL())
  }

  return (
    <div className={styles.container} data-tid="container">
      <div className={styles.title}>{title}</div>
      <section className={styles.main}>
        <ul className={styles.leftNav}>
          {/* 后退 */}
          <li className={`${styles.item} ${isBack && styles.active}`}>
            <svg className={`${styles.icon} ${!isBack && styles.disable}`} aria-hidden="true" onClick={goBack}>
              <use xlinkHref="#iconqianjincopy"></use>
            </svg>
          </li>
          {/* 前进 */}
          <li className={`${styles.item} ${isForward && styles.active}`}>
            <svg className={`${styles.icon} ${!isForward && styles.disable}`} aria-hidden="true" onClick={goForward}>
              <use xlinkHref="#iconqianjincopy1"></use>
            </svg>
          </li>
          {/* 刷新 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg className={styles.icon} aria-hidden="true" onClick={handleRefresh}>
              <use xlinkHref="#iconshuaxin1"></use>
            </svg>
          </li>
        </ul>
        <section className={styles.inputBox}>
          <input id="mini-input" placeholder='在浏览器中搜索，或输入一个网址' type="text" className={styles.miniInput} onChange={handleInputChange} onKeyDown={handleKeyDown} value={inputValue} />
        </section>
        <ul className={styles.rightNav}>
          {/* 截图 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg className={styles.icon} aria-hidden="true" onClick={handlePageCapture}>
              <use xlinkHref="#iconjietu"></use>
            </svg>
          </li>
          {/* 复制链接 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg className={styles.icon} aria-hidden="true" onClick={copyLink}>
              <use xlinkHref="#iconlianjie"></use>
            </svg>
          </li>
          {/* 在浏览器打开 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg className={styles.icon} aria-hidden="true" onClick={openWithDefaultBrowser}>
              <use xlinkHref="#iconliulanqi-"></use>
            </svg>
          </li>
        </ul>
      </section>
    </div>
  )
}
