const { app, BrowserWindow, Menu, MenuItem, dialog } = require('electron')
const path = require('path')
const url = require('url')
const ipc = require('electron').ipcMain

let win

function createWindow()
{
	win = new BrowserWindow({width: 900, height: 900 / 16 * 9, icon:"icon.ico"})

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'src/index.html'),
		protocol: 'file:',
		slashes: true
	}))

	// win.openDevTools()

	win.on('closed', () => {
		win = null
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if(process.platform !== 'darwin')
		app.quit()
})

app.on('activate', () => {
	if(win == null)
		createWindow()
})

let submenu = [
{
	label: 'Open',
	accelerator: 'CmdOrCtrl+O',
	role: 'openfile',
	click() {
		dialog.showOpenDialog({
			filters: [{
				name: 'Markdown',
				extensions: ['md']
			}],
			properties: ['openFile']
		}, (files) => {
			if(files)
				win.webContents.send('selected-file', files)
		})
	}
},
{
	label: 'Open Folder',
	accelerator: 'CmdOrCtrl+Shift+O',
	role: 'openfolder',
	click() {
		dialog.showOpenDialog({
			properties: ['openDirectory']
		}, (files) => {
			if(files)
				win.webContents.send('selected-folder', files)
		})
	}
}]

let mainMenu = submenu.slice()
mainMenu.push({type: 'separator'})
mainMenu.push({
	label: 'Home',
	click() {
		win.loadURL(url.format({
			pathname: path.join(__dirname, 'src/index.html'),
			protocol: 'file:',
			slashes: true
		}))
	}
})

app.on('ready', () => {
	Menu.setApplicationMenu(Menu.buildFromTemplate([
	{
		label: 'File',
		submenu: mainMenu
	},
	{
		label: 'Debug',
		submenu: [{
			label: 'DevTools',
			click() {
				win.openDevTools()
			}
		}]
	}]))
})

app.on('browser-window-created', (event, win) => {
	win.webContents.on('context-menu', (e, params) => {
		menu.popup(win, params.x, params.y)
	})
})

const menu = new Menu()
for(let i = 0; i < submenu.length; i++)
	menu.append(new MenuItem(submenu[i]))