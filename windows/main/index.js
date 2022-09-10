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
    console.log("****************************Uploading File "+Date.now()+path.extname(file.originalname)+"**************************\n")
    let nameFile = Date.now()+path.extname(file.originalname);
    cb(null, nameFile)
  }
})
const upload = multer({ storage: storage })

async function IPFSstart() {
  const daemon = await startDaemon({
    execPath: "ipfs.exe",
    // Pipe stdout and stderr to these writeable streams if provided
    stdout: process.stdout,
    stderr: process.stderr,
  });
  console.log("********************************Started the Server***************************\n")
}

async function uploadJSONToIPFS(filename, jsondata) {
    fs.writeFile(jsonloc + filename+ ".json", JSON.stringify(jsondata), (err) => {
        if (err) throw err;
    
        console.log("\nDone writing"); // Success
      });
      try{
        const hash = await execProm("ipfs add "+jsonloc+filename + ".json --quiet")
        console.log("****************************Uploading File"+filename+".json"+"**************************")
        console.log("\nHash Code is:"+hash);
        console.log("*******************************************************************************************\n\n")
        return hash.stdout;
      }catch(err)
      {
        console.log(err)
      }
}

async function uploadFileToIPFS(filename) {
    try{
      const hash = await execProm("ipfs add "+fileloc+filename + " --quiet")
      console.log("\nHash Code is:"+hash.stdout);
      console.log("*******************************************************************************************\n\n")
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

async function getJsonData(hash) {
  const data = await execProm("ipfs cat "+hash)
  return JSON.parse(data.stdout);
}

app.get("/upload/uploadJson", async (req, res, next) => {
  let auth = checkAuth(req.headers["publickey"], req.headers["privatekey"])
  if(auth)
  {
    let hash = await uploadJSONToIPFS(req.body.name, req.body.data)
    const finalHash = hash.slice(0, -1);
    res.send({ipfsHash:finalHash})
  }else{
    res.send({error: "Wrong Private Key. Please check your Keys Set!"})
    console.log("*******************************************************************************************\n\n")
  }
  next();
});

app.post("/upload/uploadFile", upload.single('file'), async (req, res, next) => {
  let auth = checkAuth(req.headers["publickey"], req.headers["privatekey"])
  if(!auth)
  {
    res.send({error: "Wrong Private Key. Please check your Keys Set!"})
    fs.unlinkSync(fileloc+req.file.filename);
    console.log("Wrong Keys Set! Please Check in apikey.json!");
    console.log("\n*******************************************************************************************\n")
    next();
  }else{
    if(req.file.mimetype != "application/x-msdownload")
    {
      let hash = await uploadFileToIPFS(req.file.filename);
      const finalHash = hash.slice(0, -1);
      res.send({ipfsHash:finalHash})
      next();
    }else{
      res.send({error: "Wrong format!"})
    }
  }
});

app.get("/get/getJson", async (req, res, next) => {
  let auth = checkAuth(req.headers["publickey"], req.headers["privatekey"])
  if(auth==true)
  {
    let data = await getJsonData(req.body.hash)
    res.send({ data: data});
  }else{
    res.send({error: "Wrong Private Key. Please check your Keys Set!"})
  }
  next();
});

app.listen(port, () => {

  if(apikey.PUBLICKEY == "" || apikey.PRIVATEKEY == "" || fs.read('apikey.json').length === 0)
  {
    console.log("Please generate API key using command: node index.js --genApiAlone");
    exit();
  }

  var arguments = process.argv;

  if(arguments[2] == "--genApiAlone")
  {
    clear();
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

      console.log("\n**NOTE: Please use both public and private key to communicate with IPFS cloud node. Don't share are leak your API key's\n\n\n Have a Great Day!")
      exit();
    });
  }
  else{
    console.log(`server is UP at ${port}`);
    IPFSstart();
    console.log("********************************Started the Server***************************")
  }
});
