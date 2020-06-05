'use strict'

const { BrowserWindow, app, ipcMain } = require('electron')
const NodeMediaServer = require('node-media-server')
const { Ffmpeg } = require('./lib/ffmpeg')
const { join } = require('path')

const config = {
  rtmp: {
    port: 1937,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
}

const localStream = 'rtmp://localhost:1937/live/STREAM';

const nms : any = new NodeMediaServer(config)
const ffmpeg : any = new Ffmpeg((obj : any) => { console.dir(obj) });
let win : any

app.on('ready', main)
app.on('window-all-closed', () => { app.quit() });
ipcMain.on('stream', (ev : any, args : any) => {
  //console.dir(ev)
  console.dir(args)
  const remoteStream : string = join(args.url, args.key);
  ffmpeg.stream(localStream, remoteStream, args.which);
})

ipcMain.on('kill', (ev : any, args : any) => {
  console.dir(ev)
  console.dir(args)
  ffmpeg.kill(args.which)
})

async function main () {
  win = new BrowserWindow({ width: 670, height: 720, frame: false, webPreferences : { nodeIntegration : true } })
  win.loadURL(`file://${__dirname}/index.html`)
  nms.run()
  win.webContents.openDevTools();
  win.once('ready-to-show', () => {
    win.show()
  })
}