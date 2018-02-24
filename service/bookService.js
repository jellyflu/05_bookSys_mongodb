


var mongoDao=require('../dao/mongoDao.js');


var sd=require('silly-datetime');

var collectionName="t_book";

function findAllBook(callback) {

    mongoDao.findAll(collectionName,function (bookList) {
        callback(bookList);
    });
}
function findBookById(id,callback) {

    mongoDao.findById(collectionName,id,function (book) {
        callback(book);
    });
}
function addBook(book,callback) {

    book.createtime=  sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');


    mongoDao.insertOne(collectionName,book,function (n) {
        if(callback){
            callback(n);
        }
    });
}

function updateBook(id,book,callback) {


    mongoDao.updateById(collectionName,id,book,function (n) {
         callback(n);
    });

}

function deleteBookById(id,callback) {

    mongoDao.deleteById(collectionName,id,function (n) {
        callback(n);
    });

}

module.exports={
    findAllBook,
    findBookById,
    addBook,
    updateBook,
    deleteBookById,
};