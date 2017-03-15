Array.randomElement = array => array[Math.floor(Math.random() * array.length)]

const Vector = {
  plus: (a, b) => ({x: a.x + b.x, y: a.y + b.y}),
  around: vector => Object.values(directions).map(dir => Vector.plus(dir, vector)),
}

const Grid = {
  isInside: ({x, y}, grid) => 0 <= x && x < grid[0].length && 0 <= y && y < grid.length,
  forEach: (grid, f) => {
    grid.forEach((row, y) => {
      row.forEach((value, x) => f(value, {x, y}))
    })
  },
  update: (behaviors, grid) => {
    const acted = grid.map(row => row.map(value => false))
    Grid.forEach(grid, (monster, {x, y}) => {
      if (!acted[y][x]) {
        const actedXY = behaviors[monster]({x, y}, grid)
        if (actedXY && typeof actedXY.y === 'number' && typeof actedXY.x === 'number') {
          acted[actedXY.y][actedXY.x] = true
        }
      } 
    })
    return grid
  },
  toString: grid => {
    let output = ''
    const width = grid[0].length
    const height = grid.length
    Grid.forEach(grid, (monster, {x, y}) => {
      output += monster + (x + 1 === width ? '\n' : '')
    })
    return output
  }
}

const monsters = {
  bouncer: 'o',
  wall: '#',
  empty: ' ',
}

const behaviors = {
  [monsters.bouncer]: ({x, y}, grid) => {
    const possibleVectors = Vector.around({x, y})
      .filter(({x, y}) => Grid.isInside({x, y}, grid) && grid[y][x] === ' ')
    const chosen = Array.randomElement(possibleVectors) || {x, y}
    grid[chosen.y][chosen.x] = monsters.bouncer
    grid[y][x] = monsters.empty
    return chosen
  },
  [monsters.wall]: () => {},
  [monsters.empty]: () => {},
}

const directions = {
  n: {x: 0, y: -1},
  ne: {x: 1, y: -1},
  e: {x: 1, y: 0},
  se: {x: 1, y: 1},
  s: {x: 0, y: 1},
  sw: {x: -1, y: 1},
  w: {x: -1, y: 0},
  nw: {x: -1, y: -1}
}

let grid =
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
############################`
  .split('\n')
  .map(row => row.split(''))

for (let i = 0; i < 5; i++) {
  grid = Grid.update(behaviors, grid)
  console.log(Grid.toString(grid))
}
