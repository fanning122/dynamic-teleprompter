# 动态提词器 (Dynamic Teleprompter)

一个基于 WebSocket 的实时提词器系统，支持控制器和显示端分离操作。

## 功能特点
- 🎤 实时文本同步
- 🖥️ 双界面分离控制
- 🔄 WebSocket 实时通信
- 📱 响应式设计

## 项目结构

DTP/
├── frontend/ # 前端界面
│ ├── controller.html # 控制器页面
│ └── display.html # 显示端页面
├── backend/ # 后端服务
│ └── websocket_server.js # WebSocket 服务器
└── README.md # 项目说明


## 使用方法
1. 启动后端 WebSocket 服务器
2. 打开 `controller.html` 远程遥控teleprompter的display.html的text.container区域字幕滚动
3. 打开 `display.html` 输入、编辑、调试提词内容，查看实时显示

## 技术栈
- 前端：HTML, JavaScript, WebSocket
- 后端：Node.js, Socket.io
