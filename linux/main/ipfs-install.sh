sudo apt-get update

sudo apt-get install golang

wget https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_linux-amd64.tar.gz

tar -xvzf kubo_v0.15.0_linux-amd64.tar.gz

sudo bash kubo/install.sh

ipfs --version

sudo rm kubo_v0.15.0_linux-amd64.tar.gz
