const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`收到HTTP请求: ${req.url}`);
    
    let filePath = '';
    
    if (req.url === '/' || req.url === '/index.html') {
        filePath = path.join(__dirname, 'index.html');
    } else if (req.url === '/display.html') {
        filePath = path.join(__dirname, 'display.html');
    } else if (req.url === '/controller.html') {
        filePath = path.join(__dirname, 'controller.html');
    } else {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    
    // 读取并返回HTML文件
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`读取文件错误: ${filePath}`, err);
            res.writeHead(500);
            res.end('Error loading file');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
        console.log(`成功提供文件: ${req.url}`);
    });
});

// 创建WebSocket服务器
const wss = new WebSocket.Server({ 
    server,
    // 增加客户端验证
    verifyClient: (info) => {
        console.log(`WebSocket连接尝试: ${info.req.url}`);
        return true; // 允许所有连接
    }
});

let connections = {
    display: null,
    controller: null
};

wss.on('connection', (ws, req) => {
    const url = req.url;
    console.log(`WebSocket连接建立: ${url}`);
    
    // 解析客户端类型
    let clientType = 'unknown';
    if (url.includes('type=display')) {
        clientType = 'display';
        connections.display = ws;
    } else if (url.includes('type=controller')) {
        clientType = 'controller';
        connections.controller = ws;
    }
    
    console.log(`客户端注册为: ${clientType}`);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`从${clientType}收到消息:`, data);
            
            // 控制器发送指令给显示器
            if (clientType === 'controller' && connections.display) {
                console.log('转发消息到显示端');
                connections.display.send(JSON.stringify(data));
            }
            
            // 显示器发送状态给控制器（可选）
            if (clientType === 'display' && connections.controller) {
                console.log('转发消息到控制端');
                connections.controller.send(JSON.stringify(data));
            }
        } catch (error) {
            console.error('消息解析错误:', error);
        }
    });
    
    ws.on('close', () => {
        console.log(`${clientType}客户端断开连接`);
        if (clientType === 'display') {
            connections.display = null;
        } else if (clientType === 'controller') {
            connections.controller = null;
        }
    });
    
    ws.on('error', (error) => {
        console.error(`${clientType} WebSocket错误:`, error);
    });
    
    // 发送欢迎消息
    ws.send(JSON.stringify({
        type: 'welcome',
        message: `已连接为${clientType}`,
        role: clientType
    }));
});

// 启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {  // 监听所有网络接口
    console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`网络访问: http://10.80.6.252:${PORT}`);
    console.log('等待客户端连接...');
});
