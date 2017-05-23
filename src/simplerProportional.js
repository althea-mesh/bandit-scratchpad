// @flow
const { plot } = require('plotter')
const _ = require('lodash')
const gaussian = require('gaussian')
const metricMult = 1
/*::
type Route       = {
  destination: string,
  neighbor: string,
  advertisedMetric: number,
  actualMetric: number
}
type Destination = {
  id: string,
  pastUsage: number
}
type Neighbor    = {
  accuracy: {
    [string]: number
  },
  nTrials: number,
  id: string
}
*/

const neighbors/*: { [string]: Neighbor }*/ = {
  A: { id: 'A', nTrials: 0, accuracy: {} },
  B: { id: 'B', nTrials: 0, accuracy: {}  },
  C: { id: 'C', nTrials: 0, accuracy: {}  }
}

const destinations = {
  D: { id: 'D', recentlyUsed: true },
  E: { id: 'E', recentlyUsed: true },
  F: { id: 'F', recentlyUsed: false },
}

const routes = [
  {
    destination: 'D',
    neighbor: 'A',
    advertisedMetric: 12 * metricMult,
    actualMetric: 18 * metricMult
  },
  {
    destination: 'D',
    neighbor: 'B',
    advertisedMetric: 12 * metricMult,
    actualMetric: 20 * metricMult
  },
  {
    destination: 'F',
    neighbor: 'B',
    advertisedMetric: 12 * metricMult,
    actualMetric: 12 * metricMult
  },
]

const accuracyLog = {}
const probabilityLog = {}
const nTrialsLog = {}

const avgValues = obj => {
  const values = _.values(obj)
  return values.reduce((sum, num) => sum + num, 0) / values.length
}

const getAccuracy = actualMetric => gaussian(actualMetric, 0.1).ppf(Math.random())

const drawAndTest = (routes/*: Route[]*/, i) => {
  let route/*: Route*/
  let dest/*: Destination*/
  while (!dest || !route) {
    dest  = _.sample(destinations)
    route = _.sample(routes.filter(r => r.destination === dest.id))
  }

  const neighbor/*: Neighbor*/ = neighbors[route.neighbor]

  const accuracy = Math.min((route.advertisedMetric / getAccuracy(route.actualMetric)), 1)

  if (neighbor.accuracy[dest.id] === undefined) {
    neighbor.accuracy[dest.id] = accuracy
  } else {
    neighbor.accuracy[dest.id] = ((neighbor.accuracy[dest.id]) + accuracy) / 2
  }

  neighbor.nTrials++

  const id = neighbor.id

  accuracyLog[id] = accuracyLog[id] || {}
  accuracyLog[id][i] = avgValues(neighbor.accuracy)

  nTrialsLog[id] = nTrialsLog[id] || {}
  nTrialsLog[id][i] = neighbor.nTrials
}

module.exports = function test () {
  for (let i = 0; i < 1000; i++) {
    if (i === 500) {
      routes[1].actualMetric = 12 * metricMult
    }
    if (i === 750) {
      routes[0].advertisedMetric = 15 * metricMult
    }

    drawAndTest(routes, i)
  }

  plot({
    data: accuracyLog,
    filename: 'accuracyLog.svg',
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
