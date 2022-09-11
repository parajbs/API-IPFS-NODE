const startDaemon = require("start-ipfs-daemon");
const express = require("express");
const app = express();
const cors = require("cors");
const util = require("util");
const { exec } = require("child_process");
const execProm = util.promisify(exec);
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { generateApiKey } = require('generate-api-key');
const { exit } = require("process");
const { clear } = require("console");

const apikey = require('./apikey.json')

app.use(cors());

app.use(express.json());

const port = 4000;
const fileloc = "./upload/files/";
const jsonloc = "./jsons/";

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null, "upload/files")
  },
  filename:async (req, file, cb)=>{
    let nameFile = Date.now()+path.extname(file.originalname);
    cb(null, nameFile)
  }
})
const upload = multer({ storage: storage })

async function IPFSstart() {
  const daemon = await startDaemon({
    execPath: "ipfs",
    // Pipe stdout and stderr to these writeable streams if provided
    stdout: process.stdout,
    stderr: process.stderr,
  });
  console.log("********************************Started the Server***************************\n")

  if(apikey.PUBLICKEY == "DEFAULT" || apikey.PRIVATEKEY == "DEFAULT123" ){
    console.log("**Running in Default Key. Please change by command: node index.js --genApiAlone")
  }

  console.log("Your Public Key  :"+apikey.PUBLICKEY)
  console.log("Your Private Key :"+apikey.PRIVATEKEY)
  console.log("\n*******************************************************************************************\n")
  console.log("Server is Running on Port: "+port)
}

async function uploadJSONToIPFS(filename, jsondata) {
    let nameFile = Date.now()+path.extname(filename);
    fs.writeFile(jsonloc + nameFile+ ".json", JSON.stringify(jsondata), (err) => {
        if (err) console.log(err);
    });
    try{
      const hash = await execProm("ipfs add "+jsonloc+nameFile + ".json --quiet")
      bannerconsole(nameFile+".json", hash.stdout);
      return hash.stdout;
    }catch(err)
    {
      console.log(err)
    }
}

async function uploadFileToIPFS(filename) {
    try{
      const hash = await execProm("ipfs add "+fileloc+filename + " --quiet")
      bannerconsole(filename, hash.stdout);
      return hash.stdout;
    }catch(err)
    {
      console.log(err)
    }
}

function checkAuth(pubkey, privkey){
  const sprikey = apikey.PRIVATEKEY;
  const spubkey = apikey.PUBLICKEY;

  if(pubkey==spubkey && privkey==sprikey)
  {
    return true
  }else{
    return false;
  }
}

async function PinToLocalIPFS(hash){
  try{
    const finhash = await execProm("ipfs pin add "+hash)
    return true;
  }catch(err){
    return false;
  }
}

async function removePinIPFS(hash){
  try{
    const finhash = await execProm("ipfs pin rm "+hash)
    return false;
  }catch(err){
    return true;
  }
}
function bannerconsole(filename, hash, pinned){
  console.log("****************************Uploading File "+filename+" To IPFS**************************\n")
  console.log("\nFile Name: "+filename);
  console.log("IPFS Hash: "+hash)
  console.log("IPFS URL:  "+"https://ipfs.io/ipfs/"+hash);
}

async function getJsonData(hash) {
  const data = await execProm("ipfs cat "+hash)
  try{
    let jsondata = JSON.parse(data.stdout);
    return jsondata;
  }catch(err){
    return false;
  }
}

app.post("/upload/uploadJson", async (req, res, next) => {
  let auth = checkAuth(req.headers["publickey"], req.headers["privatekey"])
  if(auth)
  {
    let hash = await uploadJSONToIPFS(req.body.name, req.body.data)
    const finalHash = hash.slice(0, -1);
    if(req.body.pin == true)
    {
      let pinned = await PinToLocalIPFS(finalHash)
      res.send({ipfsHash:finalHash, url:"https://ipfs.io/ipfs/"+finalHash, pin: pinned})
    }else{
      let nonpined = await removePinIPFS(finalHash);
      res.send({ipfsHash:finalHash, url:"https://ipfs.io/ipfs/"+finalHash, pin: nonpined})
    }
  }else{
    res.send({error: "Wrong Private Key. Please check your Keys Set!"})
  }
  next();
});

app.post("/upload/uploadFile", upload.single('file'), async (req, res, next) => {
    let auth = checkAuth(req.headers["publickey"], req.headers["privatekey"])
    if(!auth)
    {
      console.log(req.headers)
      res.send({error: "Wrong Private Key. Please check your Keys Set!"})
      if(fs.existsSync(fileloc+req.file.filename)){
        fs.unlinkSync(fileloc+req.file.filename);
      }
    }else{
      if(req.file.mimetype != "application/x-msdownload")
      {
        let hash = await uploadFileToIPFS(req.file.filename);
        const finalHash = hash.slice(0, -1);
        if(req.body.pin == true)
        {
          let pinned = await PinToLocalIPFS(finalHash)
          res.send({ipfsHash:finalHash, url:"https://ipfs.io/ipfs/"+finalHash, pin: pinned})
        }else{
          let nonpined = await removePinIPFS(finalHash);
          res.send({ipfsHash:finalHash, url:"https://ipfs.io/ipfs/"+finalHash, pin: nonpined})
        }
      }else{
        res.send({error: "Wrong format!"})
      }
  }
  next();
});

app.get("/get/getJson", async (req, res, next) => {
  let auth = checkAuth(req.headers["publickey"], req.headers["privatekey"])
  if(auth==true)
  {
    let data = await getJsonData(req.body.hash)
    if(data == false)
    {
      res.send({erro:"Requested data is not a JSON data."})
    }else{
      res.send({ data: data});
    }
  }else{
    res.send({error: "Wrong Private Key. Please check your Keys Set!"})
  }
  next();
});


function generateAPIKEY(){
  let publickey = generateApiKey({ method: 'bytes' });
  let privatekey = generateApiKey({ method: 'base32', dashes: false });

  let jsondata = {
    PUBLICKEY: publickey,
    PRIVATEKEY: privatekey
  }
  fs.writeFile("apikey.json", JSON.stringify(jsondata), (err) => {
    if (err) throw err;
    console.log("Generating Keys and storing for future cases.....!")
    console.log("\n\nYour Public Key is   : "+publickey);
    console.log("Your Private Key is  : "+privatekey);

    console.log("\n **NOTE: Please use both public and private key to communicate with IPFS cloud node. Don't share are leak your API key's.\n\n View it inside apikey.json\n\n Have a Great Day!\n\n Next Run Command: node index.js or yarn index.js")
    exit();
  });
}

app.listen(port, () => {

  var arguments = process.argv;

  if(arguments[2] == "--genApiAlone")
  {
    generateAPIKEY();
  }

  if(apikey.PUBLICKEY == null || apikey.PRIVATEKEY == null || fs.statSync('./apikey.json').size == 0)
  {
    generateAPIKEY();
  }else
  {
    IPFSstart();
    console.log("********************************Started the Server***************************")
  }
});
