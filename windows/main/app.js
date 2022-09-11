const axios = require("axios").default
const FormData = require('form-data');
const fs = require("fs");
// const image = fs.createReadStream("logo.png")


async function UploadData(){

    let datas = new FormData();
    datas.append('file', image);
    console.log(datas);
    let re = axios.post("http://localhost:4000/upload/uploadFile", datas,
    {
        headers: {
            publickey: 'DEFAULT',
            privatekey: 'DEFAULT123'
        }
    },).then(suc=>{
        console.log(suc)
    })
}

async function UploadJsonData(){
    axios({
        method: 'post', //you can set what request you want to be
        url: 'http://localhost:4000/upload/uploadJson',
        data: {
            name:"hello",
            data:{
                name:"First NFT to IPFS",
                Description:"This is a first ipfs cloud test"
            }
        },
        headers: {
            publickey: 'DEFAULT',
            privatekey: 'DEFAULT123'
        }
    }).then(suc=>{
        console.log(suc);
    })
}

async function GetJsonData(){
    axios({
        method: 'get', //you can set what request you want to be
        url: 'http://localhost:4000/get/getJson',
        data: {
            hash:"QmWLEw6oHb4hensFnAXFAphAv48sdCawjyhJyMKKDLmtfx"
        },
        headers: {
            publickey: 'DEFAULT',
            privatekey: 'DEFAULT123'
        }
    }).then(suc=>{
        console.log(suc);
    })
}

GetJsonData();