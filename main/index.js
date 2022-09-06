var exec = require('child_process').execFile;

var fun = async function(){
    console.log("Started the Function!");
    exec('./ipfs.exe daemon', async function(err, data){
        console.log(err, data)
    })
}

fun();