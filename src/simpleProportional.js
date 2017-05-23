// @flow
const { select } = require('weighted')
const { plot } = require('plotter')
const gaussian = require('gaussian')
const metricMult = 1
/*::
type Route       = {
  destination: Destination,
  neighbor: Neighbor,
  advertisedMetric: number,
  actualMetric: number
}
type Destination = {
  pastUsage: number
}
type Neighbor    = {
  pastInaccuracy: number,
  nTrials: number,
  id: string
}
*/

const arrToObj = (arr/*: any[]*/)/*: Object*/ => arr.reduce((acc, item, i) => {
  acc[i] = item
  return acc
}, {})

const draw = (probabilities/*: number[]*/) => {
  return Number(select(arrToObj(probabilities)))
}

const getProbabilities = (routes/*: Route[]*/)/*: number[]*/ => routes.map(route => {
  return (route.destination.pastUsage + route.advertisedMetric) - route.neighbor.pastInaccuracy
})

const neighbors = {
  A: { id: 'A', pastInaccuracy: 0, nTrials: 0 },
  B: { id: 'B', pastInaccuracy: 0, nTrials: 0 },
  C: { id: 'C', pastInaccuracy: 0, nTrials: 0 }
}

const destinations = {
  D: { pastUsage: 1 },
  E: { pastUsage: 1 },
  F: { pastUsage: 1 },
}

const routes = [
  {
    destination: destinations['D'],
    neighbor: neighbors['A'],
    advertisedMetric: 12 * metricMult,
    actualMetric: 13 * metricMult
  },
  {
    destination: destinations['D'],
    neighbor: neighbors['B'],
    advertisedMetric: 12 * metricMult,
    actualMetric: 20 * metricMult
  },
]

const inaccuracyLog = {}
const probabilityLog = {}
const nTrialsLog = {}

const drawAndTest = (routes/*: Route[]*/, i) => {
  const probabilities = getProbabilities(routes)
  const route = routes[draw(probabilities)]
  const actualMetric = route.actualMetric
  const inaccuracy = Math.max((actualMetric / route.advertisedMetric), 0)
  route.neighbor.pastInaccuracy = (route.neighbor.pastInaccuracy + inaccuracy) / 2
  route.neighbor.nTrials++

  const id = route.neighbor.id

  inaccuracyLog[id] = inaccuracyLog[id] || {}
  inaccuracyLog[id][i] = route.neighbor.pastInaccuracy

  probabilityLog[id] = probabilityLog[id] || {}
  probabilityLog[id][i] = route.neighbor.nTrials

  nTrialsLog[id] = nTrialsLog[id] || {}
  nTrialsLog[id][i] = route.neighbor.nTrials
}

const forEach = (obj, callback) => {
  Object.keys(obj).forEach((key) => {
    callback(obj[key], key, obj)
  })
}

const map = (obj, callback) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = callback(obj[key], key, obj)
    return acc
  }, {})
}

module.exports = function test () {
  for (let i = 0; i < 100; i++) {
    if (i === 50) {
      routes[1].actualMetric = 12 * metricMult
    }
    drawAndTest(routes, i)
  }

  plot({
    data: inaccuracyLog,
    filename: 'inaccuracyLog.svg',
    format: 'svg',
    style: 'linespoints'
  })

  plot({
    data: nTrialsLog,
    filename: 'nTrialsLog.svg',
    format: 'svg',
    style: 'linespoints'
  })
}
