const s = require('lib/mumble/stumble-instance.js')
const logger = require('lib/logger.js')('speech-commands')
const between = (a, b, c) => c < a ? a : (c > b ? b : c)
const { BreakException } = require('lib/utils.js')
const commands = {
	volume: {
		detector: /volume (\d+)/i,
		func: function (matches, tr) {
			let vol = parseFloat(matches[1], 10) / 100.0
			vol = between(0, 1, vol)
			this.config.extensions.audio.gain = vol
			if (this.io.input)
				this.io.input.setGain(vol)

			this.execute("info::gain")
		}
	},
	play: {
		detector: /(?:(?:play)|(?:youtube)) (.+)/i,
		func: function (matches, tr) {
			let terms = matches.slice(1).join(' ')
			logger.log("Setting video/song: " + terms)
			this.invoke('yt', {
				message: terms
			})
		}
	},
	stop: {
		detector: /(?:stop)/i,
		func: function (matches, tr) {
			this.invoke('stop')
		}
	},
	next: {
		detector: /(?:next)/i,
		func: function (matches, tr) {
			this.invoke('next')
		}
	},
	previous: {
		detector: /(?:previous)/i,
		func: function (matches, tr) {
			this.invoke('previous')
		}
	},
	reboot: {
		detector: /(?:reboot)/i,
		func: function (matches, tr) {
			this.invoke('reboot')
		}
	},
	volumedown: {
		detector: /(?:volume down)/i,
		func: function (matches, tr) {
			this.invoke("volumedown")
		}
	},
	volumeup: {
		detector: /(?:volume up)/i,
		func: function (matches, tr) {
			this.invoke("volumeup")
		}
	},
	addnext: {
		detector: /((?:add next)|(?:add next song)) (.+)/i,
		func: function (matches, tr) {
			this.invoke("addnext", {
				message: matches.slice(1).join(' ')
			})
		}
	},
	add: {
		detector: /(?:add) (.+)/i,
		func: function (matches, tr) {
			this.invoke("add", {
				message: matches.slice(1).join(' ')
			})
		}
	},
	mute: {
		detector: /(?:mute)/i,
		func: function (matches, tr) {
			this.invoke("mute")
		}
	},
	radio: {
		detector: /(?:radio) (.+)/i,
		func: function (matches, tr) {
			this.invoke("radio", {
				message: matches.slice(1).join(' ')
			})
		}
	},
	playlist: {
		detector: /(?:playlist) (.+)/i,
		func: function (matches, tr) {
			const terms = matches[1]
			logger.log("Playing playlist: " + terms)
			this.invoke('playList', {
				message: terms
			})
		}
	},
	playlists: {
		detector: /(?:playlists)/i,
		func: function (matches, tr) {
			this.invoke('playlists')
		}
	},
	pause: {
		detector: /(?:pause)/i,
		func: function (matches, tr) {
			this.invoke("pause")
		}
	},
	resume: {
		detector: /(?:play)|(?:resume)/i,
		func: function (matches, tr) {
			this.invoke("play")
		}
	},
	search: {
		detector: /(?:(?:search)|(?:find)) (.+)/i,
		func: function (matches, tr) {
			let terms = matches.slice(1).join(' ')
			this.invoke("search", {
				message: terms
			})
		}
	},
	description: {
		detector: /(?:description)/i,
		func: function (matches, tr) {
			this.invoke("description")
		}
	},
	move_forward: {
		detector: /(?:advance)/i,
		func: function (matches, tr) {
			const player = this.space.get('youtube-player')
			player.jumpForward()
		}
	},
	move_backward: {
		detector: /(?:reverse)/i,
		func: function (matches, tr) {
			const player = this.space.get('youtube-player')
			player.jumpBackward()
		}
	},
	history: {
		detector: /(?:history)/i,
		func: function (matches, tr) {
			this.invoke("history")
		}
	},
	hits: {
		detector: /(?:hits)|(?:top)/i,
		func: function (matches, tr) {
			this.invoke("hits")
		}
	},
	trending: {
		detector: /(?:trending)/i,
		func: function (matches, tr) {
			this.invoke("playList", { message: 'trending' })
		}
	},
	related: {
		detector: /(?:related)/i,
		func: function (matches, tr) {
			this.invoke('related')
		}
	},
	news: {
		detector: /(?:news)/i,
		func: function (matches, tr) {
			this.invoke("playList", { message: 'news' })
		}
	},
	afk: {
		detector: /\b(afk|away from keyboard)\b/i,
		func: function (matches, tr) {
			this.invoke('afk')
		}
 	}
}

module.exports = commands
