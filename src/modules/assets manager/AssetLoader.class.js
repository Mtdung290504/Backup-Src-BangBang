import AssetLoadingInterface from "./AssetLoadingInterface.class.js";

export default class AssetLoader {
    /**
     * @param {AssetLoadingInterface} assetLoadingInterface 
     */
    constructor(assetLoadingInterface) {
        this.assetLoadingInterface = assetLoadingInterface;
    }

    #assets = {
        images: {},
        json: {},
    };
    #totalAssets = 0;
    #loadedAssets = 0;
    #onAllAssetsLoaded = undefined;

    /**
     * Thêm ảnh cần thiết vào assets
     * @param {string} name - Tên dùng để lấy ảnh từ hàm getImage
     * @param {string} src - Đường dẫn đến ảnh
     */
    loadImage(name, src) {
        this.#totalAssets++;
        this.assetLoadingInterface.setAssetsLimitCount(this.#totalAssets);

        const img = new Image();
        img.src = src;
        img.onload = () => this.#onImageAssetLoaded(name, img);
    }

    /**
     * Thêm file JSON cần thiết vào assets
     * @param {string} name - Tên dùng để lấy JSON từ hàm getJson
     * @param {string} src - Đường dẫn đến file JSON
     */
    loadJson(name, src) {
        this.#totalAssets++;
        this.assetLoadingInterface.setAssetsLimitCount(this.#totalAssets);

        fetch(src)
            .then(response => response.json())
            .then(data => this.#onJsonAssetLoaded(name, data))
            .catch(error => console.error(`Lỗi tải JSON từ ${src}:`, error));
    }

    /**
     * Hàm kích hoạt sau khi tải xong 1 tài nguyên ảnh
     * @param {string} name - Tên tài nguyên ảnh
     * @param {HTMLImageElement} img - Đối tượng hình ảnh đã được tải
     */
    #onImageAssetLoaded(name, img) {
        if(this.#assets.images[name]) {
            console.warn(`Hình ảnh với tên "${name}" đã được thêm vào từ trước. Bạn thêm lại sẽ ghi đè lên nó.`);
        }

        this.#assets.images[name] = img;
        this.#assetLoaded(name);
    }

    /**
     * Hàm kích hoạt sau khi tải xong 1 tài nguyên JSON
     * @param {string} name - Tên tài nguyên JSON
     * @param {Object} data - Dữ liệu JSON đã được parse
     */
    #onJsonAssetLoaded(name, data) {
        if(this.#assets.json[name]) {
            console.warn(`JSON với tên "${name}" đã được thêm vào từ trước. Bạn thêm lại sẽ ghi đè lên nó.`);
        }

        this.#assets.json[name] = data;
        this.#assetLoaded(name);
    }

    /**
     * Xử lý khi 1 tài nguyên bất kỳ được tải xong
     * @param {string} name - Tên tài nguyên
     */
    #assetLoaded(name) {
        this.#loadedAssets++;
        this.assetLoadingInterface.setLoadedAssetsText(name);
        this.assetLoadingInterface.setAssetsLoadedCount(this.#loadedAssets);

        if(this.#loadedAssets === this.#totalAssets && this.#onAllAssetsLoaded) {
            this.#onAllAssetsLoaded();
        }
    }

    /**
     * Lấy ảnh từ kho tài nguyên theo tên đã đặt
     * @param {string} name 
     * @returns {HTMLImageElement | undefined}
     */
    getImage(name) {
        const result = this.#assets.images[name];

        if(!result) {
            console.warn(`Hình ảnh với tên "${name}" không tồn tại`);
        }

        return result;
    }

    /**
     * Lấy JSON từ kho tài nguyên theo tên đã đặt
     * @param {string} name 
     * @returns {Object | undefined}
     */
    getJson(name) {
        const result = this.#assets.json[name];

        if(!result) {
            console.warn(`JSON với tên "${name}" không tồn tại`);
        }

        return result;
    }

    /**
     * Thiết lập hàm sẽ được thực thi sau khi tải xong tài nguyên
     * @param {() => any} callback - Hàm được gọi sau khi mọi tài nguyên tải xong
     */
    onAllAssetsLoaded(callback) {
        this.#onAllAssetsLoaded = callback;
    }
}