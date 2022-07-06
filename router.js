var express = require('express');
var router = express.Router();
// import {postList} from './types/index'
var conn = require('./db');

var fs = require('fs')
//导入上传文件中间件，能帮助我们实现接收文件的接口
const multer = require('multer')

// 视频传输插件
const EventEmitter = require('events');

const multiparty = require('multiparty');

const path = require('path');
const STATIC_TEMPORARY = path.resolve(__dirname, './video/temporary');
const STATIC_FILES = path.resolve(__dirname, './video/files');


//接收到的文件放uploads文件夹
const upload = multer({ dest: 'uploads/' })

// token加密
const jwt = require('jsonwebtoken');
const { format } = require('path');
const SECRET_KEY = 'login2022'

function delFile(path, reservePath) {
    if (fs.existsSync(path)) {
        if (fs.statSync(path).isDirectory()) {
            let files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let currentPath = path + "/" + file;
                if (fs.statSync(currentPath).isDirectory()) {
                    delFile(currentPath, reservePath);
                } else {
                    fs.unlinkSync(currentPath);
                }
            });
            if (path != reservePath) {
                fs.rmdirSync(path);
            }
        } else {
            fs.unlinkSync(path);
        }
    }
}




// 获取文章数据
router.get('/api/getList', function (req, res) {
    var sqlStr = 'SELECT id,title,content,introduce,`time` FROM artical ORDER BY TIME DESC';
    conn.query(sqlStr, function (err, results) {
        if (err) {
            res.json({ code: 1, msg: '获取失败' });
        }
        else {
            res.json({ code: 0, list: results });
        }
    });
});
// 增加文章
router.post('/api/insertList', function (req, res) {
    var sqlStr = 'INSERT INTO artical SET ?';
    // console.log(req.body); //传过来的对象在body里
    conn.query(sqlStr, req.body, function (err) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log('插入失败', err);
        }
        else {
            res.json({ code: 0 });
            // console.log('插入成功');
        }
    });
});
// 删除文章
router.post('/api/deleteList', function (req, res) {
    var sqlStr = 'DELETE FROM artical WHERE id=?';
    // console.log(req.body);
    conn.query(sqlStr, req.body.id, function (err) {
        if (err) {
            res.json({ code: 1, msg: '删除失败' });
            // console.log(err);
        }
        else {
            res.json({ code: 0 });
        }
    });
});
// 获取评论
router.post('/api/postComment', function (req, res) {
    // console.log(req.body);
    var sqlStr = 'SELECT id, articalId, content, `time`, userName FROM COMMENT WHERE articalId = ? Order by `time` desc';
    conn.query(sqlStr, req.body.id, function (err, results) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log(err);
        }
        else {
            res.json({ code: 0, list: results });
            // console.log(results);
        }
    });
});

// 添加评论
router.post('/api/insertComment', function (req, res) {
    var sqlStr = 'INSERT INTO comment SET ?';
    // @ts-ignore
    // console.log('用户', req.user);
    if (req.user) {
        // console.log(req.body); //传过来的对象在body里
        conn.query(sqlStr, req.body, function (err) {
            if (err) {
                res.json({ code: 1, msg: err });
                // console.log('插入失败', err);
            }
            else {
                res.json({ code: 0, msg: '评论成功！' });
                // console.log('插入成功');
            }
        });
    } 
    /* else {
        res.json({code: 2, msg: '用户身份过期，请重新登录'})
    } */

});
// 删除评论
router.post('/api/deleteComment', function (req, res) {
    var sqlStr = 'DELETE FROM comment WHERE id=?';
    // console.log(req.body);
    conn.query(sqlStr, req.body.id, function (err) {
        if (err) {
            res.json({ code: 1, msg: '删除失败' });
            // console.log(err);
        }
        else {
            res.json({ code: 0 });
        }
    });
});
// 将博客删除顺带将其评论也删除
router.post('/api/deleteArticalAllComment', function (req, res) {
    // console.log('bbq', req.body);
    var sqlStr = 'DELETE FROM comment WHERE articalId = ?';
    // console.log(req.body);
    conn.query(sqlStr, req.body.id, function (err) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log(err);
        }
        else {
            res.json({ code: 0 });
        }
    });
});


// 上传图片
router.post('/api/addImg', upload.single('icon'), function (req, res) {
    const { file, body } = req
    // console.log(file);
    var sqlStr = `insert into comic (icon)values('${file.filename}')`;
    conn.query(sqlStr, function (err) {
        if (err) {
            res.send({ code: 1, msg: err });
            // console.log('add',err);
        }
        else {
            res.send({ code: 0, msg: '上传成功' });
        }
    });
})


// 查找所有图片
router.get('/api/all', function (req, responce) {
    var sqlStr = 'select * from comic';
    conn.query(sqlStr, function (err, result) {
        if (err) {
            responce.json({ code: 1, msg: err });
            // console.log('all',err);
        }
        else {
            responce.json({ code: 0, msg: '查询成功', data: result });
        }
    });
})


// 删除图片
router.post('/api/deleteImg', function (req, res) {
    // console.log('bbq', req.body);
    let { file, body } = req
    var imgUrl = `uploads/${body.icon}`;
    // console.log(imgUrl);
    var sqlStr = 'DELETE FROM comic WHERE icon = ?';
    // console.log(req.body);
    conn.query(sqlStr, body.icon, function (err) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log(err);
        }
        else {
            delFile(imgUrl);
            res.json({ code: 0 });
        }
    });
});


// 用户注册
router.post('/api/regist', function (req, res) {
    var sqlStr = 'INSERT INTO usermanage SET ?';
    // console.log(req.body); //传过来的对象在body里
    conn.query(sqlStr, req.body, function (err) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log('插入失败', err);
        }
        else {
            res.json({ code: 0 });
            // console.log('插入成功');
        }
    });
});


// 用户登录
router.post('/api/login', function (req, res) {
    let { body } = req
    var sqlStr = `SELECT * FROM usermanage WHERE user_name='${body.user_name}' AND user_password='${body.user_password}'`;
    conn.query(sqlStr, function (err, results) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log(err);
        }
        else {
            if (results.length == 0) {
                res.json({ code: 2, msg: '未找到该用户' });
                // console.log('不行');
            } else {
                /* console.log(results);
                console.log(results[0].user_password); */
                let token = jwt.sign(
                    { user: { name: results[0].user_name, password: results[0].user_password } },
                    SECRET_KEY,
                    { expiresIn: '3h' }
                )
                res.json({ code: 0, list: results, token });
                // console.log('可以');
            }

        }
    });
});

// 获取用户信息
router.get('/api/getUser', function (req, res) {
    // console.log(req.body.id);
    var sqlStr = 'SELECT * FROM usermanage';
    conn.query(sqlStr, req.body.id, function (err, results) {
        if (err) {
            res.json({ code: 1, msg: err });
            // console.log(err);
        }
        else {
            res.json({ code: 0, list: results });
            // console.log(results);
        }
    });
});


// 删除用户
router.post('/api/deleteUser', function (req, res) {
    var sqlStr = 'DELETE FROM usermanage WHERE user_id=? ';
    // console.log(req.body);
    conn.query(sqlStr, req.body.user_id, function (err) {
        if (err) {
            res.json({ code: 1, msg: '删除失败' });
        }
        else {
            res.json({ code: 0 });
        }
    });
});

// 删除用户同时删除他的评论
router.post('/api/deleteUserComment', function (req, res) {
    var sqlStr = 'DELETE FROM `comment` WHERE userId =? ';
    // console.log(req.body);
    conn.query(sqlStr, req.body.user_id, function (err) {
        if (err) {
            res.json({ code: 1, msg: '删除失败' });
        }
        else {
            res.json({ code: 0 });
        }
    });
});


// 上传视频
router.post('/api/uploadVideo', async function(req, res) {
   const multipart = new multiparty.Form();
   const myEmitter = new EventEmitter();
   
   /* var sqlStr = `insert into comic (icon)values('${file.filename}')`;
    conn.query(sqlStr, function (err) {
        if (err) {
            res.send({ code: 1, msg: err });
            // console.log('add',err);
        }
        else {
            res.send({ code: 0, msg: '上传成功' });
        }
    }); */
   const formData = {
       index: undefined,
       filename: undefined,
       chunk: undefined
   }
   let isFileOk = false, isFieldOk = false;
   multipart.parse(req, function(err, fields, files) {
        formData.index = fields['index'][0];
        formData.filename = fields['filename'][0];
        isFieldOk = true;
        myEmitter.emit('startSave')        
   });

   multipart.on('file', function(name, file) {
        formData.chunk = file;
        isFileOk = true;
        myEmitter.emit('startSave')
   });

   myEmitter.on('startSave', function() {
        if(isFieldOk && isFileOk) {
            const {index, filename, chunk} = formData;

            try {
                const dir = `${STATIC_TEMPORARY}/${filename}`;
                if(!fs.existsSync(dir)) fs.mkdirSync(dir);
                const buffer = fs.readFileSync(chunk.path);
                const ws = fs.createWriteStream(`${dir}/${index}`);
                ws.end(buffer);
                ws.close();
                res.send(`chunk ${filename} - ${index} upload success.`)
            } catch(err) {
                res.status(500).send(`chunk ${filename} - ${index} upload error.`)
            }

            isFieldOk = false;
            isFileOk = false;
        }
   })
});

router.get('/api/merge', function(req, res) {
    const {filename} = req.query;
    console.log(filename);

    var sqlStr = `insert into video (video_name)values('${filename}')`;
    conn.query(sqlStr, function (err) {
        if (err) {
            res.send({ code: 1, msg: err });
            // console.log('add',err);
        }
        else {
            res.send({ code: 0, msg: '上传成功' });
        }
    });

    try {
        let bufferLen = 0;
        const bufferList = fs.readdirSync(STATIC_TEMPORARY +"\\"+filename).map(fname => {
            const buffer = fs.readFileSync(`${STATIC_TEMPORARY}/${filename}/${fname}`);
            bufferLen += buffer.length;
            return buffer;
        })

        const buffer = Buffer.concat(bufferList, bufferLen);

        const ws = fs.createWriteStream(`${STATIC_FILES}/${filename}`)
        ws.end(buffer);
        ws.close;


    } catch(err) {
        // console.log(err);
        res.status(500).send(`merge error`)
    }
});

router.get('/api/allVideo', function (req, responce) {
    var sqlStr = 'select * from video';
    conn.query(sqlStr, function (err, result) {
        if (err) {
            responce.json({ code: 1, msg: err });
            // console.log('all',err);
        }
        else {
            responce.json({ code: 0, msg: '查询成功', data: result });
        }
    });
})


module.exports = router;
