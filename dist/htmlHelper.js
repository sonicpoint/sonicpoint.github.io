//
// Helper class for interfacing with HTML page
//
export class HtmlHelper {
    //
    // Set up an HTML Slider control
    //
    static setUpSlider(elementId, inputFunc, initialise) {
        const slider = document.getElementById(elementId);
        initialise = initialise === undefined ? true : initialise;
        // Perform any initialisation
        if (initialise) {
            inputFunc(parseFloat(slider.value));
        }
        slider.oninput = () => {
            inputFunc(parseFloat(slider.value));
        };
    }
    //
    // Set up an HTML Checkbox control
    //
    static setUpCheckbox(elementId, changeFunc, initialise) {
        const checkbox = document.getElementById(elementId);
        initialise = initialise === undefined ? true : initialise;
        // Perform any initialisation
        if (initialise) {
            changeFunc(checkbox.checked);
        }
        checkbox.onclick = () => {
            changeFunc(checkbox.checked);
        };
    }
    //
    // Set the hidden property on an HTML Div element
    //
    static setHtmlDivElementHidden(elementId, value) {
        const element = document.getElementById(elementId);
        element.hidden = value;
    }
    //
    // Set the disabled property on an HTML Input element
    //
    static setHtmlElementDisabled(elementId, value) {
        const element = document.getElementById(elementId);
        element.disabled = value;
    }
    //
    // Load a set of images asynchronously
    //
    static loadImages(imageInfos, callback) {
        const images = [];
        if (imageInfos.length === 0) {
            callback(images);
        }
        let imagesToLoad = imageInfos.length;
        // Called each time an image finished loading.
        const onImageLoad = () => {
            --imagesToLoad;
            // If all the images are loaded call the callback.
            if (imagesToLoad === 0) {
                callback(images);
            }
        };
        for (let i = 0; i < imagesToLoad; i++) {
            const image = HtmlHelper.loadImage(imageInfos[i].url, onImageLoad);
            images.push({
                name: imageInfos[i].name,
                image
            });
        }
    }
    //
    // Load a single image asynchronously
    //
    static loadImage(url, callback) {
        const image = new Image();
        image.src = url;
        image.onload = callback;
        return image;
    }
    //
    // Extract an image from a set of Image Infos by name
    //
    static getImage(name, imageInfos) {
        return imageInfos.find(imageInfo => imageInfo.name === name).image;
    }
}
//# sourceMappingURL=htmlHelper.js.map