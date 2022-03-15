const axios = require('axios').default;

/**
 * Return status of specifie relay
 * @param {number} relay_num - the number of the specified relay (1 or 2)
 * @param {string} relay_ip - the ip adress of the relay requested
 * @return {string} - the status of the relay requested ("0" or "1" where "0" means 
 * that the realy is not running and "1" that it's running)
 */
function getStatus(relay_num, relay_ip) {
    console.log('http://' + process.env.LOGIN + ':' + process.env.PASSWD + '@' + relay_ip + '/status.xml')
    return new Promise(resolve => {
        axios.get('http://' + process.env.LOGIN + ':' + process.env.PASSWD + '@' + relay_ip + '/status.xml').then(resp => {
                resolve(resp.data.split("<relay" + relay_num + ">")[1].split("</relay" + relay_num + ">")[0]);
            })
            .catch((err) => {
                console.log(err);
            });
    });
}



/**
 * Activate or deactivate the relay
 * @param {number} relay_num - the number of the relay requested
 * @param {string} relay_ip - the ip adress of the relay requested
 */
function sendCommand(relay_num, relay_ip) {
    axios.get('http://' + process.env.LOGIN + ':' + process.env.PASSWD + '@' + relay_ip + '/relays.cgi?relay=' + relay_num)
        .catch((err) => {
            console.log(err);
        });
}

module.exports = {
    sendCommand: sendCommand,
    getStatus: getStatus
}