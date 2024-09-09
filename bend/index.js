const express = require('express')
const app = express()
const port = 3000

// untuk membaca file ekstensi xlsx / spreadsheets
const xlsx = require('xlsx');

const path = require('path');

// terdapat 2 server / frontend dan backend, agar browser memperbolehkan 2 server tsb berbagi resource, perlu dilakukan konfigurasi di cors
const cors = require("cors");

// digunakan sebagai modul middleware utk memproses formData/file/blob saat diterima dari front end
const multer  = require('multer');

// utk sementara rayoncode acuan hardcoded
const validRayonCode = require('./rayoncode')

// konfigurasi multer 
// terdapat 2 cb (callback) -- cek dokumentasi multer utk melihat callback lain
// destination : lokasi file akan disimpan --- saat ini file akan di simpan di folder uplaod
// filename : nama file/formData saat akan disimpan
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    // pindahkan file ke folder direktori/upload
      cb(null, path.join(__dirname, "/upload"))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9)
      cb(null,  path.parse(file.originalname).name + "_" + uniqueSuffix + "_" + path.extname(file.originalname))
    }
  })

  // "upload" akan digunakan sebagai middleware saat api diakses
  const upload = multer({ storage:storage })

// endpoint untuk ngetes doang
app.get('/', (req, res) => {
   res.send("thank you for accessing the server.")
})

// buka akses ke data di folder public sebagai static file
app.use(express.static('public'))

// jika ada file dalam body request, parse ke dalam bentuk json
app.use(express.json());

// gunakan cors utk mengizinkan resource sharing antar api
app.use(
    cors({
      origin: "*",
      // origin: [
      //   "http://localhost:3000",
      //   "http://192.168.1.8:3000",
      // ],
      // origin: "http://10.13.1.63:3000",
      methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"],
    //   credentials: false,
    // allowedHeaders:{}
    })
);


// api yang akan diakses saat frontend akses localhost:3000/upload
app.post('/upload', upload.array('file'), (req,res) => {
    let jsonified = []
    const files = req?.files
    if (files !== null && files.length > 0 ) {
       // // Path to your .xlsx file
     files.forEach(file => {
        // const filePath = path.join(___dir,'upload', 'your-file.xlsx');
        const filePath = file?.path;

        // // Read the .xlsx file
        const workbook = xlsx.readFile(filePath);

        // // Get the first sheet name
        const sheetName = workbook.SheetNames[0];

        // // Get the data from the first sheet
        const sheet = workbook.Sheets[sheetName];

        // // Convert sheet data to JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        // push data into jsonified
        jsonified = jsonified.concat(data)
        
        // cek rayon code
        jsonified.forEach((x,i) => {
          if (validRayonCode.includes(x?.RayonCode) == false) {
            
            // jika rayon code tidak ditemukan di validrayoncode
            x.errorNotice = "RayonCode is not valid!"
            // log rayon error
            // console.log("error notice on index: ", i)
          } else {
            
          }
        })
     })
      
    } else {
      // jika file yang diterima == null atau berupa array[ ] kosongan
      res.status(404).json({message : "no files are recieved in the server"})
    }
    // jika proses pembacaan eksel, validasi rayon code, dan array sudah selesai dan siap dikirim kembali ke front end
    res.status(200).json({message : "spreadsheets are saved!", report : jsonified})
})

// jalankan server backend
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  