const fs = require('fs');
const path = require('path');
const {createCanvas, loadImage} = require('canvas');
const width = 463;
const height = 400;
const numberToColourMap = {
    0: "#F84828",
    1: "#68C0C0",
    2: "#DC1500",
    3: "#F8F0E0",
    4: "#009687",
    5: "#00BF87",
    6: "#00FF9A",
    7: "#66FFC2",
    8: "#FFFFFF",
    9: "#690000",
    10: "#FF0000",
    11: "#FF6666",
    12: "#FFB3B3",
    13: "#00BCC2",
    14: "#00F7FF",
    15: "#66FAFF",
    16: "#B3FDFF",
    17: "#E4E4E4",
    18: "#993800",
    19: "#FF5E00",
    20: "#FF9E78",
    21: "#FFCFB3",
    22: "#005199",
    23: "#0088FF",
    24: "#66B8FF",
    25: "#B3DBFF",
    26: "#B9B9B9",
    27: "#B37700",
    28: "#FFAA00",
    29: "#FFCC66",
    30: "#FFE2B3",
    31: "#000C80",
    32: "#0019FF",
    33: "#6675FF",
    34: "#B3BAFF",
    35: "#858585",
    36: "#B39B00",
    37: "#FFDD00",
    38: "#FFFF00",
    39: "#FFFF71",
    40: "#2B0080",
    41: "#5500FF",
    42: "#9966FF",
    43: "#CCB3FF",
    44: "#505050",
    45: "#38A100",
    46: "#78C900",
    47: "#B3FF00",
    48: "#DCFF8A",
    49: "#610080",
    50: "#C400FF",
    51: "#DC66FF",
    52: "#EDB3FF",
    53: "#232323",
    54: "#006600",
    55: "#00B800",
    56: "#00FF00",
    57: "#8AFF9E",
    58: "#990059",
    59: "#FF0095",
    60: "#FF66BF",
    61: "#FFB3DF",
    62: "#000000"
};
const padToFourDigits = (num) => {
    return num.toString().padStart(4, '0');
}
const applyMaskAndColor = async (mask, color) => {
    const offscreenCanvas = createCanvas(width, height);
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Draw the mask
    offscreenCtx.drawImage(mask, 0, 0);

    // Apply the color
    offscreenCtx.globalCompositeOperation = 'source-in';
    offscreenCtx.fillStyle = color;
    offscreenCtx.fillRect(0, 0, width, height);

    return offscreenCanvas;
}
const createCostumeAvatar = async (costumeData, bodyColourId, faceColourId) => {
    while (costumeData.length < 5) {
        costumeData.push(0);
    }
    const kigurumiId = costumeData.kigurumiId;
    const headId = costumeData.headId;
    const bodyId = costumeData.bodyId;
    const faceId = costumeData.faceId;
    const puchiId = costumeData.puchiId;
    let bodyMask, faceMask, headBodyMask, headFaceMask, body, face, head, kigurumi, puchi;
    if (kigurumiId === 0) {
        let bodyMaskPath = path.join(__dirname, `sprites/masks/body-bodymask-${padToFourDigits(bodyId)}.png`);
        let faceMaskPath = path.join(__dirname, `sprites/masks/body-facemask-${padToFourDigits(bodyId)}.png`);
        let bodyPath = path.join(__dirname, `sprites/body/body-${padToFourDigits(bodyId)}.png`);
        let facePath = path.join(__dirname, `sprites/face/face-${padToFourDigits(faceId)}.png`);
        let headBodyMaskPath = path.join(__dirname, `sprites/masks/head-bodymask-${padToFourDigits(headId)}.png`);
        let headFaceMaskPath = path.join(__dirname, `sprites/masks/head-facemask-${padToFourDigits(headId)}.png`);
        let headPath = path.join(__dirname, `sprites/head/head-${padToFourDigits(headId)}.png`);
        if (fs.existsSync(bodyMaskPath)) {
            bodyMask = await loadImage(bodyMaskPath);
        } else {
            bodyMask = await loadImage(path.join(__dirname, `sprites/masks/body-bodymask-0000.png`));
        }
        if (fs.existsSync(faceMaskPath)) {
            faceMask = await loadImage(faceMaskPath);
        } else {
            faceMask = await loadImage(path.join(__dirname, `sprites/masks/body-facemask-0000.png`));
        }
        if (fs.existsSync(bodyPath)) {
            body = await loadImage(bodyPath);
        } else {
            body = await loadImage(path.join(__dirname, `sprites/body/body-0000.png`));
        }
        if (fs.existsSync(facePath)) {
            face = await loadImage(facePath);
        } else {
            face = await loadImage(path.join(__dirname, `sprites/face/face-0000.png`));
        }
        if (fs.existsSync(headBodyMaskPath)) {
            headBodyMask = await loadImage(headBodyMaskPath);
        } else {
            headBodyMask = await loadImage(path.join(__dirname, `sprites/head/head-0000.png`));
        }
        if (fs.existsSync(headFaceMaskPath)) {
            headFaceMask = await loadImage(headFaceMaskPath);
        } else {
            headFaceMask = await loadImage(path.join(__dirname, `sprites/head/head-0000.png`));
        }
        if (fs.existsSync(headPath)) {
            head = await loadImage(headPath);
        } else {
            head = await loadImage(path.join(__dirname, `sprites/head/head-0000.png`));
        }
    } else {
        let kigurumiPath = path.join(__dirname, `sprites/kigurumi/kigurumi-${padToFourDigits(kigurumiId)}.png`);
        let kigurumiBodyMaskPath = path.join(__dirname, `sprites/masks/kigurumi-bodymask-${padToFourDigits(kigurumiId)}.png`);
        let kigurumiFaceMaskPath = path.join(__dirname, `sprites/masks/kigurumi-facemask-${padToFourDigits(kigurumiId)}.png`);
        if (fs.existsSync(kigurumiPath)) {
            kigurumi = await loadImage(kigurumiPath);
        } else {
            kigurumi = await loadImage(path.join(__dirname, `sprites/kigurumi/kigurumi-0000.png`));
        }
        if (fs.existsSync(kigurumiBodyMaskPath)) {
            bodyMask = await loadImage(kigurumiBodyMaskPath);
        } else {
            bodyMask = await loadImage(path.join(__dirname, `sprites/masks/body-bodymask-0000.png`));
        }
        if (fs.existsSync(kigurumiFaceMaskPath)) {
            faceMask = await loadImage(kigurumiFaceMaskPath);
        } else {
            faceMask = await loadImage(path.join(__dirname, `sprites/masks/body-facemask-0000.png`));
        }
    }
    let puchiPath = path.join(__dirname, `sprites/puchi/puchi-${padToFourDigits(puchiId)}.png`);

    if (fs.existsSync(puchiPath)) {
        puchi = await loadImage(puchiPath);
    } else {
        puchi = await loadImage(path.join(__dirname, `sprites/puchi/puchi-0000.png`));
    }
    // Create a canvas
    // Set the height of the final image
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');


    // Create colored masks
    const coloredBodyMask = await applyMaskAndColor(bodyMask, numberToColourMap[bodyColourId]);
    const coloredFaceMask = await applyMaskAndColor(faceMask, numberToColourMap[faceColourId]);

    // Draw the colored masks onto the main canvas
    ctx.drawImage(coloredBodyMask, 0, 0);
    ctx.drawImage(coloredFaceMask, 0, 0);
    // Draw images on top
    ctx.globalCompositeOperation = 'source-over';
    if (kigurumiId === 0) {
        ctx.drawImage(body, 0, 0);
        ctx.drawImage(face, 0, 0);
        const colouredHeadBodyMask = await applyMaskAndColor(headBodyMask, numberToColourMap[bodyColourId]);
        const colouredHeadFaceMask = await applyMaskAndColor(headFaceMask, numberToColourMap[faceColourId]);
        ctx.drawImage(colouredHeadBodyMask, 0, 0);
        ctx.drawImage(colouredHeadFaceMask, 0, 0);
        ctx.drawImage(head, 0, 0);
    } else {
        ctx.drawImage(kigurumi, 0, 0);
    }
    ctx.drawImage(puchi, 0, 0);

    // Save the final image
    return canvas.toBuffer('image/png');
}

module.exports = { createCostumeAvatar };

