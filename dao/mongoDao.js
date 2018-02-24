
//mongoDao.js    mongodb底层操作封装
var mongodb=require("mongodb");
var MongoClient=mongodb.MongoClient;
var ObjectID=mongodb.ObjectID;

var dbUrl = "mongodb://localhost:27017/";
var dbName="myDB1";



 function _getRidOffNonAttr(obj) {
    var o={};
    for(var x in obj){
        if(obj[x]){
            o[x]=obj[x];
        }
    }
    return o;
}




/**
 * 连接数据库(自动关闭数据库)
 * @param callback  回调函数中返回 dbo对象
 * @private
 */
function  __connectDb(callback) {
    MongoClient.connect(dbUrl,function (err,db) {
        if (err) {
            throw  err;
        }
        try {
            var dbo = db.db(dbName);
            callback(dbo);
        }finally{
            db.close();
        }
            // var dbo = db.db(dbName);
            // callback(dbo);
            // db.close();
    });

}

/**
 * @param collectionName 集合名 表名
 * @param whereClause  条件字句 对象
 * @param callback 回调函数
 */
function find(collectionName,whereClause,callback) {
    __connectDb(function (dbo) {

        dbo.collection(collectionName).find(whereClause).toArray(function(err, list) { // 返回集合中所有数据
            if (err) throw err;

            callback(list);//返回列表数据
        });
    });
}


/**
 *
 * @param collectionName  集合名  表名
 * @param id   ObjectID
 * @param callback  回调函数
 */
function findById(collectionName,id,callback) {
    __connectDb(function (dbo) {

        dbo.collection(collectionName).find({'_id':ObjectID(id)}).toArray(function(err, list) { // 返回集合中所有数据
            if (err) throw err;

            callback(list[0]||undefined);//返回列表中唯一的一条数据
        });
    });
}
/**
 *
 * @param collectionName  集合名  表名
 * @param callback  回调函数
 */
function findAll(collectionName,callback) {
    __connectDb(function (dbo) {

        dbo.collection(collectionName).find({}).sort({"createtime":-1}).toArray(function(err, list) { // 返回集合中所有数据
            if (err) throw err;

            callback(list);//返回列表数据
        });
    });
}



/**
 *
 * @param collectionName  集合名
 * @param insertObj   插入对象
 * @param callback options可选的回调函数，返回实际受影响的行数 n
 */
function insertOne(collectionName,insertObj,callback) {
    __connectDb(function (dbo) {
        dbo.collection(collectionName).insertOne(insertObj, function(err, result) {
        if (err) {
            throw  err;
        }
        if(callback){
             console.log(result.result.n+" 条数据被插入");
            callback(result.result.n); //返回实际受影响的行数 n
        }
      });
    });

}

/**
 *
 * @param collection 集合名
 * @param insertArray  插入对象数组
 * @param callback  可选的回调函数， 可获得mongodb操作底层返回的result对象
 */
function insertMany(collectionName,insertArray,callback) {
    __connectDb(function (dbo) {
        dbo.collection(collectionName).insertMany(insertArray, function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.n+" 条数据被插入");
                callback(result.result.n); //返回实际受影响的行数 n
            }
        });
    });
}

/**
 *
 * @param collectionName  集合名称
 * @param whereClause 条件字句对象
 * @param updateClause  一个update对象  $set
 * @param callback  可选的回调函数，得到实际被修改的文档的条数
 */
function updateOne(collectionName,whereClause,updateClause,callback) {
    __connectDb(function (dbo) {

        updateClause=_getRidOffNonAttr(updateClause);

       // dbo.collection(collectionName).updateOne(whereClause, updateClause,function(err, result) {
        dbo.collection(collectionName).updateOne(whereClause, {$set:updateClause},function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.nModified+" 条数据被更新");
                callback(result.result.nModified);//n条文档被更新  返回数字
            }
        });
    });
}

/**
 *
 * @param collectionName  集合名称
 * @param id  ObjectID
 * @param updateClause   一个update对象  $set
 * @param callback  选的回调函数，得到实际被修改的文档的条数
 */
function updateById(collectionName,id,updateClause,callback) {
    __connectDb(function (dbo) {

      //  dbo.collection(collectionName).updateOne({'_id':ObjectID(id)}, updateClause,function(err, result) {
        dbo.collection(collectionName).updateOne({'_id':ObjectID(id)}, {$set:updateClause},function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.nModified+" 条数据被更新");
                callback(result.result.nModified);//n条文档被更新  返回数字
            }
        });
    });
}


/**
 *
 * @param collectionName  集合名称
 * @param whereClause 条件字句对象
 * @param updateClause update对象  {$set: { "url" : "https://www.runoob.com" }};
 * @param callback  可选的回调函数，得到实际被修改的文档的条数
 */
function  updateMany(collectionName,whereClause,updateClause,callback) {
    __connectDb(function (dbo) {

        updateClause=_getRidOffNonAttr(updateClause);

   //     dbo.collection(collectionName).updateMany(whereClause, updateClause,function(err, result) {
        dbo.collection(collectionName).updateMany(whereClause, {$set:updateClause},function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.nModified+" 条数据被更新");
                callback(result.result.nModified);//n条文档被更新  返回数字
            }
        });
    });
}

/**
 *删除匹配条件的第一条文档
 * @param collectionName
 * @param whereClause
 * @param callback
 */
function deleteOne(collectionName,whereClause,callback) {

    __connectDb(function (dbo) {

        dbo.collection(collectionName).deleteOne(whereClause,function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.n+" 条数据被删除");
                callback(result.result.n);//n条文档被删除  返回实际被删除的文档数量

            }
        });
    });
}
/**
 * 根据id删除 一条文档
 * @param collectionName
 * @param id
 * @param callback
 */
function deleteById(collectionName,id,callback) {

    __connectDb(function (dbo) {

        dbo.collection(collectionName).deleteOne({'_id':ObjectID(id)},function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.n+" 条数据被删除");
                callback(result.result.n);//n条文档被删除  返回实际被删除的文档数量
            }
        });
    });
}


/**
 * 删除匹配条件的所有文档
 * @param collectionName
 * @param whereClause
 * @param callback
 */
function  deleteMany(collectionName,whereClause,callback) {

    __connectDb(function (dbo) {

        dbo.collection(collectionName).deleteMany(whereClause,function(err, result) {
            if (err) {
                throw  err;
            }
            if(callback){
                console.log(result.result.n+" 条数据被删除");
                callback(result.result.n);//n条文档被删除  返回实际被删除的文档数量
                //   console.log(result.result.n + " 条文档被删除");//
            }
        });
    });
}




//测试demo

// ok
// find("t_book",{bookName:/java/},function (list) {
//     console.log('查询到数据list如下');
//     console.log(list);
// });


// ok
// findById("t_book",'5a901e524b823f04e4258055',function (data) {
//     console.log('查询到数据如下');
//     console.log(data);
// });


//ok
// findAll('t_book',function (list) {
//     console.log(list);
// });

//ok
// insertOne('t_book',
//     {
//     bookName: 'c语言程序设计',
//     author: 'Dennis Ritchie',
//     description: '进入编程世界的大门，c语言！',
//     price: 133.99,
//     createtime: '2018-02-22 20:10:10'
//     },function (n) {
//         console.log(n+" 条文档被插入");
//     });

//ok
// db.student.update({"name":"小明"},{$set:{"age":16}});
// updateById('t_book','5a90383caca822266c00edc4',{$set:{description:'22222'}},function (n) {
//
//     console.log(n+"条数据被更新");
// });

//ok
// deleteById('t_book','5a90383caca822266c00edc4',function (n) {
//     console.log(n+" 条文档被删除");
// });



module.exports={
    find,
    findAll,
    findById,
    insertOne,
    insertMany,

    updateById,
    updateOne,
    updateMany,

    deleteById,
    deleteMany,
    deleteOne,

    ObjectID,
};
