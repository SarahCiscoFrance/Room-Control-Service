var express = require('express');
var router = express.Router();
const {getStatus, sendCommand} = require('../lib/room-function.js')

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
 *         "enum": ["on", "off"]
 *       store_going_down:
 *         type: boolean
 *       store_going_up:
 *         type: boolean
 */


/**
 * @swagger
 * /status:
 *   get:
 *     tags:
 *       - Status
 *     summary: Retrieve the status of the light and the store.
 *     description: Retrieve the status of the light and the store.
 *       <br>The light can have the status "on" or "off"
 *       <br>For the store "store_going_down" can be "true" or "false" and "store_going_up" can be "true" or "false"
 *     responses:
 *       200:
 *         description: JSON describing the status of the light and the store
 *         schema:
 *           $ref: '#/definitions/Status'
 */
router.get('/status', async function (req, res, next) {
  const info = {
    light_status: await getStatus(1, process.env.IP_RELAY_LIGHT) == "0" ? "off" : "on",
    store_going_down: await getStatus(2, process.env.IP_RELAY_STORE) == "0" ? false : true,
    store_going_up: await getStatus(1, process.env.IP_RELAY_STORE) == "0" ? false : true
  }
  res.send(info)
})

/**
 * @swagger
 * /light/:mode:
 *   get:
 *     tags:
 *       - Controller
 *     summary: Turn ON/OFF the light in Van Gogh.
 *     description: Set the light in the room Van Gogh.
 *       <br>The light has two mode "on" or "off"
 *       <br>Choose "on" to turn on the light or "off" to turn off the light
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/light/:mode', async function (req, res, next) {
  const mode = req.params.mode
  console.log(mode,  await getStatus(1, process.env.IP_RELAY_LIGHT))
  if (mode === 'on' && await getStatus(1, process.env.IP_RELAY_LIGHT) == "0") {
    sendCommand(1, process.env.IP_RELAY_LIGHT);
    res.send("success")
  }
  else if (mode === 'off' && await getStatus(1, process.env.IP_RELAY_LIGHT) == "1"){
    sendCommand(1, process.env.IP_RELAY_LIGHT);
    res.send("success")
  }else{
    res.send("bad request")
  }
})

/**
 * @swagger
 * /store/:mode:
 *   get:
 *     tags:
 *       - Controller
 *     summary: Up/down the store in Van Gogh.
 *     description: Up/down the store in the room Van Gogh.
 *       <br>The store command has two mode "up" or "down"
 *       <br>Choose "up" to raise on the store or "down" to lower the store
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/store/:mode', async function (req, res, next) {
  const mode = req.params.mode
  if (mode === 'down' && await getStatus(2, process.env.IP_RELAY_STORE) == "0") {
    sendCommand(2, process.env.IP_RELAY_STORE);
    setTimeout(function () {
      sendCommand(2, process.env.IP_RELAY_STORE);
    }, 20000);
    res.send("success")
  }
  else if(mode === 'up' && await getStatus(1, process.env.IP_RELAY_STORE) == "0") {
    sendCommand(1, process.env.IP_RELAY_STORE);
    setTimeout(function () {
        sendCommand(1, process.env.IP_RELAY_STORE);
    }, 20000);
    res.send("success")
  }else{
    res.send("bad request")
  }
});

module.exports = router;