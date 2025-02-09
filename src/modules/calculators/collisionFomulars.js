export default {
    /**
     * Kiểm tra va chạm giữa hình tròn với hình chữ nhật (có xoay)
     * @param {*} circle 
     * @param {*} rect 
     * @returns {Boolean}
     */
    isCircleAndRolatedRectangleCollision(circle, rect) {
        // Tính toán các đỉnh của hình chữ nhật xoay
        const cosAngle = Math.cos(rect.angle);
        const sinAngle = Math.sin(rect.angle);

        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;

        const rectCorners = [
            { x: rect.x + halfWidth * cosAngle - halfHeight * sinAngle, 
                y: rect.y + halfWidth * sinAngle + halfHeight * cosAngle },
            { x: rect.x - halfWidth * cosAngle - halfHeight * sinAngle, 
                y: rect.y - halfWidth * sinAngle + halfHeight * cosAngle },
            { x: rect.x - halfWidth * cosAngle + halfHeight * sinAngle, 
                y: rect.y - halfWidth * sinAngle - halfHeight * cosAngle },
            { x: rect.x + halfWidth * cosAngle + halfHeight * sinAngle, 
                y: rect.y + halfWidth * sinAngle - halfHeight * cosAngle }
        ];

        // Kiểm tra nếu các đỉnh của hình chữ nhật nằm trong hình tròn
        for (const corner of rectCorners) {
            const dx = corner.x - circle.x;
            const dy = corner.y - circle.y;
            if (dx * dx + dy * dy <= circle.radius * circle.radius) {
                return true;
            }
        }

        // Kiểm tra nếu tâm của hình tròn nằm trong hình chữ nhật xoay
        // Chuyển đổi tâm của hình tròn vào hệ tọa độ của hình chữ nhật không xoay
        const unrotatedCircleX = cosAngle * (circle.x - rect.x) + sinAngle * (circle.y - rect.y) + rect.x;
        const unrotatedCircleY = cosAngle * (circle.y - rect.y) - sinAngle * (circle.x - rect.x) + rect.y;

        // Kiểm tra nếu tâm của hình tròn nằm trong các cạnh của hình chữ nhật không xoay
        const closestX = Math.max(rect.x - halfWidth, Math.min(unrotatedCircleX, rect.x + halfWidth));
        const closestY = Math.max(rect.y - halfHeight, Math.min(unrotatedCircleY, rect.y + halfHeight));

        const distanceX = unrotatedCircleX - closestX;
        const distanceY = unrotatedCircleY - closestY;

        return (distanceX * distanceX + distanceY * distanceY) <= (circle.radius * circle.radius);
    },

    /**
     * Kiểm tra va chạm giữa hình chữ nhật xoay và hình tròn
     * @param {RotableRectangle} rect - Hình chữ nhật xoay
     * @param {Circle} circle - Hình tròn (đạn)
     * @returns {boolean} - true nếu có va chạm, false nếu không
     */
    checkRotableRectangleCircleCollision(circle, rect) {
        // Chuyển đổi vị trí hình tròn sang hệ tọa độ của hình chữ nhật sau khi xoay
        const cosAngle = Math.cos(-rect.angle);
        const sinAngle = Math.sin(-rect.angle);

        // Đổi tọa độ của hình tròn theo góc xoay của hình chữ nhật
        const relativeCircleX = cosAngle * (circle.x - rect.x) - sinAngle * (circle.y - rect.y) + rect.x;
        const relativeCircleY = sinAngle * (circle.x - rect.x) + cosAngle * (circle.y - rect.y) + rect.y;

        // Tính khoảng cách từ tâm hình tròn đến các cạnh của hình chữ nhật sau khi xoay
        const deltaX = relativeCircleX - Math.max(rect.x - rect.width / 2, Math.min(relativeCircleX, rect.x + rect.width / 2));
        const deltaY = relativeCircleY - Math.max(rect.y - rect.height / 2, Math.min(relativeCircleY, rect.y + rect.height / 2));
        
        return (deltaX * deltaX + deltaY * deltaY) < (circle.radius * circle.radius);
    },


    /**
     * Kiểm tra va chạm giữa hình chữ nhật với hình chữ nhật (có xoay)
     * @param {*} rolatedRectangle 
     * @param {*} rectangle 
     * @returns {Boolean}
     */
    isRectangleAndRolatedRectangleCollision(rolatedRectangle, rectangle) {
        const cosAngle = Math.cos(rolatedRectangle.angle);
        const sinAngle = Math.sin(rolatedRectangle.angle);

        const halfWidth = rolatedRectangle.width / 2;
        const halfHeight = rolatedRectangle.height / 2;

        const rolatedRectangleCorners = [
            { x: rolatedRectangle.x + halfWidth * cosAngle - halfHeight * sinAngle, y: rolatedRectangle.y + halfWidth * sinAngle + halfHeight * cosAngle },
            { x: rolatedRectangle.x - halfWidth * cosAngle - halfHeight * sinAngle, y: rolatedRectangle.y - halfWidth * sinAngle + halfHeight * cosAngle },
            { x: rolatedRectangle.x - halfWidth * cosAngle + halfHeight * sinAngle, y: rolatedRectangle.y - halfWidth * sinAngle - halfHeight * cosAngle },
            { x: rolatedRectangle.x + halfWidth * cosAngle + halfHeight * sinAngle, y: rolatedRectangle.y + halfWidth * sinAngle - halfHeight * cosAngle }
        ];

        // Check if any of the rolatedRectangle's corners are inside the rectangle
        for (const corner of rolatedRectangleCorners) {
            if (corner.x >= rectangle.x && corner.x <= rectangle.x + rectangle.width &&
                corner.y >= rectangle.y && corner.y <= rectangle.y + rectangle.height) {
                return true;
            }
        }

        // Calculate rectangle corners
        const rectangleCorners = [
            { x: rectangle.x, y: rectangle.y },
            { x: rectangle.x + rectangle.width, y: rectangle.y },
            { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
            { x: rectangle.x, y: rectangle.y + rectangle.height }
        ];

        // Check if any of the rectangle's corners are inside the rolatedRectangle's bounds
        for (const corner of rectangleCorners) {
            const transformedX = cosAngle * (corner.x - rolatedRectangle.x) + sinAngle * (corner.y - rolatedRectangle.y) + rolatedRectangle.x;
            const transformedY = -sinAngle * (corner.x - rolatedRectangle.x) + cosAngle * (corner.y - rolatedRectangle.y) + rolatedRectangle.y;

            if (transformedX >= rolatedRectangle.x - halfWidth && transformedX <= rolatedRectangle.x + halfWidth &&
                transformedY >= rolatedRectangle.y - halfHeight && transformedY <= rolatedRectangle.y + halfHeight) {
                return true;
            }
        }

        return false;
    }
}