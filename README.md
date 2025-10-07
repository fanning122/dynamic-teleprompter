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

系统架构理解：
display.html (编辑 + 显示端)
    ├── 文本编辑区域
    ├── 实时显示区域  
    └── 接收 controller 的滚动控制指令
        ↑
controller.html (纯遥控端)
    └── 发送滚动控制指令

## 使用方法

1. **启动后端**：运行 WebSocket 服务器
2. **打开显示器**：访问 `display.html` - 在这里输入、编辑提词内容，并预览显示效果（注：如果没有通过websocket连接controller，display.html本身也有controller的所有功能，可以作为静态网页完全使用）
3. **打开控制器**：访问 `controller.html` - 远程遥控 display.html 的字幕滚动（开始/暂停/速度等）

## 技术栈
- 前端：HTML, JavaScript, WebSocket
- 后端：Node.js, Socket.io
