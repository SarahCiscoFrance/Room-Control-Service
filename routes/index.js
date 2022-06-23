var express = require('express');
var router = express.Router();
const {getStatus, sendCommand} = require('../lib/room-function.js')
const {restoreMac, executeAppleScriptCode} = require('../lib/computer-function.js')

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Room-Control'
  });
});

/**
 * @swagger
 * definitions:
 *   Status:
 *     properties:
 *       light_status:
 *         type: string
 *         enum: ["on", "off"]
 *       blinds_going_down:
 *         type: boolean
 *       blinds_going_up:
 *         type: boolean
 */


/**
 * @swagger
 * /status:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Status
 *     summary: Retrieve the status of the light and the blinds.
 *     description: Retrieve the status of the light and the blinds.
 *       <br>The light can have the status "on" or "off"
 *       <br>For the blinds "blinds_going_down" can be "true" or "false" and "blinds_going_up" can be "true" or "false"
 *     responses:
 *       200:
 *         description: JSON describing the status of the light and the blinds
 *         schema:
 *           $ref: '#/definitions/Status'
 */
router.get('/status', async function (req, res, next) {
  const info = {
    light_status: await getStatus(1, process.env.IP_RELAY_LIGHT) == "0" ? "off" : "on",
    blinds_going_down: await getStatus(2, process.env.IP_RELAY_BLINDS) == "0" ? false : true,
    blinds_going_up: await getStatus(1, process.env.IP_RELAY_BLINDS) == "0" ? false : true
  }
  res.send(info)
})

/**
 * @swagger
 * /light/{mode}:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Controller
 *     parameters:
 *       - in: path
 *         name: mode
 *         schema:
 *           type: string
 *         required: true
 *         description: The mode of the light ("on" or "off")
 *     summary: Turn ON/OFF the light in Van Gogh.
 *     description: Set the light in the room Van Gogh.
 *       <br>The light command has two mode "on" or "off"
 *       <br>Choose "on" to turn on the light or "off" to turn off the light
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/light/:mode', async function (req, res, next) {
  const mode = req.params.mode
  if (mode === 'on'){
    if(await getStatus(1, process.env.IP_RELAY_LIGHT) == "0") {
      sendCommand(1, process.env.IP_RELAY_LIGHT);
      res.send("success")
    }else{
      res.send("light already on")
    }
  }
  else if (mode === 'off'){
    if(await getStatus(1, process.env.IP_RELAY_LIGHT) == "1"){
      sendCommand(1, process.env.IP_RELAY_LIGHT);
      res.send("success")
    }else{
      res.send("light already off")
    }
  }else{
    res.send("bad request")
  }
})

/**
 * @swagger
 * /blinds/{mode}:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Controller
 *     parameters:
 *       - in: path
 *         name: mode
 *         schema:
 *           type: string
 *         required: true
 *         description: The mode of the blinds ("up" or "down")
 *     summary: Up/down the blinds in Van Gogh.
 *     description: Up/down the blinds in the room Van Gogh.
 *       <br>The blinds command has two mode "up" or "down"
 *       <br>Choose "up" to raise the blinds or "down" to lower the blinds
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/blinds/:mode', async function (req, res, next) {
  const mode = req.params.mode
  if (mode === 'down' && await getStatus(2, process.env.IP_RELAY_BLINDS) == "0") {
    sendCommand(2, process.env.IP_RELAY_BLINDS);
    setTimeout(function () {
      sendCommand(2, process.env.IP_RELAY_BLINDS);
    }, 20000);
    res.send("success")
  }
  else if(mode === 'up' && await getStatus(1, process.env.IP_RELAY_BLINDS) == "0") {
    sendCommand(1, process.env.IP_RELAY_BLINDS);
    setTimeout(function () {
        sendCommand(1, process.env.IP_RELAY_BLINDS);
    }, 20000);
    res.send("success")
  }else{
    res.send("bad request")
  }
});

/**
 * @swagger
 * /restore/mac:
 *   post:
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Controller
 *     parameters:
 *       - in: body
 *         name: host
 *         schema:
 *           type: string
 *         required: true
 *         description: Hostname or IP address of the server.
 *       - in: body
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username for ssh authentication.
 *       - in: body
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: Password for password-based user ssh authentication.
 *     summary: Set to default state the selected Mac computer in the Showroom.
 *     description: Set to default state a Mac computer.
 *       <br>This operation takes a few seconds.
 *       <br>You must provide in the body the necessary information to establish the ssh connection 
 *     responses:
 *       200:
 *         description: Success
 */
 router.post('/restore/mac/', async function (req, res, next) {
  const {host, username, password} = req.body;
  if (host && username && password) {
    await restoreMac(host, username, password).catch(err => {
      console.log(err)
      res.status(500).send(`Error: ${err.message}`);
      return
    })
    res.send("success")
  }else{
    res.send("bad request: field missing...")
  }
});


/**
 * @swagger
 * /sendCommand/mac/:
 *   post:
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Controller
 *     parameters:
 *       - in: body
 *         name: host
 *         schema:
 *           type: string
 *         required: true
 *         description: Hostname or IP address of the server.
 *       - in: body
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username for ssh authentication.
 *       - in: body
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: Password for password-based user ssh authentication.
 *       - in: body
 *         name: body
 *         schema:
 *           type: string
 *         required: true
 *         description: AppleScript code containing the commands to execute.
 *     summary: Execute AppleScript commands on the selected Mac computer in the Showroom.
 *     description: Execute AppleScript code on a Mac computer.
 *       <br>This operation takes a few seconds.
 *       <br>You must provide in the payload the necessary information to establish the ssh connection. Also you need to provide the AppleScript code to execute.
 *     responses:
 *       200:
 *         description: Success
 */
 router.post('/sendCommand/mac/', async function (req, res, next) {
  const {host, username, password, body} = req.body;
  if (host && username && password && body) {
    try {
      await executeAppleScriptCode(host, username, password, body)
      res.send("success")
    } catch (error) {
      console.log(error)
      if(error.level === 'client-timeout'){
        res.status(400).send({message:'The IP address provided is incorrect'})
      }
      else if(error.level === 'client-authentication'){
        res.status(400).send({message:'SSH authentication failed. Please check the provided credentials.'})
      }
      else if(error === 'timed out'){
        res.status(400).send({message:'Cannot perform actions. Computer is in StandBy Mode or Off.'})
      }
      else{
        res.status(400).send({message:'Something went wrong... Please check that there are no syntax errors in the Applescript code or that there are no permission requests required/pending on the computer.'})
      }
    }
  }else{
    res.status(400).send({message:"bad request: field missing..."})
  }
});
module.exports = router;