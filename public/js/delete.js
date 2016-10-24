$(function () {
    $('.del').click(function (e) {
        var target = $(e.target);//点击时拿到当前按钮
        var id = target.data('id');//
        var tr = $('.item-id-' + id);//拿到表格的一行
        $.ajax({
            type: 'DELETE',//类型
            url: '/admin/list?id=' + id//提交的地址
        })
            .done(function (results) {//返回的状态
                if (results.success === 1) {
                    if (tr.length > 0) {
                        tr.remove();
                    }
                }
            })
    })
});