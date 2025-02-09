export default {
    /**
     * Chuyển độ về radian
     * @param {number} degree 
     * @returns {number}
     */
    toRadian: (degree) => degree * Math.PI / 180,

    /**
     * Chuyển radian về độ
     * @param {number} radian 
     * @returns {number}
     */
    toDegree: (radian) => radian / Math.PI * 180,

    normalizeAngle: (angle) => ((angle % 360) + 360) % 360,
}