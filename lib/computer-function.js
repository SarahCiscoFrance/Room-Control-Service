
var SSH2Promise = require('ssh2-promise');
const fs = require('fs').promises;

/**
 * 
 * @param {string} host Hostname or IP address of the server.
 * @param {string} username Username for authentication.
 * @param {string} password Password for password-based user authentication.
 */
async function restoreMac(host, username, password) {
    var ssh = new SSH2Promise({
        host: host,
        username: username,
        password: password
    });

    await ssh.connect();
    console.log("Connection established");
    let data = await fs.readFile("mac-files/default_state.scpt", "binary");
    data = data.toString().replaceAll('\"', '\\"').replaceAll('\$', '\\$')
    // console.log(data)
    await ssh.exec('touch test.scpt')
    await ssh.exec(`echo "${data}" > test.scpt`)
    await ssh.exec(`osascript test.scpt`)
    await ssh.exec(`rm test.scpt`)

    console.log("Closing connection");
    ssh.close();

}

module.exports = {
    restoreMac: restoreMac
}