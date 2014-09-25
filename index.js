var api = require("./api.json");
var request = require("request");
var async = require("async");

function start(){
    var main_url = api.main_url,
        lists = api.lists;
    var uid = 200;
    var function_lists = [];
    var cookie = [];
    lists.forEach(function(list){
        var url = main_url + list.url;
        var type = list.type;
        url = url.replace(/{uid}/,200);
        console.log(url);
        var params = Object.keys(list.params).length > 0 ? list.params : null;
        console.log("params",params);
        function_lists.push(
            function(cb){
                var j = request.jar();
                
                console.log(cookie);
                request = request.defaults({jar: true});
                request({
                    url:url,
                    method:type,
                    form:params,
                    jar: j
                },function(err, res, body){
                    if(list.url .indexOf('login') > -1){
                        res.setEncoding("utf8");  
                        var headers=res.headers;  
                        cookie = headers["set-cookie"];
                        //console.log(cookie);
                    }
                      
                    cb(err, JSON.parse(body));
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
            //if(result.Errors.Code !== 1){
                console.dir(result);
            //}
        });
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