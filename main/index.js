const startDaemon = require("start-ipfs-daemon");
const express = require("express");
const app = express();
const cors = require("cors");
const util = require("util");
const { exec } = require("child_process");
const execProm = util.promisify(exec);
const fs = require("fs");
const multer = require("multer")

app.use(cors());

app.use(express.json());

const upload = multer({
  dest:'./upload/files'
})

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
    fs.writeFile("./jsons/"+filename+ ".json", JSON.stringify(jsondata), (err) => {
        if (err) throw err;
    
        console.log("\nDone writing"); // Success
      });
      try{
        const hash = await execProm("ipfs add "+"./jsons/"+filename + ".json --quiet")
        console.log("****************************Uploading File"+filename+".json"+"**************************")
        console.log("\nHash Code is:"+hash);
        console.log("*******************************************************************************************\n\n")
        return hash;
      }catch(err)
      {
        console.log(err)
      }
}

async function getJsonData(hash) {
  const data = await execProm("ipfs cat "+hash)
  return JSON.parse(data.stdout);
}

app.get("/upload/uploadJson", async (req, res, next) => {
    let hash = await uploadJSONToIPFS(req.body.name, req.body.data)
    res.send({ ipfsHash: hash});
    next();
});

app.post("/upload/uploadFile", upload.single('file'), async (req, res, next) => {
  console.log(req.file);
  res.send({data:"Hello"})
  next();
});

app.get("/get/getJson", async (req, res, next) => {
  let data = await getJsonData(req.body.hash)
  res.send({ data: data});
  next();
});

const port = 4000;

app.listen(port, () => {
  console.log(`server is UP at ${port}`);
  IPFSstart();
  console.log("********************************Started the Server***************************")
});
