var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('cmap', { title: 'map interface' });
});

//设置跨域访问
router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

/* GET home page. */
router.post('/queryPosition', function(req, res) {
  var resObj = new Object();
  resObj.success = 1;
  resObj.msg = '';

  res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
  try {
      console.log("telephone --->"+ req.body.telephone);
      var postData = JSON.stringify(req.body);

      queryDevidByTelephone(postData, function(devResObj) {
          if(devResObj == null || devResObj.success == 0 || devResObj.data == null) {
              resObj.success = 0;
              resObj.msg = '找不到设备信息';
              var resData = JSON.stringify(resObj);
              res.end(resData);
              return false;
          }

          var devDataJson = devResObj.data;
          console.log('devDataJson --->'+ devDataJson);

          var devDataArr = JSON.parse(devDataJson);
          var devid = devDataArr[0].devid;

          var params = new Object();
          params.devid = devid;

          var postData2 = JSON.stringify(params);
          queryDevPosition(postData2, function (posiResObj) {
              if(posiResObj == null || posiResObj.success == 0 || posiResObj.data == null) {
                  resObj.success = 0;
                  resObj.msg = '找不到设备的位置信息';
                  var resData = JSON.stringify(resObj);
                  res.end(resData);
                  return false;
              }

              console.log('posiResObj.data --->'+ posiResObj.data);
              resObj.data = posiResObj.data;
              var resData = JSON.stringify(resObj);
              res.end(resData);
          });

      });

  }catch (e) {
      console.log('======error======', e)

      resObj.msg = 'Catch Error';
      resObj.success = 0;
      var resData = JSON.stringify(resObj);
      res.end(resData);
  }
});

module.exports = router;

var queryDevidByTelephone = function (postData, callBack) {

    // do a POST request
    // prepare the header
    var postHeaders = {
        'Content-Type' : 'application/json; charset=UTF-8',
        'x-auth-header' : 'DXq7BswuMStDnLRZ8JN2Eit0ymAofSIJyoP9Ua74rSISq1tSzP9+MUIWQN4GyxEQ4GkcyzJmfAFs9DfLI5235O0LlfVsfol9WyphGnS5jfybuittyytXDgR7xJWJaOwTjkwNBchKny1Vpr+rI2ao5rtuZrgYwDmMT4YYSurTnxw=',
        'Content-Length' : Buffer.byteLength(postData, 'utf8')
    };

    var postOptions = {
        hostname: '193.112.105.43',
        port: 8081,
        path: '/cmanager/carInfo/queryInfoByTelephone',
        method: 'POST',
        headers: postHeaders
    };

    doPost(postHeaders, postOptions, postData, callBack);
};

var queryDevPosition = function (postData, callBack) {

    // do a POST request
    // prepare the header
    var postHeaders = {
        'Content-Type' : 'application/json; charset=UTF-8',
        'x-auth-header' : 'GEztLdJ+fnSfJUNWL4xJ8EpkGVWQu85TU7FmIW5S5VJrtI+w2HK4ttNi76UoztnAOq9jZudnLhWMTb8P5tNDaJguniFpOiwf6kpSkbOLU0ppRzKARPVSN92/OQizvO0vn7TqbUPSXQFh106pVFjU/c5Q/YqlurY0tTPPhDj/LvY=',
        'Content-Length' : Buffer.byteLength(postData, 'utf8')
    };

    var postOptions = {
        hostname: '193.112.105.43',
        port: 8082,
        path: '/cposition/position/queryInfoByDevid',
        method: 'POST',
        headers: postHeaders
    };

    var resObj = doPost(postHeaders, postOptions, postData, callBack);
    return resObj;
};


var doPost = function (postHeaders, postOptions, postData, callBack) {

    var resObj = new Object();
    resObj.success = 1;
    resObj.msg = '';

    var req = http.request(postOptions, function(resp) {
        console.log('RESP STATUS:'+ resp.statusCode);
        console.log('RESP HEADERS:'+ JSON.stringify(resp.headers));
        resp.setEncoding('utf8');
        var rtData = '';
        resp.on('data', function(chunk) {
            console.log('RESP BODY:'+ chunk);
            rtData += chunk;
        });
        resp.on('end', function() {
            console.log('No more data in response.');
            resObj.data = rtData;

            callBack(resObj);
            // return resObj;
        });
    });

    req.on('error', function(e) {
        console.error('problem with request: '+ e.message);
        resObj.msg = e.message;
        resObj.success = 0;

        callBack(resObj);
    });

    // write data to request body
    req.write(postData);
    req.end();
};