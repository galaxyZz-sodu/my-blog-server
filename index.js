const express2 = require('express');
const bodyParser = require('body-parser');
const app = express2();
// token
// @ts-ignore
const parseJwt = require("express-jwt");

// 错误中间件
const errorhandler = require('./errorhandler')

var router2 = require('./router');
app.use(require('cors')());
app.use(bodyParser.urlencoded({ extended: false }));


//导入上传文件中间件，能帮助我们实现接收文件的接口
const multer  = require('multer')
//接收到的文件放uploads文件夹
const upload = multer({ dest: 'uploads/' })
//使得让外部通过链接可以访问这个文件夹里文件（ 地址 + 端口 / 文件名 ）便可访问
app.use(express2.static('uploads')) 
app.use('/video', express2.static('video')) 


app.use(bodyParser.json());


app.use(parseJwt({
    secret: 'login2022', // 生成token时的 钥匙，必须统一
    algorithms: ['HS256'] // 必填，加密算法
  }).unless({
    path: ['/api/login', '/api/getList', '/api/insertList', '/api/deleteList', '/api/postComment', '/api/all', '/api/regist', '/api/getUser', '/api/uploadVideo', '/api/merge', '/api/allVideo'] // 除了这两个接口，其他都需要认证
  }));
  
app.use(errorhandler)

app.use('/', router2);
app.listen(3000, function (req, res) {
    console.log('http://localhost:3000');
});
