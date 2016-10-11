// 加载 express
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var serveStatic = require('serve-static');
// 设置端口号
var port = process.env.PORT || 3000;
var Goods = require('./models/goods');
var app = express();

mongoose.connect('mongodb://localhost/logistics');

app.locals.moment = require('moment');

// 设置根目录及模板引擎
app.set('views', './views/pages');
app.set('view engine', 'jade');

// 调用bodyParser，及bootstrap等
app.use(bodyParser.urlencoded({extend: true}));
app.use(serveStatic('bower_components'));
app.use(serveStatic('public'));
// 首页 index.jade
app.get('/', function (req, res) {
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

//商品入库
app.get('/goods/add', function (req, res) {
    res.render('goods-put', {
        title: '商品入库',
        goods: {
            _id: '',
            type: '',
            warehouse: '',
            other: ''
        }
    })
});
// if (id !== 'undefined') {
//     Movie.findById(id, function (err, movie) {
//         if (err) {
//             console.log(err);
//         }
//
//         _movie = _.extend(movie, movieObj);
//         _movie.save(function (err, movie) {
//             if (err) {
//                 console.log(err);
//             }
//             res.redirect('/movie/' + movie._id);
//         })
//     })
// } else {
//     _movie = new Movie({
//         doctor: movieObj.doctor,
//         title: movieObj.title,
//         country: movieObj.country,
//         language: movieObj.language,
//         year: movieObj.year,
//         poster: movieObj.poster,
//         summary: movieObj.summary,
//         flash: movieObj.flash
//     });
//
//     _movie.save(function (err, movie) {
//         if (err) {
//             console.log(err);
//         }
//
//         res.redirect('/movie/' + movie._id);
//     })
// }
app.post('/goods/new', function (req, res) {
    var id = req.body.goods._id;
    var goodsObj = req.body.goods;
    var _goods;
    Goods.findById(id, function (err, goods) {
        if (id !== undefined) {
            goods = new Goods({
                _id: goodsObj._id,
                type: goodsObj.type,
                warehouse: goodsObj.warehouse,
                other: goodsObj.other
            });
        }
        _goods = _.extend(goods, goodsObj);
        _goods.save(function (err, goods) {
            if (err) {
                console.log(err);
            }
            res.redirect('/goods/list')
        })
    })
})
// Goods.findById(id, function (err, goods) {
//     if (goods == undefined) {
//         goods = new Goods({
//             _id: goodsObj._id,
//             type: goodsObj.type,
//             warehouse: goodsObj.warehouse,
//             other: goodsObj.other
//         })
//     }
//     _goods = _.extend(goods, goodsObj);
//     _goods.save(function (err, goods) {
//         if (err) {
//             console.log(err);
//         }
//         res.redirect('/goods/list')
//     })
// })
//
// })
// ;
//商品修改页面
app.get('/goods/:id', function (req, res) {
    var id = req.params.id;

    Goods.findById(id, function (err, goods) {
        res.render('goods-detail', {
            title: '商品修改' + goods._id,
            goods: goods
        })

    });
});
app.listen(port);
console.log('the process start on port ' + port);

