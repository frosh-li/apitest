var api = require("./api.json");
var request = require("request");
var async = require("async");
var fs = require('fs');
var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
function generateMixed(n) {
     var res = "";
     for(var i = 0; i < n ; i ++) {
         var id = Math.ceil(Math.random()*35);
         res += chars[id];
     }
     return res;
}

function start(){
    var main_url = api.main_url,
        lists = api.lists;
    var uid = 200;
    var function_lists = [];
    var cookie = [];
    var newUser = generateMixed(10);
    lists.forEach(function(list){
        var url = main_url + list.url;
        var type = list.type;
        url = url.replace(/{uid}/,200);
        
        //console.log(url);
        var params = Object.keys(list.params).length > 0 ? list.params : null;
        for(var key in params){
            if((params[key]+"").indexOf("{code}") > -1){
                params[key] = params[key].replace(/{code}/,newUser);
            }
        }
        
        console.log("params",params);
        function_lists.push(
            function(cb){
                var j = request.jar();
                request = request.defaults({jar: true});
                var sTime = +new Date();
                var useTime;
                request({
                    url:url,
                    method:type,
                    form:params,
                    jar: j
                },function(errreq, res, body){
                    if(list.url .indexOf('login') > -1){
                        res.setEncoding("utf8");  
                        var headers=res.headers;  
                        cookie = headers["set-cookie"];
                        //console.log(cookie);
                    }
                    useTime = (+new Date()) - sTime;
                    console.log(list.url,useTime);
                    fs.appendFile('time.log',list.url+"\t"+useTime+"\n",function(err){
                        if(err){
                            console.log('system error', err.message);
                            return;
                        }
                        sTime = null;
                        useTime = null;
                        cb(errreq, JSON.parse(body));
                    });
                    
                });
            }
        );
    });
    async.series(function_lists,function(err, results){
        if(err){
            console.log(err);
            return;
        }
        results.forEach(function(result){
            if(result.Result.user_id){
                uid = result.Result.user_id;
            }
            if(result.Errors.Code !== 1){
                console.dir(result);
            }
        });
        setTimeout(start, 1000);
    });
}

function obj_to_params(obj){
    var ret = [];
    for(var key in obj){
        ret.push(key+"="+obj[key]);
    }
    return ret;
}

exports.start = start;

start();