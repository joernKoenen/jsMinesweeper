var canvas = document.getElementById('drawer')
var ctx = canvas.getContext('2d')
var column
var row
var scale
var field
var view
var time = 0
var playing = false
var bombsleft
var revealleft
var bombs
var flagImg = new Image()
flagImg.src = 'img/flag.png'
var bombImg = new Image()
bombImg.src = 'img/bomb.png'

function start() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // get settings
  column = document.getElementById('column').value
  row = document.getElementById('row').value
  bombs = document.getElementById('bombs').value
  scale = document.getElementById('scale').value
  // size the canvas
  canvas.width = column * scale
  canvas.height = row * scale
  // change text
  ctx.font = scale / 2 + 'px Roboto'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // check if too many bombs
  if (bombs > (column * row)) bombs = column * row

  // paint the canvas gray
  ctx.fillStyle = 'silver'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // draw tables
  // top to bottom
  ctx.fillStyle = 'black'
  for (var i = 0; i <= column; i++) {
    ctx.beginPath()
    ctx.moveTo(i * scale, 0)
    ctx.lineTo(i * scale, row * scale)
    ctx.stroke()
  }
  // left to right
  for (var i = 0; i <= row; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * scale)
    ctx.lineTo(column * scale, i * scale)
    ctx.stroke()
  }

  // create 2d arrays
  view = new Array(column)
  field = new Array(column)
  for (i = 0; i < column; i++) {
    field[i] = new Array(row)
    view[i] = new Array(row)
  }

  // set value 0 for arrays
  for (var i = 0; i < column; i++) {
    for (var i2 = 0; i2 < row; i2++) {
      field[i][i2] = 0
      view[i][i2] = 0
    }
  }

  // generate bombs
  for (var i = 0; i < bombs; i++) {
    var bombX = Math.floor((Math.random() * column))
    var bombY = Math.floor((Math.random() * row))

    // check if field already is a bomb
    if (field[bombX][bombY] === 9) i--
    else {
      field[bombX][bombY] = 9
      // generate the numbers around the bomb
      for (var ix = -1; ix <= 1; ix++) {
        for (var iy = -1; iy <= 1; iy++) {
          if ((ix !== 0 || iy !== 0) && field[bombX + ix] !== undefined && field[bombX + ix][bombY + iy] !== undefined && field[bombX + ix][bombY + iy] !== 9) {
            field[bombX + ix][bombY + iy] += 1
          }
        }
      }
    }
  }

  // set settings
  time = 0
  revealleft = row * column - bombs
  playing = true
  bombsleft = bombs
  document.getElementById('currentBombs').innerHTML = bombsleft
}

function clickOnTile(ev) {
  if (playing) {
    // calculate which field got clicked
    var clickY = Math.floor((ev.clientY - canvas.offsetTop) / scale)
    var clickX = Math.floor((ev.clientX - canvas.offsetLeft) / scale)

    if (field[clickX] !== undefined && field[clickX][clickY] !== undefined) {
      // check if the field got clicked before
      if (view[clickX][clickY] === 0) {
        reveal(clickX, clickY)
      } else if (view[clickX][clickY] === 2) {
        // clear field
        ctx.clearRect(clickX * scale + 1, clickY * scale + 1, scale - 2, scale - 2)
        ctx.fillStyle = 'silver'
        ctx.fillRect(clickX * scale + 1, clickY * scale + 1, scale - 2, scale - 2)
        view[clickX][clickY] = 0
        bombsleft++
        document.getElementById('currentBombs').innerHTML = bombsleft
      }
    }
    checkwin()
  }
}

function reveal(x, y) {
  if (field[x][y] !== 9) {
    view[x][y] = 1
    revealleft--
    // draw number
    switch (field[x][y]) {
      case 0:
        ctx.clearRect(x * scale + 1, y * scale + 1, scale - 2, scale - 2)
        revealZeros(x, y)
        break
      case 1:
        ctx.fillStyle = 'blue'
        ctx.clearRect(x * scale + 1, y * scale + 1, scale - 2, scale - 2)
        ctx.fillText(field[x][y], x * scale + scale / 2, y * scale + scale / 2)
        break
      case 2:
        ctx.fillStyle = 'green'
        ctx.clearRect(x * scale + 1, y * scale + 1, scale - 2, scale - 2)
        ctx.fillText(field[x][y], x * scale + scale / 2, y * scale + scale / 2)
        break
      default:
        ctx.fillStyle = 'red'
        ctx.clearRect(x * scale + 1, y * scale + 1, scale - 2, scale - 2)
        ctx.fillText(field[x][y], x * scale + scale / 2, y * scale + scale / 2)
        break
    }
  } else {
    // Game over screen
    ctx.fillStyle = 'red'
    for (var i = 0; i < column; i++) {
      for (var i2 = 0; i2 < row; i2++) {
        if (field[i][i2] === 9) {
          ctx.clearRect(i * scale + 1, i2 * scale + 1, scale - 2, scale - 2)
          ctx.drawImage(bombImg, i * scale + 1, i2 * scale + 1, scale - 2, scale - 2)
        }
      }
    }
    ctx.clearRect(x * scale + 1, y * scale + 1, scale - 2, scale - 2)
    ctx.fillRect(x * scale + 1, y * scale + 1, scale - 2, scale - 2)
    ctx.drawImage(bombImg, x * scale + 1, y * scale + 1, scale - 2, scale - 2)
    ctx.font = scale * 1.5 + 'px Roboto'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    playing = false
  }
}

function revealZeros(x, y) {
  // check field around x, y
  for (var ix = -1; ix <= 1; ix++) {
    for (var iy = -1; iy <= 1; iy++) {
      if ((ix !== 0 || iy !== 0) && field[x + ix] !== undefined && field[x + ix][y + iy] !== undefined && view[x + ix][y + iy] === 0) {
        reveal(x + ix, y + iy)
      }
    }
  }
}

function rightlickOnTile(ev) {
  ev.preventDefault()
  if (playing) {
    // calculate which field got clicked
    var clickY = Math.floor((ev.clientY - canvas.offsetTop) / scale)
    var clickX = Math.floor((ev.clientX - canvas.offsetLeft) / scale)

    if (field[clickX] !== undefined && field[clickX][clickY] !== undefined) {
      // check if the field got clicked before
      if (view[clickX][clickY] === 0) {
        // draw flag
        ctx.drawImage(flagImg, clickX * scale + 1, clickY * scale + 1, scale - 2, scale - 2)
        view[clickX][clickY] = 2
        bombsleft--
        document.getElementById('currentBombs').innerHTML = bombsleft
      } else if (view[clickX][clickY] === 2) {
        // clear field
        ctx.clearRect(clickX * scale + 1, clickY * scale + 1, scale - 2, scale - 2)
        ctx.fillStyle = 'silver'
        ctx.fillRect(clickX * scale + 1, clickY * scale + 1, scale - 2, scale - 2)
        view[clickX][clickY] = 0
        bombsleft++
        document.getElementById('currentBombs').innerHTML = bombsleft
      }
    }
    checkwin()
  }
  return false
}

function doubleClickOnTile(ev) {
  if (playing) {
    // calculate which field got clicked
    var clickY = Math.floor((ev.clientY - canvas.offsetTop) / scale)
    var clickX = Math.floor((ev.clientX - canvas.offsetLeft) / scale)

    if (field[clickX] !== undefined && field[clickX][clickY] !== undefined) {
      // check if the field got clicked before
      if (view[clickX][clickY] === 1) {
        for (var ix = -1; ix <= 1; ix++) {
          for (var iy = -1; iy <= 1; iy++) {
            if ((ix !== 0 || iy !== 0) && field[clickX + ix] !== undefined && field[clickX + ix][clickY + iy] !== undefined && view[clickX + ix][clickY + iy] === 0) {
              reveal(clickX + ix, clickY + iy)
            }
          }
        }
      }
    }
    checkwin()
  }
}

function checkwin() {
  if (revealleft <= 0 && bombsleft === 0) {
    ctx.fillStyle = 'green'
    ctx.font = scale * 2 + 'px Roboto'
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - canvas.height / 10)
    ctx.fillText('Time: ' + time + 's', canvas.width / 2, canvas.height / 2 + canvas.height / 10)
    playing = false
  }
}

window.setInterval(function() {
  if (playing) {
    time++
    document.getElementById('time').innerHTML = time
  }
}, 1000)

canvas.addEventListener('click', clickOnTile, false)
canvas.addEventListener('contextmenu', rightlickOnTile, false)
canvas.addEventListener('dblclick', doubleClickOnTile, false)
