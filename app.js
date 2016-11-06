// 加载 express
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var serveStatic = require('serve-static');
var _ = require('underscore');

// 设置端口号
var port = process.env.PORT || 3000;
var Goods = require('./models/goods');
var User = require('./models/user');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();

mongoose.connect('mongodb://localhost/logistics');

app.locals.moment = require('moment');

// 设置根目录及模板引擎
app.set('views', './views/pages');
app.set('view engine', 'jade');

// 调用bodyParser，及bootstrap等
app.use(bodyParser.urlencoded({extend: true}));
app.use(serveStatic('public'));
app.use(cookieParser());
app.use(session({
    secret: 'imooc',
    store: new MongoStore({
        url: 'mongodb://localhost/imooc-movie',
        collection: 'sessions'
    })
}));
app.use(function (req, res, next) {
    var _user = req.session.user;
    //console.log(_user);//页面一刷新就读取到 AmberYLOpez,加密的密码

    app.locals.user = _user;
    return next();
});


// 首页 index.jade
app.get('/', function (req, res) {
    var user = req.session.user;//req.session没有

    res.render('index', {
        title: '首页'
    })
});

// 基本信息管理
app.get('/basic', function (req, res) {
    res.render('basic-information', {
        title: '基本信息管理'
    })
});
// 员工信息页面
app.get('/users/list', function (req, res) {
    res.render('staff-information', {
        title: '员工信息列表',
        users: [{
            _id: '20161010001',
            name: '张三',
            sex: '男',
            department: '01部',
            tel: '12345678909',
            native: '陕西',
            other: ''
        }, {
            _id: '20161010002',
            name: '李四',
            sex: '男',
            department: '02部',
            tel: '12345678945',
            native: '山西',
            other: ''
        }]
    })
});
// 商品信息页面


//商品入库
app.get('/goods/add', function (req, res) {
    res.render('goods-put', {
        title: '商品入库',
        goods: {
            num:'',
            type: '',
            warehouse: '',
            other: ''
        }
    })
});
//商品存储
app.post('/goods/new', function (req, res) {
    var id = req.body.goods._id;
    var goodsObj = req.body.goods;
    var _goods;

    if (id !== 'undefined') {
        Goods.findById(id, function (err, goods) {
            if (err) {
                console.log(err);
            }
            _goods = _.extend(goods, goodsObj);
            _goods.save(function (err, goods) {
                if (err) {
                    console.log(err);
                }
                // res.send(_goods.num);
                res.redirect('/goods/' + _goods.num);
            })
        })
    } else {
        _goods = new Goods({
            _id:goodsObj.num,
            num:goodsObj.num,
            type: goodsObj.type,
            warehouse: goodsObj.warehouse,
            other: goodsObj.other
        });

        _goods.save(function (err, goods) {//document must have an _id before saving
            if (err) {
                console.log(err);
            }
            res.redirect('/goods/' + _goods.num);

        })
    }
});


app.get('/goods/list', function (req, res) {
    Goods.fetch(function (err, goods) {
        if (err) {
            console.log(err);
        }
        res.render('goods-information', {
            title: '商品页面列表',
            goods: goods
        })
    });
});
app.get('/goods/:num', function (req, res) {
    var id = req.params.num;

    Goods.findById(id, function (err, goods) {
        res.render('goods-detail', {
            title: '详情页',
            goods: goods
        })
    });
});

//商品修改页面
app.get('/update/:num', function (req, res) {
    var num = req.params.num;
    if (num) {
        Goods.findById(num, function (err, goods) {
            res.render('goods-detail', {
                title: '商品修改',
                goods: goods
            })
        });
    }
});

//删除
app.delete('/admin/list', function (req, res) {
    var id = req.query.id;
    if (id) {
        Goods.remove({_id: id}, function (err, goods) {
            if (err) {
                console.log(err)
            } else {
                res.json({success: 1});
            }
        })
    }
});

//注册
app.post('/user/signup', function (req, res) {
    var _user = req.body.user;//获取表单数据，是一个对象 也可用req.param('user')
    User.findOne({name: _user.name}, function (err, user) {
        if (err) {
            console.log(err)
        }
        if (user) {//用户名已存在
            return res.redirect('/');
        } else {
            var user = new User(_user);
            user.save(function (err, user) {
                if (err) {
                    console.log(err);
                }
            });
            res.redirect('/');
        }
    })
});

//登录
app.post('/user/signin', function (req, res) {
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;
    //console.log(_user);//AmberYLOpez,l199603ay

    User.findOne({name: name}, function (err, user) {
        if (err) {
            console.log(err);
        }
        if (!user) {//用户不存在
            return res.redirect('/');
        }
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                console.log(err);
            }
            if (isMatch) {
                req.session.user = user;
                //console.log(req.session.user);//AmberYLOPez,加密后的密码
                return res.redirect('/');
            } else {
                console.log('密码不匹配');
            }
        })
    })
});
//登出
app.get('/logout', function (req, res) {
    delete req.session.user;
    delete app.locals.user;
    res.redirect('/');
});

app.listen(port);
console.log('the process start on port ' + port);

