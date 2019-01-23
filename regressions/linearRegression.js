const tf = require('@tensorflow/tfjs')
const _ = require('lodash')

// LinearRegression : 梯度下降 類別
class LinearRegression {
    constructor(features, labels, options) {
        this.features = features
        this.labels = labels
        this.options = Object.assign({ learningRate: 0.1, iterations: 1000 }, options)
        this.m = 0
        this.b = 0
    }

    gradientDescent() {
        // 猜測馬力per加侖
        const currentGuessesForMPG = this.features.map(row => {
            return this.m * row[0] + this.b
        })

        // 斜率(坡度) 公式可參考縮圖
        // bSlope: mpg
        // mSlope: hoursePower
        const bSlope = _.sum(currentGuessesForMPG.map((guess, i) => guess - this.labels[i][0])) * 2 / this.features.length
        const mSlope = _.sum(currentGuessesForMPG.map((guess, i) => {
            return -1 * this.features[i][0] * (this.labels[i][0] - guess)
        })) * 2 / this.features.length
    }

    train() {
        for(let i = 0; i < this.iterations; i++) {
            this.gradientDescent();
        }
    }
}

module.exports = LinearRegression;
