const ipc = require('electron').ipcRenderer
const fs = require('fs')
const shell =  require('electron').shell
const marked = require('marked')
const highlight = require('highlight.js')
const path = require('path')

marked.setOptions({
	renderer: new marked.Renderer(),
	pedantic: false,
	gfm: true,
	tables: true,
	breaks: true,
	smartypants: true,
	xhtml: true
})

let currentFile = undefined

function loadFile()
{
	var data = fs.readFileSync(currentFile).toString()
	let html = marked(data)
	html = html.replace("<img src='", "<img src='" + currentFile.substr(0, escapePosition(currentFile) + 1)).replace('<img src="', '<img src="' + currentFile.substr(0, escapePosition(currentFile) + 1))
	document.getElementById("container").innerHTML = html
	window.scrollTo(0, 0)
	drawChart()
	highlight.initHighlighting.called = false
	highlight.initHighlighting()
}

ipc.on('selected-file', function(event, arg) {
	currentFile = arg.toString()
	loadFile()
})

ipc.on('selected-folder', function(event, arg) {
	let currentFileTemp = arg.toString() + path.sep + "index.md"
	fs.stat(currentFileTemp, function(err, stat) {
		if(err == null) {
			currentFile = currentFileTemp
			loadFile()
		} else {
			alert("No index.md file found in that folder. Can't load.")
		}
	})
})

function escapePosition(text)
{
	let max = text.lastIndexOf("/")
	let other = text.lastIndexOf("\\")
	if(other > max)
		max = other
	return max
}

$(document).on('click', 'a', function(event) {
	event.preventDefault()
	if(this.href.startsWith('file:'))
	{
		let path_ = currentFile.substr(0, escapePosition(currentFile))
		let href = this.getAttribute("href")
		while(href.indexOf("../") != -1)
		{
			path_ = path_.substr(0, escapePosition(path_))
			href = href.replace("../", "")
		}
		currentFile = path_ + "/" + href
		if(this.getAttribute("href").substr(1).startsWith(":\\") || this.getAttribute("href").substr(1).startsWith(":/") || this.getAttribute("href").startsWith("/"))
			currentFile = this.getAttribute("href")
		// this line is only to grant retro compatibility with my own old software. Not needed for
		// the public. Will be removed as soon as I'll switch from the old to the new software
		currentFile = currentFile.replace("index.html?f=", "").replace("?f=", "")
		loadFile()
	}
	else
	{
		shell.openExternal(this.href)
	}
})

currentFile = __dirname + "/index.md"
loadFile()