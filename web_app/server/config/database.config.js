var ip = require("ip");
var LOCAL_IP = ip.address();

module.exports = {
    url: 'mongodb://localhost:27017/firstdb',
    url_rs: `mongodb://${LOCAL_IP}:27011,${LOCAL_IP}:27012,${LOCAL_IP}:27013?replicaSet=rs`
}