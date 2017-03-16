class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y)
  }
}

class Grid {
  constructor(width, height) {
    this.space = new Array(width * height)
    this.width = width
    this.height = height
  }

  isInside(vector) {
    return (
      0 <= vector.x && vector.x < this.width &&
      0 <= vector.y && vector.y < this.height
    )
  }

  get(vector) {
    return this.space[vector.y * this.width + vector.x]
  }

  set(vector, value) {
    this.space[vector.y * this.width + vector.x] = value
  }

  forEach(f, context) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const value = this.get(new Vector(x, y))
        if (value != null) {
          f.call(context, value, new Vector(x, y))
        }
      }
    }
  }
}

const directions = {
  n: new Vector(0, -1),
  ne: new Vector(1, -1),
  e: new Vector(1, 0),
  se: new Vector(1, 1),
  s: new Vector(0, 1),
  sw: new Vector(-1, 1),
  w: new Vector(-1, 0),
  nw: new Vector(-1, -1)
}

const directionNames = Object.keys(directions)

const randomElement = array => array[Math.floor(Math.random() * array.length)]

const elementFromChar = (legend, ch) => {
  if (ch === ' ') {
    return null
  }
  const element = new legend[ch]()
  element.originalChar = ch
  return element
}

const charFromElement = (element) => {
  if (element === null) {
    return ' '
  } else {
    return element.originalChar
  }
}

class BouncingCritter {
  constructor() {
    this.direction = randomElement(directionNames)
  }

  act(view) {
    if (view.look(this.direction) !== ' ') {
      this.direction = view.find(' ') || 's'
    }
    return {type: 'move', direction: this.direction}
  }
}

class World {
  constructor(map, legend) {
    const grid = new Grid(map[0].length, map.length)
    this.grid = grid
    this.legend = legend

    map.forEach((line, y) => {
      for (var x = 0; x < line.length; x++) {
        grid.set(new Vector(x, y), elementFromChar(legend, line[x]))
      }
    })
  }

  turn() {
    const acted = []
    this.grid.forEach((critter, vector) => {
      if (critter.act && !acted.includes(critter)) {
        acted.push(critter)
        this.letAct(critter, vector)
      }
    }, this)
  }

  letAct(critter, vector) {
    const action = critter.act(new View(this, vector))
    if (action && action.type === 'move') {
      const dest = this.checkDestination(action, vector)
      if (dest && this.grid.get(dest) == null) {
        this.grid.set(vector, null)
        this.grid.set(dest, critter)
      }
    }
  }

  checkDestination(action, vector) {
    if (directions.hasOwnProperty(action.direction)) {
      const dest = vector.plus(directions[action.direction])
      if (this.grid.isInside(dest)) {
        return dest
      }
    }
  }

  toString() {
    let output = ''
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const element = this.grid.get(new Vector(x, y))
        output += charFromElement(element)
      }
      output += '\n'
    }
    return output
  }
}

class View {
  constructor(world, vector) {
    this.world = world
    this.vector = vector
  }

  look(dir) {
    const target = this.vector.plus(directions[dir])
    if (this.world.grid.isInside(target)) {
      return charFromElement(this.world.grid.get(target))
    } else {
      return '#'
    }
  }

  findAll(ch) {
    const found = []
    for (const dir in directions) {
      if (this.look(dir) === ch) {
        found.push(dir)
      }
    }
    return found
  }

  find(ch) {
    const found = this.findAll(ch)
    if (found.length === 0) {
      return null
    } else {
      return randomElement(found);
    }
  }
}

class Wall {}

const plan =
`############################
#      #    #      o      ##
#                          #
#          #####           #
##         #   #    ##     #
###           ##     #     #
#o          ###      #     #
#   ####                   #
#   ##                     #
#    #                 ### #
#    #            o     o  #
############################`.split('\n')

const world = new World(plan, {'#': Wall, 'o': BouncingCritter})

document.querySelector('#play-button').addEventListener('click', () => {
  playing = !playing
  document.querySelector('#play-button').textContent = playing ? 'Pause' : 'Play'
})
let playing = true
setInterval(() => {
  if (playing) {
    world.turn()
    document.querySelector('#root').textContent = world.toString()
  }
}, 500)
