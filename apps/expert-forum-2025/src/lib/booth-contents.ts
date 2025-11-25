export interface BoothProject {
  namaKarya: string
  deskripsiSingkat: string
  benefit: string
  expertYangTerlibat: string
}

export interface BoothContent {
  projects: BoothProject[]
}

export const BOOTH_CONTENTS: Record<string, BoothContent> = {
  AGIT: {
    projects: [
      {
        namaKarya: 'Cyber Security Services Business',
        deskripsiSingkat: 'Implementation of Cyber Security Services for customers: (Operations: Security Operation Center (including MDR), Vulnerability Management, Threat Intelligence & Dark Web Monitoring, Professional Services: Penetration Testing)',
        benefit: 'Business Impact: Revenue YTD Sep 2025: IDR 36.5 Bio',
        expertYangTerlibat: '- Agung Wiratama'
      },
      {
        namaKarya: 'From Dull to Dazzling: Transforming Photo Quality for Printing Partners (Color Management Project)',
        deskripsiSingkat: 'The solution enhances digital photo brightness and contrast by optimizing the TRC. Through controlled tonal redistribution, it makes images appear clearer, more vibrant, and naturally balanced without losing detail.',
        benefit: 'Business Impact: Projected ORS Revenue Full Year 2025: IDR 8.5 Bio',
        expertYangTerlibat: '- Teguh Sardjono Muktiwidjaja'
      },
      {
        namaKarya: 'DevSecOps services Implementation',
        deskripsiSingkat: 'Implementation & Roll-Out CI/CD Framework – Applying the methodology/framework to relevant projects',
        benefit: 'Business Impact: Revenue YTD Sep 2025: 56.1 Bio',
        expertYangTerlibat: '- Indra Meguga'
      }
    ]
  },
  AAL: {
    projects: [
      {
        namaKarya: 'Tandan budah dari Varietas DxP AAL Lestari MRG, DxP AAL Sejahtera MRG, dan DxP AAL Nirmala MRG',
        deskripsiSingkat: 'Tandan buah dari Tiga varietas kelapa sawit unggul baru yang memiliki produktifitas tinggi dan moderat tahan terhadap penyakit yang disebabkan okeh  Ganoderma',
        benefit: 'Varietas baru yang memiliki produktifitas tinggi dan menjadi solusi terhadap serangan penyakit Ganoderma. Varietas ini dapat mengurangi tingkat kematian akibat penyakit tersebut dan memperpanjang umur ekonomis tanaman.',
        expertYangTerlibat: '-Tim departemen Breeding, Molekuler, dan Tissue Culture dan Crop Protection'
      },
      {
        namaKarya: 'Pupuk Hayati ASTEMIC (Astra Efficient Microbes)',
        deskripsiSingkat: 'Implementasi aplikasi biofertilizer Astemic di perkebunan kelapa sawit seluas 51.345 Ha.',
        benefit: 'Efisiensi biaya pemupukan: sebesar Rp 79 Miliar pada tahun 2025. Reduksi emisi gas rumah kaca (GRK): berpotensi menurunkan emisi CO₂ sebesar 17.146 kTonCO2.eq dan keberlanjutan lingkungan.',
        expertYangTerlibat: '-Tim departemen Agronomy and Microbiology (AGM) dan departemen Soil and Fertilizer Research (SFR)'
      }
    ]
  },
  TTA: {
    projects: [
      {
        namaKarya: 'Eng Ing Ang ABB',
        deskripsiSingkat: 'Sebuah inisiatif strategis untuk memulihkan performa operasional di Disposal Jerez',
        benefit: 'Inovasi ini berhasil mengembalikan kapasitas Disposal Jerez hingga 35 juta meter kubik, menyelamatkan 28.000 ton batubara, serta mengurangi jarak angkut overburden',
        expertYangTerlibat: '- Harin Musin\n- Wiba\n- Arbastya Masdar Rochman\n- Michael Naibaho'
      },
      {
        namaKarya: 'Auger Mining  Project',
        deskripsiSingkat: 'Sebuah inovasi penambangan yang dikembangkan untuk memanfaatkan sumber daya batubara ekonomis yang berada di bawah Sungai Kuatan, tanpa harus melakukan pemindahan aliran sungai, sesuai dengan regulasi kawasan hutan.',
        benefit: 'diperoleh tambahan produksi sebesar 58.194 ton batubara',
        expertYangTerlibat: '- Harin Musin\n- Arbastya Masdar Rochman\n- Michael Naibaho'
      },
      {
        namaKarya: 'Bawal',
        deskripsiSingkat: 'metode machine learning forecasting, proyek ini memanfaatkan data sensor di area hulu yaitu Muara Tuhup, Muara Teweh dan Paring Lahung untuk memprediksi TAS hingga 10 hari ke depan dengan akurasi minimal 80 persen.',
        benefit: 'memprediksi TAS hingga 10 hari ke depan dengan akurasi minimal 80 persen.',
        expertYangTerlibat: '- M Faizal Akbar'
      },
      {
        namaKarya: 'Centrifuge',
        deskripsiSingkat: 'proses pengeringan batubara dilakukan untuk menurunkan total moisture, meningkatkan efisiensi biaya transportasi, meningkatkan kualitas Caloric value batubara serta mengurangi risiko dampak lingkungan seperti self combustion.',
        benefit: 'membantu mengembalikan kondisi Total Moisture pada batubara saat sebelum dicuci sehingga Kualitas Caloric value pada batubara sesuai dengan spesifikasi penjualan.',
        expertYangTerlibat: '- Anggi Yuliandus, Dedie Heryawan'
      }
    ]
  },
  ADM: {
    projects: [
      {
        namaKarya: 'Smart Operation Manufacture System',
        deskripsiSingkat: 'Sistem terintegrasi berbasis digital yang menghubungkan seluruh aktivitas produksi, mencakup proses manufaktur, maintenance, kualitas, logistik, dan energi untuk mencapai operasi yang efisien, berpresisi tinggi, dan berkelanjutan (zero downtime dan zero waste).',
        benefit: 'Meningkatkan produktivitas\nPeningkatan kualitas\nMengurangi downtime\nEfisiensi energi',
        expertYangTerlibat: '- Budi Pamungkas\n- Rifky Aji N.'
      },
      {
        namaKarya: 'Auto Measuring System',
        deskripsiSingkat: 'Auto Measuring System adalah teknologi inspeksi otomatis yang dirancang untuk memastikan akurasi dimensi bodi kendaraan (BIW – Body in White). Dengan menggunakan kamera visi berpresisi tinggi, sistem ini mengukur titik-titik referensi utama pada bodi secara otomatis tanpa kontak manual.',
        benefit: 'Akurasi pengukuran yang tinggi\nKontrol kualitas secara real-time\nKualitas yang konsisten',
        expertYangTerlibat: '- Andi Hartadi\n- M. Zakky'
      }
    ]
  },
  AOP: {
    projects: [
      {
        namaKarya: 'Digital Column Scale With Digital Height Measurement',
        deskripsiSingkat: 'Column Scale with Digital Height Measurement is an advanced medical device designed for clinics, hospitals, and personal health tracking. Featuring high-precision weight and height sensors, it provides accurate body measurements while seamlessly syncing data with health applications via Bluetooth.',
        benefit: '500 Mio per annum\nCustomer IDS Medical',
        expertYangTerlibat: '- Ade Anto\n- Syahfiro\n- Shofiyullah'
      },
      {
        namaKarya: 'Body Composition Analyzer',
        deskripsiSingkat: 'High accuracy, ergonomic design, and modern appearance. Equipped with a 10" color LCD display, flexible hand and foot impedance sensors, and an anti-slip foot platform for stable and precise measurements. Easy to move with built-in wheels, featuring adjustable height and ergonomic screen tilt for maximum comfort for both users and operators.',
        benefit: '500 Mio per annum\nCustomer IDS Medical',
        expertYangTerlibat: '- Ade Anto\n- Syahfiro\n- Shofiyullah'
      },
      {
        namaKarya: 'UltiX – Hi Performance Brake System',
        deskripsiSingkat: 'Sistem Rem Performa Tinggi untuk Sepeda Motor, digunakan pada ajang balap motor tingkat Nasional dan Asia. Dirancang bagi mereka yang menuntut performa maksimal di setiap perjalanan.',
        benefit: 'Inisiatif ini mendorong peningkatan pendapatan, memperkuat citra merek Akebono, serta meningkatkan kapabilitas karyawan dalam pengembangan produk, sehingga mendukung pertumbuhan bisnis yang berkelanjutan.',
        expertYangTerlibat: '- Jakfar Syadiq\n- Ruddiwan Saleh\n- Annisa Nurhasanah'
      },
      {
        namaKarya: 'ALTRO Ev Charging Station Pole Mounted AC 7kW',
        deskripsiSingkat: 'Varian baru Electric Vehicle Charging Station (EVCS) AC 7 kW, dipasang di dalam tiang listrik sesuai dengan persyaratan PLN. Dirancang untuk mendukung ekosistem kendaraan listrik (EV) di Indonesia dengan efisiensi ruang dan ketahanan terhadap lingkungan.',
        benefit: 'Portofolio bisnis ini memiliki potensi penjualan sebesar 17,5 miliar rupiah per tahun.',
        expertYangTerlibat: '- Hendrick\n- Zai\n- Anwar\n- Aghda\n- Rizal\n- Novan'
      },
      {
        namaKarya: 'USG 4D',
        deskripsiSingkat: 'Memvisualisasikan organ internal secara real time, membantu dalam diagnosis, pemantauan kehamilan, dan mendeteksi kelainan medis tanpa perlu operasi.',
        benefit: 'Potensi penjualan sebesar 11,2 miliar rupiah per tahun.',
        expertYangTerlibat: '- Arifin\n- Riwi\n- Dimas\n- Singgih\n- Syahfiro H S'
      },
      {
        namaKarya: 'BPM + 3 IN 1 GCU MONITORING SYSTEM',
        deskripsiSingkat: 'BPM+3in1 adalah perangkat kesehatan digital multifungsi yang menggabungkan empat pengukuran vital dalam satu alat: tekanan darah, gula darah, kolesterol, dan asam urat.',
        benefit: 'Meningkatkan pendapatan dari perakitan kaca spion.',
        expertYangTerlibat: '- Syahfiro\n- Abram Ali S\n- Deni Fajar\n- Shofiyyullah'
      },
      {
        namaKarya: '[AOP Group – PAMA] Localization Spare Parts Mining Product Development within Astra Business Collaboration Program',
        deskripsiSingkat: 'Komponen impor dilokalisasi melalui reverse engineering, penyempurnaan spesifikasi, dan peningkatan kualitas. Proses validasi dipercepat melalui pengujian skala laboratorium, sehingga mengurangi kebutuhan uji coba di lokasi yang berbiaya tinggi.',
        benefit: 'Q: Menggantikan produk existing/impor dengan masa pakai 365% lebih lama\nC: Biaya per produk meningkat, tetapi memberikan penghematan biaya 61% per jam dibandingkan produk existing\nD: Pengiriman lebih cepat 2 bulan',
        expertYangTerlibat: '- Ivan\n- Najib\n- Frans\n- Dimas\n- Fadli\n- Fauzul'
      },
      {
        namaKarya: 'AOP Smart Manufacturing',
        deskripsiSingkat: 'Sebuah sistem yang dibangun untuk mengelola, mengumpulkan, dan melacak data produksi, serta menyediakan informasi status line/mesin secara real-time.',
        benefit: 'Mendorong produktivitas dan visibilitas real-time di area produksi, serta membangun kolaborasi internal dan rantai nilai di dalam Astra Otoparts Group.',
        expertYangTerlibat: '- Wahyu Hidayat Santoso\n- Andri Irawan\n- Cahya Kusuma Ardhi'
      },
      {
        namaKarya: 'KYB - OCU Sub-Tank New Feature',
        deskripsiSingkat: 'OCU Sub Tank dengan Fitur Baru untuk penggunaan harian dan dapat disesuaikan (stabilitas dan kenyamanan tinggi).',
        benefit: 'Meningkatkan kapabilitas desain.\nMeningkatkan jumlah penjualan.',
        expertYangTerlibat: '-M Safii PDE-2W Dept & Team'
      }
    ]
  },
  AHM: {
    projects: [
      {
        namaKarya: 'Flexible Manufacturing Way – Digital Operation (Digitalization Kit)',
        deskripsiSingkat: 'Seperangkat pengumpul data (data capturing kit) yang digunakan untuk mensimulasikan bagaimana Digital Operation bekerja di AHM menggunakan:\n• Loads Simulation\n• Protocol & Data Pooling\n• Data Capture & Visualization',
        benefit: '• Pengembangan Kompetensi',
        expertYangTerlibat: '• Morris Lizar\n• Setiawan Romadhan\n• Muhammad Idham'
      },
      {
        namaKarya: 'Cost Leadership Way – Simplify Design and Production Optimization (Vertical Lifter Construction for Plastic Mold)',
        deskripsiSingkat: 'Pengurangan waktu manufaktur dan dimensi material yang digunakan untuk base mold dengan menggunakan tata letak sistem undercut yang dioptimalkan serta komponen-komponennya.',
        benefit: '• Mengurangi biaya material\n• Mengurangi biaya process',
        expertYangTerlibat: '• Budi Hargo Widagdo\n• Gregorius Bono Driyantoro\n• Dewa Made Adnya'
      },
      {
        namaKarya: 'Technology Transition – Virtual Testing (Virtual Testing Video)',
        deskripsiSingkat: 'Penerapan simulasi digital yang akurat dan tervalidasi yang secara dekat mereplikasi kondisi pengujian nyata untuk memprediksi kinerja komponen atau produk sebelum pengujian sebenarnya dilakukan.',
        benefit: '• Mengurangi kegagalan pengujian produk dan siklus uji ulang.\n• Mengurangi jam kerja (man-hour) untuk uji ulang.\n• Mengurangi biaya untuk desain ulang dan pembuatan ulang.\n• Mengurangi penggunaan energi untuk uji ulang.',
        expertYangTerlibat: '• Ari Prahadi K\n• Arnold Indra G\n• Daris Ibnu F\n• Eko Budi S\n• Firdaus Jafar\n• Wahid Marditama'
      },
      {
        namaKarya: 'Cost Leadership Way - Part Innovation (New Wheel Design)',
        deskripsiSingkat: 'Merancang Wheel baru melalui kolaborasi Astra (AHM & PAKO) untuk mencapai keunggulan biaya. Desain wheel baru ini mampu mengurangi biaya material dan berkontribusi pada daya saing biaya AHM.',
        benefit: '• Mengurangi biaya parts',
        expertYangTerlibat: '• Tatang Rukmana\n• Dariyanto\n• Antonio Frian'
      }
    ]
  },
  IAMI: {
    projects: [
      {
        namaKarya: 'NMR Hi-Gear',
        deskripsiSingkat: 'Pengembangan varian baru untuk kelas light truck 6T, untuk capture bigger market. (Prototype Phase)',
        benefit: 'Memenuhi segmentasi pasar baru → Berpotensi meningkatkan pangsa pasar\nMemperoleh informasi pasar yang aktual.',
        expertYangTerlibat: '-Yahya Tata Imansyah'
      },
      {
        namaKarya: 'HVAC P700',
        deskripsiSingkat: 'Inisiasi perubahan spesifikasi HVAC untuk model baru Isuzu (P700).',
        benefit: 'Menyederhanakan desain → Mengurangi biaya material dan investasi\nMeningkatkan kapabilitas engineering terkait evaluasi dan analisis HVAC.',
        expertYangTerlibat: '-Dio Yoshitaka Anggarda'
      },
      {
        namaKarya: 'Localization',
        deskripsiSingkat: 'Lokalisasi dan upaya mencari desain yang optimal (VAVE) dengan menyeragamkan desain lokal (Parts/Dies/Mold).',
        benefit: 'Menyederhanakan dan menyeragamkan desain → Mengurangi investasi dan menghasilkan penghematan biaya.\nMeningkatkan kandungan lokal dan mendukung rantai nilai Astra.',
        expertYangTerlibat: '-Danang Prabowo'
      },
      {
        namaKarya: 'Traga Modification Guidance',
        deskripsiSingkat: 'Perbaikan untuk memenuhi kebutuhan unik pasar Indonesia pada segmen pick-up menengah, khususnya di daerah pedesaan.',
        benefit: 'Menyediakan panduan modifikasi yang telah terbukti melalui penggunaan pelanggan.\nBerpotensi meningkatkan citra merek perusahaan di mata pelanggan.',
        expertYangTerlibat: '-Reynald Sapoetra'
      },
      {
        namaKarya: 'IADG Improvement',
        deskripsiSingkat: 'Peningkatan kualitas sekaligus menjaga daya saing suku cadang merek kedua.',
        benefit: 'Meningkatkan kualitas suku cadang yang ada saat ini\nMenjaga tingkat daya saing',
        expertYangTerlibat: '-Grangsang Sotyaramadhani'
      },
      {
        namaKarya: 'Auto-Lubrication System',
        deskripsiSingkat: 'Sistem lubrikasi otomatis pada system pengereman (unit tipe Giga)',
        benefit: 'Sistem otomatis memastikan  greasing dapat dilakukan dengan benar dan tepat waktu\nParts yang berkaitan dengan system pengereman akan lebih awet/tidak mudah rusak\nHemat grease lebih dari 70%',
        expertYangTerlibat: '-Sigit Riyanto'
      }
    ]
  },
  PAMA: {
    projects: [
      {
        namaKarya: 'TyreXpert Maintenance System',
        deskripsiSingkat: 'Sebuah improvement yang terintegrasi dalam hal proses maintenance tyre unit tambang. Improvement ini dimulai dari:\nPrabu (Pressure Accuracy Bluetooth) yang terhubung dengan big data berbasis Tablue untuk analisa dan pelaporan kondisi tyre.\nSiklus maintenance tyre : dalam proses retread, top tread, add tread, dan regroove, semua difokuskan pada optimalisasi umur pakai dan efisiensi fleet alat berat.',
        benefit: 'Data pengecekan kondisi tyre lebih presisi, valid, serta dapat mendorong langkah efisiensi dan menjaga keselamatan.\nRegroove : Meningkatkan TUR tyre\nRetread : Memaksimalkan umur casing tyre dengan cost 40% dari ban baru dan limbah karet 200kg/ban\nTop tread : Memaksimalkan umur casing tyre dengan cost 25% dari ban baru dan limbah karet 80kg/ban\nAdd tread : Memaksimalkan umur casing tyre dengan cost 10% dari ban baru dan limbah karet 10kg/ban\nEfisiensi fuel consumption dengan meningkatnya traksi tyre mengurangi potensi terjadinya spinning karena kehilangan fungsi traksi tyre yg sudah aus.\nSejalan dengan program ESG, mengurangi limbah ban karet',
        expertYangTerlibat: '-Novo Hermawan Rahdian\n-Rimin Saputra\n-Agus Saikhu M\n-Fitro Utomo\n-Nugroho Agus Prasetyo\n-M. Mahpudz S. N.\n-Daryanto\n-Irwan Susanto\n-Eko Sofianto\n-Ahmad Andik Hidayat\n-Deni Kurnia\n-Agus Prasetyadi\n-Agung Fahrudin Irawan\n-Wisnu Wardana'
      },
      {
        namaKarya: 'AUTOSPRAY BY GPS',
        deskripsiSingkat: 'AutoSpray by GPS merupakan inovasi sistem penyemprotan otomatis berbasis GPS Automatic Control Module yang mampu menyesuaikan tekanan secara cerdas melalui rekayasa step-up dan step-down untuk mengatur output pressure pada pompa Vicker. Dilengkapi fitur konfigurasi kecepatan dinamis, sistem ini memastikan penyemprotan lebih efisien, presisi, dan optimal sesuai kondisi operasional di lapangan.',
        benefit: 'Efisiensi Operational : Mengurangi konsumsi bahan bakar dan juga air melalui mekanisme automatic sprayer yang optimal\nAkurasi penyiraman : konfigurasi dengan jarak standard penyiraman dan GPS membantu menjaga jarak penyiraman sesuai standard\nSafety operator : mengurangi distraction focus pada  operator pada saat mengoperasikan unit  dengan system automatic sprayernya\nReduce cost maintenance : menjaga lifetime komponen attachment menjadi lebih tahan lama dengan rekayasa pressure constant pada pompa vicker',
        expertYangTerlibat: '-Ahmad Dinka\n-Widaryanto\n-Alfian Rahman\n-Vebryan Eka'
      },
      {
        namaKarya: 'Realtime Operator Guidance (ROG) using Adaptive Machine Learning',
        deskripsiSingkat: 'Realtime Operator Guidance (ROG) merupakan sistem yang dibangun menggunakan pendekatan adaptive machine learning yang bertujuan untuk mengoptimalkan efisiensi operasional armada dumptruck di area pertambangan melalui pendekatan berbasis kecerdasan buatan.\n\nMelalui algoritma adaptive learning, model mampu menyesuaikan parameter prediksi secara dinamis terhadap perubahan lingkungan dan pola berkendara operator.\n\nSistem dapat memberikan rekomendasi operasional secara langsung untuk mendukung pengambilan keputusan di level operator, meningkatkan produktivitas, serta menurunkan risiko kesalahan manusia.',
        benefit: 'Average Fuel Saving per month: 207,200 liter/bulan\n\nAverage Dumptruck Productivity Increase : 6%',
        expertYangTerlibat: '-Sukrisno\n-Ikhsan Maulana\n-Muthia Sukma'
      },
      {
        namaKarya: 'TOOL D-GMC',
        deskripsiSingkat: 'Tool yang menangkap parameter pressure secara digital secara portable yang bisa dipasang di checkport tertentu yang mempermudah mekanik dalam melakukan GMC yang sebelumnya ditulis manual menjadi otomatis output data dalam format excell',
        benefit: 'Dengan berat tool menjadi 11 kg maka dapat mengurangi kemungkinan cedera LBP pada saat pengangkatan\nDengan GMC didalam kabin maka kemungkinan adanya insiden jatuhnya mekanik saat unit bergerak akan berkurang dan secara matrix resiko menjadi RENDAH\nMengurangi jumlah mekanik untuk aktifitas GMC sebanyak 60%\nDengan D-GMC maka miss komunikasi antara opertor dengan eksekutor GMC menjadi lebih kecil\nDengan D-GMC proses reporting data GMC menjadi lebih cepat karena mereduce pencatatan data sebanyak 242 menjadi otomatis dan secara leadtime GMC dapat mereduce watu GMC sebesar 83%\nReduce Fuel akibat GMC lebih cepat mencapai 10.725 liter Pertahun\nPotensial benefit Improvement NQI sebesar Rp 3.354.014.370',
        expertYangTerlibat: '-Made Arya Dharmawan\n-Agus Sugihartono\n-Nanang Dwi Prasetyo\n-Mohamad Iswaji\n-Tofik Junirianto'
      },
      {
        namaKarya: 'Perforated Pipe in Soft Soil Area',
        deskripsiSingkat: 'Mitigasi Longsor pada Area Tanah Lunak Menggunakan Perforated Pipe',
        benefit: 'Mengurangi potensi insiden dan risiko geoteknik di area Disposal Rawa\nMenambah coverage area disposal rawa seluas 72 Ha\nMenghilangkan potensi loss revenue sebesar 28.11 Juta USD',
        expertYangTerlibat: '-Frantan Butar Butar\n-Resi Yogie Baskoro\n-Andira Chiesa Prawidya\n-Luhur Devan Syah\n-Ajiprabhawa Sukmajaya\n-Dzikra Zhafira\n-Agathon Azis Parenza'
      }
    ]
  },
  UT: {
    projects: [
      {
        namaKarya: 'VR Preventive Maintenance',
        deskripsiSingkat: 'Mensimulasikan proses preventive maintenance pada alat berat secara interaktif dan realistis',
        benefit: 'Media ini membantu meningkatkan keterampilan teknis dan kesiapan kerja dengan cara yang menarik, aman, dan efisien.',
        expertYangTerlibat: '-TCDE'
      },
      {
        namaKarya: '3D Printing',
        deskripsiSingkat: 'Komponen alat berat yang dibuat dala versi kecil sehingga mudah untuk dibawa kedalam kelas',
        benefit: 'Melalui model visual interaktif atau fisik, peserta didik dapat mempelajari fungsi, prinsip kerja, serta hubungan antar komponen dalam proses pencetakan tiga dimensi',
        expertYangTerlibat: '-TCDE'
      },
      {
        namaKarya: 'Augmented Reality',
        deskripsiSingkat: 'Teknologi untuk scan 3D printing sehingga menghasilkan informasi yang detail dan mudah dipahami siswa',
        benefit: 'Memudahkan siswa untuk mempelajari alat berat dengan pendekatan yang realistis',
        expertYangTerlibat: '-TCDE'
      }
    ]
  },
  UTPE: {
    projects: [
      {
        namaKarya: 'Hydrogen Hybrid Tower Lamp',
        deskripsiSingkat: 'Tower Lamp yang ditenagai oleh Solar Panel dan Hydrogen secara bergantian yang dikontrol oleh Smart Hybrid Energy Management dengan waktu delay yang sangat minim (hampir tidak ada kedip) antara Solar PV & Fuel Cell Hydrogen',
        benefit: 'Zero Emission (ESG Compliant), exhaust only vapour water\n100% renewable & abundant Energy\nSilent Operation',
        expertYangTerlibat: 'Energy & Processing Engineer, Electrical Engineer, Industrial Design Engineer, Structure & Material Engineer, Fluid Power Technology Engineer, Prototype & Testing Engineer'
      },
      {
        namaKarya: 'Next Gen Tug Boat (Orca)',
        deskripsiSingkat: 'Kapal penarik (tugboat) dengan desain futuristic yang dipasangkan dengan tongkang (barge) untuk mendukung aktivitas pengangkutan di perairan dangkal dan dalam dengan kapasitas daya 2x1100 HP.',
        benefit: 'Heavy-duty hull design ensuring high bollard pull and reduced water resistance\nSuitable for towing across varied waterways\nIntegrated solar panels and Battery Energy Storage System (BESS) for sustainable operations (ESG Compliant)',
        expertYangTerlibat: 'Naval Architec Engineer, Propultion System Engineer, Marine Engineer, Industrial Design Engineer, Electrical Engineer, Structure & Material Engineer, Marine Piping & Hydraulic Engineer, Process Engineer, Application Engineer'
      },
      {
        namaKarya: 'Intellegent Monitoring System',
        deskripsiSingkat: 'Sistem yang berkontribusi pada efisiensi operasi perusahaan dengan memantau berbagai aspek seperti Aset Management (mesin produksi) dan Energy Management (listrik, bahan bakar, gas, dan air) dengan menggabungkan teknologi canggih seperti Machine Learning untuk keperluan prediction & monitoring.',
        benefit: 'Reduces unplanned downtime\nLowers unnecessary preventive maintenance costs\nProvides real-time visibility into machine conditions\nExtends the lifespan of machine assets',
        expertYangTerlibat: 'Electrical & Automation Engineer, Electrical Engineer, Material Preparation Engineer, Industrial Engineer'
      },
      {
        namaKarya: 'X-Pro OB Vessel (HD 785)',
        deskripsiSingkat: 'Produk bak angkut untuk mengangkut material Overburden (OB)  pada sektor mining dengan kapasitas mencapai 70 Cu.M yang dipasangkan pada Komatsu HD785-7',
        benefit: '17% higher productivity than standard vessels\n16% lighter than than conventional body designs\nRounded body minimizes material carryback',
        expertYangTerlibat: 'Vessel Engineer, Fabrication Engineer Structure & Material Engineer, Application Engineer, Testing Engineer'
      },
      {
        namaKarya: 'Anti Sticky Vessel (DV27 + HM400)',
        deskripsiSingkat: 'Produk bak angkut anti lengket untuk mengangkut material Nickel  & Overburden (OB)  pada sektor mining dengan kapasitas mencapai 30 Cu.M yang dipasangkan pada Articulated Truck Komatsu HM400',
        benefit: 'Specially designed for sticky materials (e.g., nickel) to improve productivity\nReduces carry-back by over 50% compared to standard vessels\nOptimized load distribution for maximum safety and stability',
        expertYangTerlibat: 'Vessel Engineer, Fabrication Engineer Structure & Material Engineer, Application Engineer, Testing Engineer'
      },
      {
        namaKarya: 'Double Trailer SST (Scania + Dolly)',
        deskripsiSingkat: 'Produk trailer gandeng (double) untuk mengangkut Batubara pada sektor mining dengan metode tipping (buang muatan) ke samping (side door). Kapasitas angkut mencapai 110 + 125 Cu.M yang dipasangkan pada Medium Trucks (Prime Mover) Scania',
        benefit: 'High productivity – up to 211.5 tons\nReduced carry-back with optimized trailer body contour during tipping\nFlexible tipping conditions using rubber for enhanced adaptability',
        expertYangTerlibat: 'Trailer Engineer, Fabrication Engineer Structure & Material Engineer, Application Engineer, Testing Engineer'
      }
    ]
  },
  KRA: {
    projects: [
      {
        namaKarya: 'Main pump Leak Tester',
        deskripsiSingkat: 'Leak tester tool yang dapat digunakan untuk menentukan Main Pump mana yang mengalami kebocoran dari oil seal di unit tanpa harus dismounting Main Pump 2, Main Pump 2 ataupun Swing Pump',
        benefit: 'Mengurangi potensi mis-troubleshooting & increase customer satisfaction',
        expertYangTerlibat: '-Yordan, Feliks Adiretus T'
      },
      {
        namaKarya: 'Additional air strainer on Engine HD785-7',
        deskripsiSingkat: 'Penambahan konfigurasi berupa Air Strainer di air system Engine HD785-7 untuk mencegah foreign material masuk ke ruang bakar dan mengakibatkan kerusakan (countermeasure atas beberapa failure product yang diakibatkan oleh foreign material)',
        benefit: 'Reducing product failure & increase customer satisfaction',
        expertYangTerlibat: '-Dwi Yuliyanto, Sumianto'
      },
      {
        namaKarya: 'Retube Front Suspension',
        deskripsiSingkat: 'Aktivitas kolaborasi dengan Komatsu Indonesia guna meminimalisir potensi pengantian baru pada retube yang mengalami scratch dengan memanfaatkan metode salvage.',
        benefit: 'Menghasilkan pengurangan biaya tambahan dan peningkatan nilai tambah bagi kepuasan customer',
        expertYangTerlibat: '-G. Yudha Fitria'
      },
      {
        namaKarya: 'Surface Method on Top Surface Cylinder Block',
        deskripsiSingkat: 'Melakukan pengembangan metode salvage dengan pemanfaatan teknologi metal spray pada komponen cylinder block yang mengalami kausan pada permukaannya. Project ini Adalah pengembangan dari project terdahulu yakni dengan meminimalisir cost penggantian new part pada permukaan hasil surface yang tingginya underlimit.',
        benefit: 'Menghasilkan pengurangan biaya tambahan dan peningkatan nilai tambah bagi kepuasan customer',
        expertYangTerlibat: '-Reskia Budi\n-Hari NC.\n-Meilati PM'
      },
      {
        namaKarya: 'Axle Housing',
        deskripsiSingkat: 'Melakukan pendekatan teknologi pengelasan pada part yang mengalami crack pada bagian drain plug sehingga dapat digunakan kembali',
        benefit: 'Menghasilkan pengurangan biaya tambahan dan mensupport LCC competitiveness bagi customer',
        expertYangTerlibat: '-Ahmad Ridho A.\n-Reskia Budi'
      }
    ]
  },
  AA: {
    projects: [
      {
        namaKarya: 'Autowrite (Automation Risk Assessment in Underwriting Process)',
        deskripsiSingkat: 'Autowrite adalah sistem berbasis web yang dikembangkan oleh expert Asuransi Astra (Underwriter) yang secara otomatis menghitung indicative insurance premium (perkiraan premi asuransi).\n\nAutowrite meningkatkan produktivitas expert dengan kemampuannya melakukan analisis risiko pada kategori simple risk, sehingga expert dapat lebih fokus untuk melakukan analisis risiko yang lebih kompleks.\n\nDengan kemampuan perhitungan otomatis dan real-time, tim marketing dapat langsung melakukan simulasi premi kepada pelanggan, tanpa harus menunggu perhitungan awal dari expert. Hal ini membuat proses penawaran menjadi jauh lebih cepat sesuai harapan pelanggan.\n\nDengan Autowrite, proses akseptasi risiko menjadi lebih cepat, akurat, dan efisien — baik bagi expert, marketing, dan pelanggan.',
        benefit: 'Menghemat 50% waktu perhitungan indicative insurance premium untuk kategori simple risk\n\nMeningkatkan jumlah penutupan asuransi untuk kategori simple risk hingga 20%',
        expertYangTerlibat: '-Viranty Pradani\n-Agatha Michelle Lionard'
      },
      {
        namaKarya: 'Tools Perhitungan Kecukupan Alat Proteksi Kebakaran',
        deskripsiSingkat: 'Tools ini berfungsi untuk menghitung secara otomatis kebutuhan sistem proteksi kebakaran pada suatu objek pertanggungan, sehingga menghilangkan proses perhitungan manual yang memerlukan waktu dan berpotensi menimbulkan kesalahan.\nTools ini dikembangkan dengan mengacu pada standar sistem proteksi kebakaran yang ditetapkan oleh National Fire Protection Association (NFPA), sehingga output perhitungannya memiliki tingkat validitas dan reliabilitas yang tinggi dalam menilai kecukupan sistem proteksi kebakaran yang diperlukan.\nDengan demikian, tools ini mendukung proses analisis risiko yang lebih cepat dan akurat.',
        benefit: 'Menghemat 96% waktu perhitungan kecukupan sistem proteksi kebakaran,\nMeminimalisir potensi human error saat melakukan perhitungan',
        expertYangTerlibat: '-Bayukarsa Ramadhan Arif T\n-Dimas Briandy'
      }
    ]
  }
} as const

// Helper function to get booth code from booth ID
export const getBoothCode = (boothId: string): string | null => {
  const mapping: Record<string, string> = {
    '12a52905-c6c5-408c-b12a-568c5a600eaf': 'AHM',
    '4da08db7-0db4-4b84-966c-ea9d974671c0': 'UTPE',
    '610072db-c561-4de6-99c1-ea12d0e5aa63': 'PAMA',
    '73dd86e3-b5c8-4a3a-b90c-b4abc0a09714': 'UT',
    '78ef5a3e-4d60-4b3e-a139-1101ce041298': 'AA',
    '81c20c06-1742-4e8e-97c4-277cdca9be91': 'TTA',
    '8f31cc0b-7031-4a2c-9dc3-a762fc77f0d6': 'KRA',
    '93f6eb05-6a66-47d6-964e-3393d3ef85ad': 'AAL',
    '97458e29-dac0-40be-bcf5-a3d82c7848dc': 'AOP',
    'a8508212-99b7-4a4f-9f88-a33415a7b370': 'AGIT',
    'f96b982c-c5f6-4ab9-8e8f-e800d357dc07': 'IAMI',
    'fcd6f56e-7b43-44a1-b3b4-adebbfad10bd': 'ADM',
  }
  return mapping[boothId] || null
}

// Helper function to get booth content by booth ID
export const getBoothContent = (boothId: string): BoothContent | null => {
  const boothCode = getBoothCode(boothId)
  if (!boothCode) return null
  return BOOTH_CONTENTS[boothCode] || null
}
