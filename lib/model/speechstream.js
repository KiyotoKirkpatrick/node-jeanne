const google_speech = require('google-speech')
const path = require('path')
const ffmpeg = require("fluent-ffmpeg")
const Stream = require("stream")
const fs = require('fs')
const keys = require('keys/api-keys.json')
const google_api_key = keys["google-speech"]
const logger = require('lib/logger')('SpeechStream')
const Speaker = require('speaker');


function SpeechStream(engine = "GOOGLE", lang = "en-US") {
	return new GoogleStream(google_api_key, lang)
}


class GoogleStream extends Stream.Writable {
	constructor(api_key, lang) {
		super()
		this.api_key = api_key
		this.lang = lang
		this.textStream = new Stream.PassThrough({
			objectMode: true
		})
		this.acc = []
		this.timeout = null
		this.pending = false
		this.input = this.converted = null
	}
	_write(chunk, encoding, cb) {
		clearTimeout(this.timeout)
		if (this.pending) {
			this.acc.push(chunk)
		} else {
			if (this.input == null) {
				this.input = new Stream.PassThrough
				this.converted = new Stream.PassThrough
				this.speaker = new Speaker({
				  channels: 1,          // 2 channels
				  bitDepth: 16,         // 16-bit samples
				  sampleRate: 16000,     // 16000 Hz sample rate
				  device: "hw:Loopback,1,1"
				});

				ffmpeg(this.input)
					// .on('start', function(commandLine) {
					// 	logger.log('Spawned Ffmpeg with command: ' + commandLine);
					// })
					// .on('progress', function(progress) {
					// 	logger.info('Processing: ' + progress.percent + '% done');
					// })
					// .on('stderr', function(stderrLine) {
					// 	logger.error('Stderr output: ' + stderrLine);
					// })
					.withInputFormat('s16le')
					.format('s16le')
					.withAudioFrequency(16000)
					.pipe(this.converted)

				if (this.acc.length > 0) {
					this.input.write(Buffer.concat(this.acc))
					this.acc = []
				}
			}
			this.input.write(chunk)
			this.timeout = setTimeout(this.makeRequest.bind(this), 500)
		}
		cb()
	}
	makeRequest() {
		logger.log("Making request ..\n")
		this.pending = true
		this.input.end()
		// this.speaker.end()
		this.converted.pipe(this.speaker)
		// google_speech.ASR({
		// 	//debug: true,
		// 	developer_key: this.api_key,
		// 	stream: this.converted,
		// 	lang: this.lang
		// }, this.requestCallback.bind(this))
	}
	requestCallback(err, res) {
		this.speaker = null
		this.input = null
		this.pending = false
		if (err) return logger.error(err)
		this.handleResponse(res)
	}
	handleResponse(response) {
		logger.log(JSON.stringify(response))
		if (response.result && response.result.length > 0)
			this.textStream.push(response.result[response.result_index].alternative)
	}
}

module.exports = SpeechStream
