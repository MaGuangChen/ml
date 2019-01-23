require('@tensorflow/tfjs-node')
const tf = require('@tensorflow/tfjs')
const loadCSV = require('./load-csv')

const csvSetting = {
    shuffle: true,
    splitTest: 50,
    dataColumns: ['horsepower'],
    labelColumns: ['mpg'], // mgp = miles per gallon
}

let { features, labels, testFeatures, testLabels } = loadCSV('./cars.csv', csvSetting)

console.log(features, labels)
