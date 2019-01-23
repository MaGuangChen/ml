// outputs: 資料落點 each row 為 [投放點, 彈性, 大小, 落點], k: 近鄰算法的 k 值
const outputs = [];

// onScoreUpdate : 將輸入存入陣列中
function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  var everyRow = [dropPosition, bounciness, size, bucketLabel]
  outputs.push(everyRow)
}

// runAnalysis : 根據資料輸入進行選取並分析
/*
accuracy 計算流程
1. filter => 利用 knn 找出 k 個與 測試資料feature 內積最小的 訓練資料 並得到這些資料最常見的落點, 若最常見的落點 === 測試資料的實際落點則 return
2. size => 計算出上一步最後留下的資料長度
3. divide => 最常見的落點 === 測試資料的實際落點 / testSetSize

feature 包含 投放點, 彈性, 大小 
label 則是 最終落點 bucket
*/
function runAnalysis() {
  const testSetSize = 50
  const k = 10
  _.range(0, 3).forEach(feature => {
    // feature === 0 ~ 2
    const data = _.map(outputs, row => [row[feature], _.last(row)]) // 資料為 [feature, label]
    const [testSet, trainingSet] = splitDataset(minMax(data, 1), testSetSize) // 將資料分為 測試資料 與 訓練資料
    const accuracy = _.chain(testSet)
    .filter(testCollect => knn(trainingSet, _.initial(testCollect), k) === _.last(testCollect))
    .size()
    .divide(testSetSize)
    .value()
  
  console.log(`當 feature 為 陣列中第 ${feature} 個元素時 Accuracy(準確性) 為 ${accuracy}`)
  })
}

// distance : 計算內積
/*
zip: 將資料轉為 [pointA[0], pointB[0]], [pointA[1], pointB[1]] .... 依此類推直到最後一元素
sum: 總和 
** 2 為 平方, ** 0.5 為開根號
*/
function distance(pointA, pointB) {
  return _.chain(pointA)
          .zip(pointB)
          .map(([a, b]) => (a - b) ** 2)
          .sum()
          .value() ** 0.5;
}

// knn : k近鄰算法
/* 處理資料流程:
以下是資料轉變過程
1. map => 將 data 轉為 [三維矩陣中 testSet 與 trainingSet 之內積, bucket]
2. sortBy => 根據 投放點距離 三維矩陣中 testSet 與 trainingSet 之距離 之值 進行 排序
3. slice => 抓出 k 個 與 三維矩陣中 testSet 與 trainingSet 之內積 最小的 array
4. countBy => 計算 bucket 出現次數, 完成後資料型態為 { 'bucket': 出現次數 }
5. toPairs => 將 { 'bucket': 出現次數 } 轉為 ['bucket', 次數]
6. sortBy => 根據出現次數多寡進行排序, 由小至大
7. last => 取出現次數最多的陣列
8. first => 將出現次數最多的陣列之 bucket 取出
9. parseInt => 將 bucket 轉為 int
10. value => 取值
*/
function knn(data, feature, k) {
  // feature has 3 values
  return _.chain(data)
  .map(row => [distance(_.initial(row), feature), _.last(row)])
  .sortBy(row => row[0])
  .slice(0, k)
  .countBy(row => row[1])
  .toPairs()
  .sortBy(row => row[1])
  .last()
  .first()
  .parseInt()
  .value();
}

var obj = {a: 1, b: 2}
for(let xx in obj) {
  console.log(xx)
}

// splitDataset : 將 dataset 分為 test set 及 training set
/* @parms 
data: 所有data
testSetSize: 代表多少個隨機的 point
shuffled: 將 data 隨機排序並返回
testSet: 取 testSetSize 筆隨機排序之資料出來
trainingSet: 取出 testSet 後剩下的 隨機排序之 data
*/
function splitDataset(data, testSetSize) {
  const shuffled = _.shuffle(data)
  const testSet = _.slice(shuffled, 0, testSetSize)
  const trainingSet = _.slice(shuffled, testSetSize)
  
  return [testSet, trainingSet];
}

// minMax: 將 feature 依照比例與重要程度進行數值換算
/*
column: 要判斷的 feature value
*/
function minMax(data, featureCount) {
  const clonedData = _.cloneDeep(data)

  for(let i = 0; i < featureCount; i++) {
    const column = clonedData.map(row => row[i])
    const max = _.max(column)
    const min = _.min(column)

    // 計算 feature value 為 資料區間的多少百分比
    for(let j = 0; j < clonedData.length; j++) {
      clonedData[j][i] = (clonedData[j][i] - min) / (max - min)
    }
  }

  return clonedData;
}
