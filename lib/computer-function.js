
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
    await ssh.exec('touch test.scpt')
    await ssh.exec(`echo "${data}" > test.scpt`)
    await ssh.exec(`osascript test.scpt`)
    await ssh.exec(`rm test.scpt`)

    console.log("Closing connection");
    ssh.close();

}

/**
 * 
 * @param {string} host Hostname or IP address of the server.
 * @param {string} username Username for authentication.
 * @param {string} password Password for password-based user authentication.
 * @param {string} body AppleScript code to execute on computer.
 */
 async function executeAppleScriptCode(host, username, password, body) {
    var ssh = new SSH2Promise({
        host: host,
        username: username,
        password: password
    });

    const actions = async function(){
        await ssh.connect();
        console.log("Connection established");
        let data = body.toString().replaceAll('\"', '\\"').replaceAll('\$', '\\$')
        await ssh.exec('touch code.scpt')
        await ssh.exec(`echo "${data}" > code.scpt`)
        await ssh.exec(`osascript code.scpt`)
        await ssh.exec(`rm code.scpt`)
        console.log("Closing connection");
    }

    try {
        await Promise.race([actions() , new Promise((resolve, reject) => { setTimeout(reject, 10000, 'timed out') })]);
    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        ssh.close();
    }
    
}

module.exports = {
    restoreMac: restoreMac,
    executeAppleScriptCode: executeAppleScriptCode
}