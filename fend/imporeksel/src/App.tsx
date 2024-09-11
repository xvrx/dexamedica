import * as api from './api'
import React from 'react'

import { useState } from 'react'
import axios from 'axios'
import './App.css'


import logo from './assets/dexa0.svg'
import icon_upload from './assets/upload.svg'
import icon_switch from './assets/switch.svg'
import { BarLoader } from 'react-spinners'

function App() {


// interface utk validasi data type costumer
  interface costumer {
    CustomerArea : string,
    Year: string,
    SiteCode: string, 
    Linebased: string, 
    LineName: string, 
    RayonCode: string, 
    CompanyCode: string,
    errorNotice? : string, 
  }

  // state utk kostumer:  jika fetch ke server berhasil, file excel yg telah konversi ke json akan disimpan di state ini
  const [costumerContainer, setcostumerContainer] = useState<costumer[]>([])


  // state sedang loading - kontrol overlay loading 
  const [loading, setloading] = useState<boolean>(false)

  // state: data file yang akan disubmit : setelah input HTML file akan ditambahkan ke state ini
  const [files, setFiles] = useState<File[] | []>([])

  //  display tabel : jika fetch berhasil, display tabel kostumer
  const [displayTab, setdisplayTab] = useState<boolean>(false)


  // fungsi: seleksi file yang akan diuplaod ke backend utk diverifikasi
  function addNewSample(e: React.ChangeEvent<HTMLInputElement>) : void {
    e.preventDefault()
    console.log(e.target.files)
    if (e.target.files && e.target.files.length > 0) {
      
      // buat array berdasarkan tambahan file yang dipilih oleh user
      const addition:File[] = Array.from(e.target.files)

      // buat array berdasarkan kondisi array files sekarang
      const currentFile:File[] = Array.from(files)

      // gabungkan kedua array tersebut
      const combined = currentFile.concat(addition)

      // lempar ke dalam state files
      setFiles(combined)
    }

    // kosongkan container input agar tidak ada konstrain upload file
    e.target.value = ''
  }

  // jika tombol x diklik, remove file dari list
  function removeList (idx : number) : void {
    console.log(idx)
    // ambil parameter dari htmlInput event, return file yang indexnya tidak diklik
    const filtered = files.filter((_x,i) => i !== idx)

    // set state baru untuk Files yang tidak diklik
    setFiles(filtered)
  }

// submit file xls yang telah dipilih 
async function sendSample() {
  console.log(files)
  // aktifkan overlay loading sebelum fetch
  setloading(true)
  
  if (files.length > 0) {
    console.log('Uploading file...');

    // state files adalah sebuah array
    // sebelum mengirim files tersebut perlu di-append dalam bentuk FormData\

    // inisiasi formData kosong
    const formData = new FormData();

    // lakukan loop untuk append tiap file yang ada di dalam state files[] ke dalam form data kosong
    files.forEach(file => {
      formData.append('file', file)
    })

    // jika formData sudah terisi, kirim ke backend
    axios.post(api.local_upload, formData)
      .then(res => {
        console.log(res)
        // saat respon diterima dari backend, masukkan data ke dalam state costumerContainer
        setcostumerContainer(res.data.report)
        // hilangkan overlay loading
        setloading(false)

        // switch display ke tabel untuk menunjukan user respon data berupa json yang telah
        // di konversi di backend
        setdisplayTab(true)
      })
      .catch(err => {
        // log console jika ada error
        console.log(err.response)
        // hilangkan overlay loading
        setloading(false)
      })
  } else { }
}


  return (
    <div className='layout'>
        {/* OVERLAY JIKA STATE LOADING BERNILAI TRUE */}
        <div className={loading ? "loaderContainer loading-show" : "loaderContainer loading-off"}>
          <BarLoader color={'white'}
            loading={loading}
            // size={100}
            aria-label="Loading Spinner"
            data-testid="loader"/> 
          <p id="loaderP" >Mohon tunggu...</p>
        </div>

        <div className='heading'>
          <img src={logo} className='title-logo' alt="dex_logo" />
          <div className='title-main'>Dexa</div>
          <div className='title-sub'>Costumer</div>
        </div>
          
        <div className="main-container">
              <div className="inner-wrapper">
                <p>Add costumer report(s) to analyze before uploading them.</p>
                <div className="choose">
                  
                    <div className="uploadFile">
                      <input name="file"  multiple  accept='.xlsx, .xls' onChange={(e) => addNewSample(e)} id="uploadSample" type="file" />
                      <label className='file_label' htmlFor="uploadSample"><strong> <div className="icon"><img className='icon' src={icon_upload} alt="" /></div>Add Files {files.length> 0 ? `| ${files.length} file(s) selected` : ''}</strong>  </label>
                    </div>
                    <button onClick={sendSample}>Submit</button>

                    {/* jika state costumer sudah terisi, munculkan tombol switch agar user dapat melihat tabel */}
                    {costumerContainer.length > 0 && <button title='switch-display'  onClick={() => setdisplayTab(!displayTab)}> <img src={icon_switch} alt="" /> </button>}
                </div>

                <div className="file-list-container">
                    <div className="file-list">
                        {
                          {/*jika terdapat files yang telah diselect*/}
                          (files?.length > 0 && !displayTab ) ?
                          <div>
                            selected files :
                            <br/>

                            {/*map state files dalam bentuk html */}
                            {files.map((file, idx) => {return(
                              <div className="file" key={idx}>
                                <div className="file-name">
                                  {idx + 1}. {file.name} ({(file.size / 1024).toFixed(2)} Kb)
                                </div>
                                <div className="file-delete" onClick={() => removeList(idx)}>
                                  <button className='remove-list'>x</button>
                                </div>
                              </div>
                            )})}
                          </div> : displayTab && costumerContainer.length > 0 ? 
                          <div className="table-container">
                          
                            <div className="table-header grid">
                                <div className="header-no">No</div>
                                <div className="header-SiteCode">Site Code</div>
                                <div className="header-RayonCode">Rayon Code</div>
                                <div className="header-LineName">Line Name</div>
                                <div className="header-errorNotice">Upload Notice</div>
                            </div>
      
                            <div className="table-content">
      
                              {costumerContainer.map((costumer,idx) => {
                                return(
                                  <div className="table-list grid" key={idx}>
                                    <div className="content-no">{idx + 1}</div>
                                    <div className="content-SiteCode">{costumer.SiteCode}</div>
                                    <div className="content-RayonCode">{costumer.RayonCode}</div>
                                    <div className="content-LineName">{costumer.LineName}</div>

                                    {/* jika di dalam file json terdapat property errornotice, tampilkan. Jika tidak ada tampilkan string validated */}
                                    <div className="content-errorNotice">{costumer.errorNotice && costumer.errorNotice.length > 0 ? costumer.errorNotice : "Validated"}</div>
                                  </div>
                                )
                              })}
                          </div>
                        </div> : <div>Note : No data has been selected.</div>
                        }
                      </div>
                </div>
              </div>
        </div>

   
    </div>
  )
}

export default App
