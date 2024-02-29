const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

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
async function createCompositeImage() {
    // Create a canvas
    const width = 463; // Set the width of the final image
    const height = 400; // Set the height of the final image
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load your images
    const bodymask = await loadImage('/Users/keitannunes/IdeaProjects/TaikoPSDiscordBot/sprites/masks/body-bodymask-0005.png');
    const facemask = await loadImage('/Users/keitannunes/IdeaProjects/TaikoPSDiscordBot/sprites/masks/body-facemask-0005.png');
    const body = await loadImage('/Users/keitannunes/IdeaProjects/TaikoPSDiscordBot/sprites/body/body-0005.png');
    const face = await loadImage('/Users/keitannunes/IdeaProjects/TaikoPSDiscordBot/sprites/face/face-0005.png');
    const head = await loadImage('/Users/keitannunes/IdeaProjects/TaikoPSDiscordBot/sprites/head/head-0005.png');
    const puchi = await loadImage('/Users/keitannunes/IdeaProjects/TaikoPSDiscordBot/sprites/puchi/puchi-0005.png');
    ctx.drawImage(bodymask, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = numberToColourMap[58]; // Replace 'colorA' with your actual color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and color Mask B
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(facemask, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = numberToColourMap[3]; // Replace 'colorB' with your actual color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images on top
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(body, 0, 0);
    ctx.drawImage(face, 0, 0);
    ctx.drawImage(head, 0, 0);
    ctx.drawImage(puchi, 0, 0);

    // Save the final image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('final_output.png', buffer);
}

createCompositeImage().then(() => {
    console.log('The image was created successfully!');
});

