import React, { useState } from 'react';
import path from 'path';
import fs from 'fs-extra';
import { remote, clipboard, shell } from 'electron';
import '../font';
import styles from './Home.css';

const { dialog, app } = remote;

export default function Home(): JSX.Element {
  // 通过 remote 模块获取 BrowserWindow 窗口
  const currentWindow: any = remote.getCurrentWindow();
  // 通过窗口获取当前窗口下的视图
  const view: any = currentWindow.getBrowserView();
  // 通过 webContents 渲染以及控制 web 页面。webContents 负责渲染和控制网页，连通页面与外部环境
  const { webContents } = view;
  // console.log('url', webContents.getURL())

  const [title, setTitle] = useState(webContents.getTitle());
  const [inputValue, setInputValue] = useState(webContents.getURL());
  const [isForward, setForward] = useState(webContents.canGoForward());
  const [isBack, setBackword] = useState(webContents.canGoBack());

  // 导航期间页面标题被更新时触发(url 更改生成标题)
  webContents.on('page-title-updated', (event: any, newTitle: any) => {
    setTitle(newTitle);
  });

  // 当页面请求打开地址为 url 的新窗口时触发(用户单击页面中的链接)
  webContents.on('new-window', (event: any, url: string) => {
    // 默认情况下, 将为 url 创建新的 BrowserWindow
    event.preventDefault();
    // 自动导航到当前的网页内容
    webContents.loadURL(url);
  });

  // 当页面导航时触发（窗口 url 更改或者用户单击页面中的链接时）
  webContents.on('did-navigate', () => {
    setInputValue(webContents.getURL()); // 更新窗口 url 显示
    setBackword(webContents.canGoBack()); // 更新后退 icon 状态
    setForward(webContents.canGoForward()); // 更新前进 icon 状态
  });

  const handleKeyDown = (e: any) => {
    if (e.key !== 'Enter') return;
    let { value } = e.target;
    if (!(value.slice(0, 5) === 'http:' || value.slice(0, 6) === 'https:')) {
      value = `https://${value}`;
    }
    webContents.loadURL(value); // 在窗口视图中加载url 导航到当前的网页内容
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.currentTarget.value);
  };

  // 后退
  const goBack = () => {
    if (webContents.canGoBack()) {
      // 判断是否可以返回到上一个页面，返回 Boolean
      webContents.goBack(); // 使浏览器回退到上一个页面
    }
  };

  // 前进
  const goForward = () => {
    if (webContents.canGoForward()) {
      // 判断是否可以进入下一个页面，返回 Boolean
      webContents.goForward(); // 使浏览器前进到下一个页面
    }
  };

  // 刷新
  const handleRefresh = () => {
    webContents.reload(); // 刷新当前页面
  };

  // 截图
  const handlePageCapture = async () => {
    // 捕获页面区域，返回 Promise<NativeImage>：本机图像，如托盘、dock栏和应用图标
    const image = await webContents.capturePage();
    // 返回一个包含图像 JPEG 编码数据的 Buffer
    const jpg = image.toJPEG(80);
    // 显示保存文件窗口，返回 Promise<Object>
    const { filePath }: any = await dialog.showSaveDialog({
      buttonLabel: '保存截图',
      // 默认情况下使用的绝对目录路径、绝对文件路径或文件名
      defaultPath: path.resolve(app.getPath('downloads'), 'mini-browser.jpg'),
    });

    await fs.writeFile(filePath, jpg);
  };

  // 复制链接
  const copyLink = () => {
    clipboard.writeText(webContents.getURL()); // 将 url 作为纯文本写入剪贴板
    dialog.showMessageBox({
      type: 'info',
      title: '提示信息',
      message: '复制链接成功',
      buttons: [],
    });
  };

  // 外部浏览器打开链接
  const openWithDefaultBrowser = () => {
    // shell 使用默认应用程序管理文件和 url
    shell.openExternal(webContents.getURL()); // 在用户的默认浏览器中打开当前页面的 URL
  };

  return (
    <div className={styles.container} data-tid="container">
      <div className={styles.title}>{title}</div>
      <section className={styles.main}>
        <ul className={styles.leftNav}>
          {/* 后退 */}
          <li className={`${styles.item} ${isBack && styles.active}`}>
            <svg
              className={`${styles.icon} ${!isBack && styles.disable}`}
              aria-hidden="true"
              onClick={goBack}
            >
              <use xlinkHref="#iconqianjincopy" />
            </svg>
          </li>
          {/* 前进 */}
          <li className={`${styles.item} ${isForward && styles.active}`}>
            <svg
              className={`${styles.icon} ${!isForward && styles.disable}`}
              aria-hidden="true"
              onClick={goForward}
            >
              <use xlinkHref="#iconqianjincopy1" />
            </svg>
          </li>
          {/* 刷新 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg
              className={styles.icon}
              aria-hidden="true"
              onClick={handleRefresh}
            >
              <use xlinkHref="#iconshuaxin1" />
            </svg>
          </li>
        </ul>
        <section className={styles.inputBox}>
          <input
            id="mini-input"
            placeholder="在浏览器中搜索，或输入一个网址"
            type="text"
            className={styles.miniInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            value={inputValue}
          />
        </section>
        <ul className={styles.rightNav}>
          {/* 截图 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg
              className={styles.icon}
              aria-hidden="true"
              onClick={handlePageCapture}
            >
              <use xlinkHref="#iconjietu" />
            </svg>
          </li>
          {/* 复制链接 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg className={styles.icon} aria-hidden="true" onClick={copyLink}>
              <use xlinkHref="#iconlianjie" />
            </svg>
          </li>
          {/* 在浏览器打开 */}
          <li className={`${styles.item} ${styles.active}`}>
            <svg
              className={styles.icon}
              aria-hidden="true"
              onClick={openWithDefaultBrowser}
            >
              <use xlinkHref="#iconliulanqi-" />
            </svg>
          </li>
        </ul>
      </section>
    </div>
  );
}
