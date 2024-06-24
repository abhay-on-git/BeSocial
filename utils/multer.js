const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        newFile = Date.now() + "-" + file.originalname;
        cb(null, newFile);
      },
});

const fileFilter = function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|svg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
         cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

module.exports = upload;