const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const request = require('request')
const Stream = require('stream')
const minmax = require('stumble/lib/gutil').minmax
const fs = require('fs')
const EventEmitter = require('events')
const Jamy = require('jamy')
const { min, max } = require('lib/utils')

const radio = require('./extensions/radio')
const youtube = require('./extensions/youtube/youtube')
const Mixer = require('./audio/mixer')
const voice = require('./extensions/voice')
const notepad = require('./extensions/notepad')


const volumedown = {
	handle: "volumedown",
	exec: function (data) {
		let gain = this.io.input ? this.io.input.gain : this.config.extensions.audio.gain
		gain = max(0.01, gain - this.config.extensions.audio.volumestep)
		if (this.io.input) {
			this.io.input.setGain(gain)
		}
		this.config.extensions.audio.gain = gain
		this.execute('info::gain')
	}
}
const volumeup = {
	handle: "volumeup",
	exec: function (data) {
		let gain = this.io.input ? this.io.input.gain : this.config.extensions.audio.gain
		gain = min(1, gain + this.config.extensions.audio.volumestep)
		if (this.io.input) {
			this.io.input.setGain(gain)
		}
		this.config.extensions.audio.gain = gain
		this.execute('info::gain')
	}
}
const pause = {
	handle: "pause",
	exec: function (data) {
		this.space.get('player').pause()
	}
}
const resume = {
	handle: "play",
	exec: function (data) {
		this.space.get('player').resume()
	}
}
const info = {
	handle: "messageinfo",
	extensions: [{
		handle: "info::gain",
		exec: function (data) {
			let gain = this.config.extensions.audio.gain
			if (this.io.input)
				gain = this.io.input.gain
			this.client.user.channel.sendMessage("Current volume: " + (gain * 100).toFixed(2))
		}
	}]
}


const reboot = {
	handle: "reboot",
	exec: _ => process.exit(0)
}

module.exports = {
	handle: 'streaming',
	needs: ['parser'],
	init: stumble => {
		const jamy = new Jamy({
			format: "s16le",
			frequency: 48000,
			channels: 1
		})
		const mixer = new Mixer()
		mixer.plug(jamy.stream)
		stumble.space.set("player", jamy)
		stumble.space.set("mixer", mixer)
		stumble.space.set("commands", new EventEmitter())
		if ("voice" in stumble.config.extensions) stumble.use(voice)

	},
	term: stumble => { },
	extensions: [info, youtube, notepad],
	commands: [radio, volumeup, volumedown, pause, resume, reboot]
}
