// @flow
/* ::

type Arm = {
  reward: number,
  trials: Trial[],
  n: number
}

type Trial = {
  reward: number,
  probability: number
}

*/
const { select } = require('weighted')
const { plot } = require('plotter')

const log = []

const sum = (arr) => arr.reduce((acc, item) => acc + item, 0)

const arrToObj = arr => arr.reduce((acc, item, i) => {
  acc[i] = item
  return acc
}, {})

const getWeight = (
  gamma/* : number */,
  trials/* : Trial[] */,
  K/* : number */
)/* : number */ => trials.reduce((weight, trial) => {
  const estReward = trial.reward / trial.probability
  return weight * Math.exp(gamma * (estReward / K))
}, 1)

const getProbabilities = (
  weights/* : number[] */
)/* : number[] */ => {
  const summedWeights = sum(weights)
  return weights.map((weight, i, weights) =>
    ((1.0 - gamma) * (weight / summedWeights) + (gamma / weights.length))
  )
}

function chooseArm (
  gamma/* : number */,
  arms/* : Arm[] */
)/* : { arm: Arm, probability: number } */ {
  const K = arms.length
  const weights = arms.map(arm => getWeight(gamma, arm.trials, K))
  const probabilities = getProbabilities(weights)
  log.push(probabilities)
  const i = Number(select(arrToObj(probabilities)))

  return { arm: arms[i], probability: probabilities[i] }
}

function updateArm (
  window/* : number */,
  arm/* : Arm */,
  trial/* : Trial */
) {
  arm.trials.push(trial)
  if (arm.trials.length > window) {
    arm.trials.shift()
  }
}

const arms = [
  { reward: 0.9, trials: [], n: 0 },
  { reward: 0.9, trials: [], n: 0 },
  { reward: 0.9, trials: [], n: 0 },
  { reward: 0.9, trials: [], n: 0 },
  { reward: 0.9, trials: [], n: 0 },
  { reward: 0.9, trials: [], n: 0 }
]

const gamma = 0.1
const window = 16

for (let i = 0; i < 1000; i++) {
  if (i === 500) {
    arms[0].reward = 0.8
  }
  if (i === 750) {
    arms.push({ reward: 0.5, trials: [], n: 0 })
  }
  const { arm, probability } = chooseArm(gamma, arms)
  const reward = arm.reward
  arm.n++
  updateArm(window, arm, { reward, probability })
}

const data = log.reduce((acc, row) => {
  row.forEach((item, i) => {
    if (!acc[i]) { acc[i] = [] }
    acc[i].push(item)
  })
  return acc
}, {})

plot({
  data,
  filename: 'output.svg',
  format: 'svg'
})


