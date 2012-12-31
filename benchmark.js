#!/usr/bin/env node 
var cfg = require('optimist')
    .usage('Usage example: $0 --path=/test?rand=RND')
    .demand(['path'])
    .default({ 
        requests:1, hostname:'localhost', timelimit:200, concurrency:1, method:'POST' 
    })
    .argv;
var running = [];
var http = require('http');
var started_need_count = cfg.requests, ended_need_count = cfg.requests;

function resend(r){
    if(started_need_count<=0) return;
    started_need_count--;
    var options = { hostname: cfg.hostname };
    if(cfg.method) options.method = cfg.method;
    options.path = cfg.path.replace('RND',Math.random());
    var start_tm = Date.now();
    var req = http.request(options, function(res){
        var l = 0;
        res.on('data', function(chunk){ l += chunk.length });
        res.on('end', function(){
            var now = Date.now(), st = res.statusCode;
            if(!(st>=200 && st<400)) console.log('status:'+st+msg(now,l));
            if(now > start_tm + cfg.timelimit) console.log('time:'+msg(now,l));
            end(); 
        });//'close'?
    });
    req.on('error', function(e){
        console.log('error:'+err+msg(Date.now(),0));
        end()
    });
    req.end();
    function msg(n){return ' atm:'+n+' rtm:'+(n-start_tm)+' path:'+options.path}
    var ended = 0;
    function end(){
        if(ended++) return;
        r.ready_count = (r.ready_count||0)+1;
        ended_need_count--;
        resend(r);
    }
};

for(var j=0;j<cfg.concurrency;j++){
    var r = {};
    running.push(r);
    resend(r);
}

setInterval(function(){
    console.log( 
        ended_need_count +'; '+ 
        running.map(function(r){ return r.ready_count||0 }).join(' ')
    );
    if(ended_need_count<=0) process.exit(0)
},1000);
