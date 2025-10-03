const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const WebSocket = require('ws');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`🌐 收到请求: ${req.method} ${pathname}`);
  
  // 路由处理
  if (pathname === '/') {
    serveFile(res, 'display&controller.html', 'text/html');
  } else if (pathname === '/remote_control1003.html') {
    serveFile(res, 'remote_control1003.html', 'text/html');
  } else if (pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('页面未找到');
  }
});

// 提供文件服务的辅助函数
function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`❌ 读取文件错误: ${filename}`, err);
      res.writeHead(404);
      res.end('文件未找到');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    console.log(`✅ 已提供文件: ${filename}`);
  });
}

// 创建WebSocket服务器，挂载到同一个HTTP服务器上
const wss = new WebSocket.Server({ server });

let clients = {
  display: null,  // 提词器客户端
  remote: null    // 遥控器客户端
};

wss.on('connection', function connection(ws, req) {
  // 根据URL路径区分客户端类型
  const url = req.url;
  let clientType = 'unknown';
  
  if (url === '/display') {
    clientType = 'display';
  } else if (url === '/remote') {
    clientType = 'remote';
  }
  
  if (clientType !== 'unknown') {
    clients[clientType] = ws;
    console.log(`✅ ${clientType}客户端已连接`);
    
    ws.on('message', function message(data) {
      console.log(`📨 收到${clientType}消息:`, data.toString());
      
      try {
        const messageData = JSON.parse(data.toString());
        
        // 转发消息：遥控器 → 提词器（控制命令）
        if (clientType === 'remote' && clients.display) {
          console.log(`🔄 将遥控器控制命令转发到提词器:`, messageData);
          clients.display.send(JSON.stringify(messageData));
        }
        // 转发消息：提词器 → 遥控器（所有状态更新）
        else if (clientType === 'display' && clients.remote) {
          console.log(`🔄 将提词器状态更新转发到遥控器:`, messageData);
          clients.remote.send(JSON.stringify(messageData));
        }
      } catch (e) {
        console.error('❌ 消息解析错误:', e);
      }
    });
    
    ws.on('close', function() {
      console.log(`🔌 ${clientType}客户端已断开`);
      clients[clientType] = null;
      
      // 发送断开通知
      if (clientType === 'display' && clients.remote) {
        clients.remote.send(JSON.stringify({
          type: 'connectionStatus',
          value: 'display_disconnected'
        }));
      } else if (clientType === 'remote' && clients.display) {
        clients.display.send(JSON.stringify({
          type: 'connectionStatus', 
          value: 'remote_disconnected'
        }));
      }
    });
    
    // 发送连接成功通知
    ws.send(JSON.stringify({
      type: 'connectionStatus',
      value: 'connected'
    }));
    
    // 通知另一方有新连接
    if (clientType === 'display' && clients.remote) {
      clients.remote.send(JSON.stringify({
        type: 'connectionStatus',
        value: 'display_connected'
      }));
    } else if (clientType === 'remote' && clients.display) {
      clients.display.send(JSON.stringify({
        type: 'connectionStatus',
        value: 'remote_connected'
      }));
    }
  } else {
    console.log('❌ 未知客户端类型连接:', url);
    ws.close();
  }
});

// 启动整合服务器，监听3000端口
const port = 3000;
server.listen(port, () => {
  console.log(`🚀 整合服务器已启动`);
  console.log(`📡 HTTP服务: http://localhost:${port}`);
  console.log(`🔗 WebSocket服务: ws://localhost:${port}`);
  console.log('📁 可用页面:');
  console.log(`   - 主提词器: http://localhost:${port}/`);
  console.log(`   - 遥控器:    http://localhost:${port}/remote_control1003.html`);
  console.log('🔌 WebSocket连接路径:');
  console.log(`   - 提词器: ws://localhost:${port}/display`);
  console.log(`   - 遥控器: ws://localhost:${port}/remote`);
  console.log('⏹️  按 Ctrl+C 停止服务器');
});

// 优雅关闭处理
process.on('SIGINT', function() {
  console.log('\n🛑 正在关闭服务器...');
  // 关闭所有WebSocket连接
  wss.clients.forEach(client => {
    client.close();
  });
  server.close(function() {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});