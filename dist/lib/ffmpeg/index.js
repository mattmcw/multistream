"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ffmpeg = void 0;
const child_process_1 = require("child_process");
const bin = require('ffmpeg-static');
class Ffmpeg {
    constructor(onMessage) {
        this.streams = {};
        this.onMessage = onMessage;
    }
    parseStderr(line) {
        //frame= 6416 fps= 30 q=31.0 size=   10251kB time=00:03:34.32 bitrate= 391.8kbits/s speed=   1x
        let obj = {};
        if (line.substring(0, 'frame='.length) === 'frame=') {
            try {
                obj.frame = line.split('frame=')[1].split('fps=')[0];
                obj.frame = parseInt(obj.frame);
                obj.fps = line.split('fps=')[1].split('q=')[0];
                obj.fps = parseFloat(obj.fps);
                obj.time = line.split('time=')[1].split('bitrate=')[0];
                obj.speed = line.split('speed=')[1].trim().replace('x', '');
                obj.speed = parseFloat(obj.speed);
                obj.size = line.split('size=')[1].split('time=')[0].trim();
            }
            catch (err) {
                console.error(err);
                console.log(line);
                process.exit();
            }
        }
        else {
        }
        return obj;
    }
    async stream(input, output, id) {
        //ffmpeg -re -i INPUT_FILE_NAME -c copy -f flv rtmp://localhost/live/STREAM_NAME
        const args = [
            '-re',
            '-i', input,
            '-c', 'copy',
            '-f', 'flv',
            output
        ];
        console.log(`Starting stream "${id}" ${input} -> ${output}`);
        return new Promise((resolve, reject) => {
            const child = child_process_1.spawn(bin, args);
            let stdout = '';
            let stderr = '';
            child.on('exit', (code) => {
                delete this.streams[id];
                if (code === 0) {
                    return resolve(false);
                }
                else {
                    console.error(`Process exited with code: ${code}`);
                    console.error(stderr);
                    return reject(stderr);
                }
            });
            child.stdout.on('data', (data) => {
                stdout += data;
            });
            child.stderr.on('data', (data) => {
                const line = data.toString();
                const obj = this.parseStderr(line);
                obj.id = id;
                if (this.onMessage)
                    this.onMessage(obj);
            });
            this.streams[id] = child;
            return child;
        });
    }
    kill(id) {
        if (typeof this.streams[id] !== 'undefined') {
            console.log(`Killing stream "${id}"`);
            this.streams[id].kill();
        }
    }
}
exports.Ffmpeg = Ffmpeg;
module.exports.ffmpeg = Ffmpeg;
//# sourceMappingURL=index.js.map