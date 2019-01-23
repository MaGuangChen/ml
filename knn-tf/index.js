require('@tensorflow/tfjs-node'); // 用 cpu 而不是 gpu
const tf = require('@tensorflow/tfjs');
const loadCSV = require('./load-csv');

// knn : 近鄰算法
/* 
predictionPoint: 測試資料中的某一資料之特徵
mean: 平均數
variance: 變異數
*/
function knn(features, labels, predictionPoint, k) {
    // standarlization 標準化 
    const { mean, variance } = tf.moments(features, 0) // y 軸計算
    const standarDiveation = variance.pow(.5)
    const scaledPreditction = predictionPoint.sub(mean).div(standarDiveation) // (value - mean) / 標準差 
    
    return features
    .sub(mean)
    .div(variance.pow(.5))
    .sub(scaledPreditction) // 透過廣播相減
    .pow(2) // 同乘以 2 次方
    .sum(1) // x 軸 加總
    .pow(0.5) // 開根號
    .expandDims(1)
    .concat(labels, 1)
    .unstack()
    .sort((a, b) => a.get(0) > b.get(0) ? 1 : -1)
    .slice(0, k)
    .reduce((acc, pair) => acc + pair.get(1), 0) / k
}

const setting = {
    shuffle: true, // 是否做洗牌
    splitTest: 10, // test data set 的大小
    dataColumns: ['lat', 'long', 'sqft_lot', 'sqft_living'], // csv 中要返回的 cloumn
    labelColumns: ['price'], // csv 中資料要被作為 label的
};

// 讀取 csv 並分為 test set 和 training set
let { features, labels, testFeatures, testLabels } = loadCSV('kc_house_data.csv', setting)

// 將 array 變為 tensor
features = tf.tensor(features)
labels = tf.tensor(labels)

// 將測試資料作為預測點來進行預測
testFeatures.forEach((testPoint, i) => {
    const result = knn(features, labels, tf.tensor(testPoint), 10)
    const err = (testLabels[i][0] - result) / testLabels[i][0]

    console.log(`第 ${i} 預測結果與實際結果: `, result, testLabels[i][0])
    console.log("誤差百分比: ", err * 100)
})

// const result = knn(features, labels, tf.tensor(testFeatures[0]), 10);
// const err = (testLabels[0][0] - result) / testLabels[0][0]

// console.log('Guess: ', result, testLabels[0][0])
// console.log('Error: ', err)
