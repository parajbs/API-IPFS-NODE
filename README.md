
<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/Pr0fe5s0r/API-IPFS-NODE/main/images/logo.png" alt="CloudIPFS" width="200">
  <br>
  Cloud IPFS
  <br>
</h1>

<h4 align="center">A Custom service provider of <a href="http://electron.atom.io" target="_blank">IPFS</a>.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-install">How To Install</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">Download</a> •
  <a href="#related">Related</a> •
</p>

<!-- ![screenshot](https://raw.githubusercontent.com/amitmerchant1990/electron-markdownify/master/app/img/markdownify.gif) -->

## Key Features

* Easy to Access using REST API:
  - Cloud IPFS uses Express and Node for REST API. Which makes file and data uploading easier.
* API key Authentication:
  - In order to communicate with the server we should need two keys.
* No Need to pay for IPFS:
  - By using Cloud IPFS makes your project cost efficient by making your cloud into IPFS node.
* Easy retrive of IPFS data:
  - Cloud IPFS also comes with IPFS data view option. Makes easier to retrive JSON data from IPFS network.

## How To Install

To run this application, you'll need [Git](https://git-scm.com), [GoLang](https://go.dev/dl/) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:


WINDOWS:
```bash
# Clone this repository
$ git clone https://github.com/Pr0fe5s0r/API-IPFS-NODE

# Go into the API-IPFS-NODE repository
$ cd API-IPFS-NODE

# Go into the windows/main
$ cd windows/main

# Generate API Keys
$ node index.js --genApiAlone

# Start the server
$ node index.js
```

> **Note**
> Soon linux version of Cloud IPFS will be uploaded!!



## How To Use

To Use the cloud ipfs you first need those API keys generated by the command ```bash $ node index.js --genApiAlone```.





**Upload JSON data:**

- Using cloud IPFS and it's REST API you can upload json data easier!

API Call: **``` /upload/uploadJson ```**

Header: ``` publickey: <'your publick key'>, privatekey:<'your privatekey'>```

Body: ``` {
    "name":"<'name of the file'>",
    data:{
      <'your json data'>
    }
} ```

API response: ```{
    "ipfshash":<'file hash'>
}```

**Example Progrma Using Axios:**

``` javascript 
async function UploadJsonData(){
    axios({
        method: 'post', //you can set what request you want to be
        url: 'http://<your address>/upload/uploadJson',
        data: {
            name:"CLOUDIPFS",
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
```
<br>
<br>

**Upload File:**

- Using cloud IPFS and it's REST API you can upload File easier!

API Call: **``` /upload/uploadFile ```**

Header: ``` publickey: <'your publick key'>, privatekey:<'your privatekey'>```

API response: ```{
    "ipfshash":<'file hash'>
}```

**Example Progrma Using Axios:**

``` javascript 
async function UploadJsonData(){
    const image = fs.createReadStream("yourfile.png")
    async function UploadData(){
        let datas = new FormData();
        datas.append('file', image);
        console.log(datas);
        let re = axios.post("http://<your address>/upload/uploadFile", datas,
        {
            headers: {
                publickey: 'DEFAULT',
                privatekey: 'DEFAULT123'
            }
        },).then(suc=>{
            console.log(suc)
        })
    }
```


# Donate:

**ETHEREUM ADDRESS: 0xD4E4cbd23a0D2a4B4E4a23bb5CbED205d72f67EC**

![Ethereum Address](images/wallet.png)
