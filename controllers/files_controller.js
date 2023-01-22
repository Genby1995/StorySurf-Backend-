const ApiError = require("../exeptions/api_error");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '..client/public/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
const upload = multer({ storage: storage })

class FilesController {

    async upload(req, res, next) {
        try {
            const file = req.file;
            upload.single("file");
            if (!file) {
                return res.status(404).json("File has not been found")
            }
            return res.status(200).json(file.name);
        } catch (err) {
            return res.status(500).json(err);
        }
    }
}

module.exports = new FilesController();