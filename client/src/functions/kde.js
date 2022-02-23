import * as d3 from 'd3'
// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            if (V.length != 0){
                return [x, d3.mean(V, function (v) { return kernel(x - v); })];
            }else{
                return [x, 0]
            }
        });
    };
}
function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

export {kernelDensityEstimator, kernelEpanechnikov}