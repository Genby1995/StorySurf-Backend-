const fs = require('fs');
const { atob } = require("buffer");

export default base64ToFile = (url) => {
    let arr = url.split(",");
    const fileExtension = arr[0].match(/:(.*?);/)[1].split('/')[1];
    const base64Image = arr[1];
    const fileName = +(new Date) + "_" + Math.floor(Math.random() * 1000) + '.' + fileExtension
    const directory = '../client/public/uploads/'

    fs.writeFile(directory + fileName, base64Image, 'base64', function (err) {
        console.log(err);
    });
    return fileName
}