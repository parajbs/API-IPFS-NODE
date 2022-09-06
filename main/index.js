const startDaemon = require("start-ipfs-daemon");
const express = require("express");
const app = express();
const cors = require("cors");
const exec = require("child_process").execSync;
const fs = require("fs");

app.use(cors());

app.use(express.json());

let hash = "";

async function IPFSstart() {
  const daemon = await startDaemon({
    execPath: "ipfs.exe",
    // Pipe stdout and stderr to these writeable streams if provided
    stdout: process.stdout,
    stderr: process.stderr,
  });
}

function uploadJSONToIPFS(filename, jsondata, isneeded) {
    fs.writeFile(filename+ ".json", JSON.stringify(jsondata), (err) => {
        if (err) throw err;
    
        console.log("Done writing"); // Success
      });
      try{
        const data = exec("ipfs add "+filename + ".json --quiet")
        return data;
      }catch(err)
      {
        console.log(err)
      }
}

async function getJSONFile() {
  exec(
    "ipfs",
    ["cat", "QmaMsVHrwrrs3V3NaUfw69bZPBuCuNGCpuB5mddmcQ1Gxp"],
    async function (err, data) {
      console.log(err, data);
    }
  );
}

app.get("/upload/uploadJson", async (req, res, next) => {
    const hash = uploadJSONToIPFS(req.body.name, req.body.data, req.body.isneeded)
    res.send({ ipfsHash: hash.toString()});
    next();
});

const port = 4000;

app.listen(port, () => {
  console.log(`server is UP at ${port}`);
  IPFSstart();
});
