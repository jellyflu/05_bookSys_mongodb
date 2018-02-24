

var fs=require('fs');
var express=require('express');

var session = require("express-session");
var bodyParser = require('body-parser');
var multiparty = require('multiparty');


var bookService=require('./service/bookService.js');

var app=express();


//静态web站点
app.use("/resources",express.static(__dirname+"/resources"));
app.use("/upload",express.static(__dirname+"/upload"));

//设置 express模板引擎为 ejs
app.set("view engine","ejs");
app.set('views',  __dirname+'/views');

//配置body-parser中间件
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//配置express-session 中间件
app.use(session({
    secret: 'mysessionKey',   // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
    name:'session_id',/*保存在本地cookie的一个名字 默认connect.sid  可以不设置*/
    resave: false,   /*强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。*/
    saveUninitialized: true,   //强制将未初始化的 session 存储。  默认值是true  建议设置成true
    cookie: {
        maxAge:1000*30*60    /*过期时间*/

    },   /*secure https这样的情况才可以访问cookie*/

    //设置过期时间比如是30分钟，只要游览页面，30分钟没有操作的话在过期
    rolling:true ,//在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）

}));

//配置session中间件
app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});



app.get('/',function (req,res) {
   res.send('ok');
});



//book  首页列表
app.get("/book_list",function (req,res) {

    bookService.findAllBook(function (list) {
       res.render("book_list.ejs",{
           bookList:list
       });
    });
});


//ajax请求， 删除图书 （同时删除 upload目录中的图片）
app.post("/book_delete",function (req,res) {

    var _id=req.body._id;

    bookService.findBookById(_id,function (dbBook) {

        bookService.deleteBookById(_id,function (n) {
            if(n>0){
                if(dbBook.picUrl){
                    fs.unlinkSync("."+dbBook.picUrl);//删除历史图片
                }
                res.json({status:200,message:'删除图书成功'});
            }else{
                res.json({status:400,message:'删除图书失败'});
            }
        });
    });

});

//进入添加图书页面
app.get("/book_add",function (req,res) {
   res.render("book_add.ejs");
});
//进入修改图书页面
app.get("/book_update/:_id",function (req,res) {

    var _id=req.params._id;//获取参数 _id

    bookService.findBookById(_id,function (book) {
        res.render("book_update.ejs",{
            book:book
        });
    });
});

//添加图书 post提交
// app.post("/book_add",function (req,res) {
//
//     var bookName= req.body['bookName'];
//     var author=req.body['author'];
//     var description=req.body['description'];
//     var price=req.body['price'];
//
//      var book={
//          bookName:bookName,
//          author:author,
//          description:description,
//          price:price,
//      };
//     bookService.addBook(book,function (n) {
//         if(n>0){
//             res.json({status:200,message:'添加图书成功'});
//         }else{
//             res.json({status:400,message:'添加图书失败'});
//         }
//     });
//
// });

//添加图书 post提交  (上传图片)  2222
app.post("/book_add",function (req,res) {


    var form = new multiparty.Form();
    form.uploadDir='./upload'; //上传图片保存的地址
    var  rootUrl="/upload";
    form.parse(req, function(err, fields, files) {
        var bookName= fields.bookName[0];
        var author= fields.author[0];
        var description= fields.description[0];
        var price= fields.price[0];

        if(files.pic && files.pic[0]) {//如果上传了图片 则

            var orgFilename=files.pic[0].originalFilename;
            var picUrl=rootUrl+"/"+orgFilename;
            var book={
                bookName:bookName,
                author:author,
                description:description,
                price:price,
                picUrl:picUrl,
            };
            fs.rename(files.pic[0].path,form.uploadDir+"/"+orgFilename,function (err) {
                if (err) throw err;
                console.log('重命名完成');

                bookService.addBook(book,function (n) {
                    if(n>0){
                        res.json({status:200,message:'添加图书成功'});
                    }else{
                        res.json({status:400,message:'添加图书失败'});
                    }
                });
            });

        }else{//没有上传图片

            var book={
                bookName:bookName,
                author:author,
                description:description,
                price:price,
            };
            bookService.addBook(book,function (n) {
                    if(n>0){
                        res.json({status:200,message:'添加图书成功'});
                    }else{
                        res.json({status:400,message:'添加图书失败'});
                    }
                });
        }
    });


});

//修改图书  post 提交
// app.post("/book_update",function (req,res) {
//     var bookName= req.body['bookName'];
//     var author=req.body['author'];
//     var description=req.body['description'];
//     var price=req.body['price'];
//
//     var _id=req.body['_id'];
//
//     var book={
//         bookName:bookName,
//         author:author,
//         description:description,
//         price:price,
//     };
//     bookService.updateBook(_id,book,function (n) {
//         if(n>0){
//             res.json({status:200,message:'修改图书成功'});
//         }else{
//             res.json({status:400,message:'操作失败'});
//         }
//     });
// });


//post 提交修改  （上传图片） 1111
app.post("/book_update",function (req,res) {

    var form = new multiparty.Form();

    form.uploadDir='./upload'; //上传图片保存的地址

    var  rootUrl="/upload";

    form.parse(req, function(err, fields, files) {

       var bookName= fields.bookName[0];
       var author= fields.author[0];
       var description= fields.description[0];
       var price= fields.price[0];
       var _id= fields._id[0];

       if(files.pic && files.pic[0]){//如果上传了图片 则

           var orgFilename=files.pic[0].originalFilename;
           var picUrl=rootUrl+"/"+orgFilename;
           var book={
               bookName:bookName,
               author:author,
               description:description,
               price:price,
               picUrl:picUrl,
           };

           fs.rename(files.pic[0].path,form.uploadDir+"/"+orgFilename,function (err) {
               if (err) throw err;
               console.log('重命名完成');

               bookService.findBookById(_id,function (dbBook) {
                   if(dbBook.picUrl && dbBook.picUrl!= picUrl){
                       fs.unlinkSync("."+dbBook.picUrl);//删除历史图片
                   }
                   bookService.updateBook(_id,book,function (n) {
                       if(n>0){
                           res.json({status:200,message:'修改图书成功'});

                       }else{
                           res.json({status:200,message:'操作成功，未修改任何数据'});
                       }
                   });
               });
           });
       }else{//没有上传图片情况

           var book={
               bookName:bookName,
               author:author,
               description:description,
               price:price,

           };

           bookService.updateBook(_id,book,function (n) {
               if(n>0){
                   res.json({status:200,message:'修改图书成功'});

               }else{
                   res.json({status:200,message:'操作成功，未修改任何数据'});
               }
           });
       }
    });
});



//配置错误中间件 (500)
app.use(function (err,req,res,next) {
    res.status(500).type("html").end('<h3 style="text-align: center">500 - server internal  error</h3>');
});

//配置404 路由中间件  这个中间件应该配置在最后
app.use(function (req,res) {
    res.status(404).type("html").end('<h3 style="text-align: center">404 - page not found</h3>');
});

app.listen(3000);

console.log('nodejs server run at 3000');

