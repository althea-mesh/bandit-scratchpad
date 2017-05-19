//      

            
              
                  
           
 

              
                 
                     
 

const { select } = require('weighted')
const { plot } = require('plotter')
const gaussian = require('gaussian')

const log = []

const sum = (arr) => arr.reduce((acc, item) => acc + item, 0)

const arrToObj = arr => arr.reduce((acc, item, i) => {
  acc[i] = item
  return acc
}, {})

const getWeight = (
  gamma        ,
  trials         ,
  K        
)         => trials.reduce((weight, trial) => {
  const estReward = trial.reward / trial.probability
  return weight * Math.exp(gamma * (estReward / K))
}, 1)

const getProbabilities = (
  weights          
)           => {
  const summedWeights = sum(weights)
  return weights.map((weight, i, weights) =>
    ((1.0 - gamma) * (weight / summedWeights) + (gamma / weights.length))
  )
}

function chooseArm (
  gamma        ,
  arms       
)                                    {
  const K = arms.length
  const weights = arms.map(arm => getWeight(gamma, arm.trials, K))
  const probabilities = getProbabilities(weights)
  log.push(probabilities.map(p => p * K))
  // log.push(weights)
  const i = Number(select(arrToObj(probabilities)))

  return { arm: arms[i], probability: probabilities[i] }
}

function updateArm (
  window        ,
  arm     ,
  trial       
) {
  arm.trials.push(trial)
  if (arm.trials.length > window) {
    arm.trials.shift()
  }
}

const arms = [
  { reward: gaussian(0.9, 0.1), trials: [], n: 0 },
  { reward: gaussian(0.9, 0.1), trials: [], n: 0 },
  { reward: gaussian(0.9, 0.1), trials: [], n: 0 }
]

const gamma = 0.01
const window = 16

for (let i = 0; i < 1000; i++) {
  if (i === 250) {
    arms.push({ reward: gaussian(0.5, 0.1), trials: [], n: 0 })
    arms.push({ reward: gaussian(0.9, 0.1), trials: [], n: 0 })
    arms.push({ reward: gaussian(0.9, 0.1), trials: [], n: 0 })
    arms.push({ reward: gaussian(0.9, 0.1), trials: [], n: 0 })
  }
  if (i === 500) {
    arms[0].reward = gaussian(0.8, 0.1)
  }
  if (i === 650) {
    arms[1].reward = gaussian(0, 0.1)
    arms[2].reward = gaussian(0, 0.1)
  }
  if (i === 800) {
    arms[1].reward = gaussian(0.9, 0.1)
  }
  const { arm, probability } = chooseArm(gamma, arms)
  const reward = Math.max(0, arm.reward.ppf(Math.random()))
  updateArm(window, arm, { reward, probability })
}

const data = log.reduce((acc, row, i) => {
  row.forEach((item, j) => {
    if (!acc[j]) { acc[j] = {} }
    acc[j][i] = item
  })
  return acc
}, {})

plot({
  data,
  filename: 'output.svg',
  format: 'svg'
})


