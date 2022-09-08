const axios = require("axios").default
const FormData = require('form-data');
const fs = require("fs");
const image = fs.createReadStream("1.png")


async function UploadData(){

    let datas = new FormData();
    datas.append('file', image);
    console.log(datas);
    let re = axios.post("http://localhost:4000/upload/uploadFile", datas,
    {
        data: {
            file: datas, // This is the body part
        }
    }).then(suc=>{
        console.log(suc)
    })
}

UploadData();