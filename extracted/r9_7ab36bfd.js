// Panellist bios + roles. Regulars and verifiable guests get real bios.
// Less-public panellists are honestly labeled "Guest contributor" with no fabricated info.

window.PANELLISTS = {
  // --- Newslaundry regulars ---
  "Abhinandan Sekhri": {
    role: "Co-founder & CEO · Hafta regular",
    bio: "Co-founder and chief executive of Newslaundry. Hosts Hafta and has been the show's anchor since its earliest episodes. A long-time critic of Indian newsroom culture and a vocal proponent of subscriber-funded journalism.",
  },
  "Manisha Pande": {
    role: "Executive Editor · Hafta regular",
    bio: "Executive editor at Newslaundry. Anchors TV Newsance, the channel's flagship media-criticism show. Covers television news, language media, and the politics of headlines. A core Hafta voice.",
  },
  "Jayashree Arunachalam": {
    role: "Editor · Hafta regular",
    bio: "Editor at Newslaundry. Writes and edits across reporting and culture, and is one of Hafta's most frequent panellists. Recommendations tend to lean books, prestige TV, and the occasional sharp podcast.",
  },
  "Anand Vardhan": {
    role: "Senior Editor · Hafta regular",
    bio: "Senior editor at Newslaundry. Writes on Hindi-language media, political history, and the long arc of Indian public life. Brings the heaviest reading-list of the panel.",
  },
  "Raman Kirpal": {
    role: "Editor at large · Hafta regular",
    bio: "Editor at large at Newslaundry. A longtime investigative journalist whose reporting has covered finance, politics, and accountability. Frequent Hafta voice on the political week.",
  },
  "Shardool Katyayan": {
    role: "Editor · Hafta regular",
    bio: "Editor at Newslaundry covering Hindi-language news, politics, and the cultural turn of the Hindi belt. Hafta regular.",
  },
  "Pooja Prasanna": {
    role: "Editor, South · Hafta regular",
    bio: "Editor at Newslaundry, leading South India coverage and co-host of South Central. Reports on Tamil Nadu, Karnataka, and Kerala politics, and the southern film economies.",
  },
  "Dhanya Rajendran": {
    role: "Editor-in-chief, The News Minute · Hafta x South Central",
    bio: "Editor-in-chief and co-founder of The News Minute. Covers South Indian politics, gender, and newsroom power. Joins the joint Hafta x South Central episodes.",
  },
  "Nidhi Suresh": {
    role: "Reporter · Hafta regular",
    bio: "Reporter at Newslaundry. Has covered Manipur extensively, along with caste, communal violence, and the underside of police narratives. Speaks on Hafta when on field assignment recaps.",
  },
  "Sumedha Mittal": {
    role: "Reporter · Hafta regular",
    bio: "Reporter at Newslaundry. Covers gender, justice, and reportage from outside the metro frame. Hafta panellist.",
  },

  // --- Verifiable guests ---
  "Mujib Mashal": {
    role: "South Asia Bureau Chief, The New York Times",
    bio: "South Asia bureau chief for The New York Times, based in New Delhi. Reports across India, Pakistan, Afghanistan, and Bangladesh, with a long focus on conflict and political transitions.",
  },
  "Suhasini Haidar": {
    role: "Diplomatic Affairs Editor, The Hindu",
    bio: "Diplomatic affairs editor at The Hindu. Reports on Indian foreign policy, the neighbourhood, and the slow-moving plates of multilateral diplomacy. Frequent television commentator on India's external relations.",
  },
  "T.M. Krishna": {
    role: "Carnatic vocalist · public intellectual",
    bio: "Carnatic vocalist, writer, and public intellectual. Author of A Southern Music. Has long argued for a more democratic, less caste-bound concert culture, and writes on the politics of art.",
  },
  "Ajai Shukla": {
    role: "Defence analyst · former Colonel, Indian Army",
    bio: "Defence and strategic affairs analyst, columnist, and consulting editor for strategic affairs at Business Standard. A former Colonel in the Indian Army.",
  },
  "Ishaan Tharoor": {
    role: "Foreign Affairs columnist, The Washington Post",
    bio: "Foreign affairs columnist for The Washington Post, where he writes the Today's WorldView column. Covers the global political weather with a particular ear for democratic backsliding.",
  },
  "Vrinda Grover": {
    role: "Lawyer · human rights advocate",
    bio: "Senior advocate practising in the Supreme Court of India. Works on human rights, gender violence, custodial torture, and the long shadow of laws like UAPA and AFSPA.",
  },
  "Reetika Khera": {
    role: "Development economist · IIT Delhi",
    bio: "Development economist and professor at IIT Delhi. Has worked extensively on welfare programmes — NREGA, the public distribution system, Aadhaar — and on the data politics that surround them.",
  },
  "Sudhir Mishra": {
    role: "Filmmaker",
    bio: "Filmmaker. Hazaaron Khwaaishein Aisi, Chameli, Daas Dev. Has spent four decades writing and directing Hindi cinema with a political register most of the industry avoids.",
  },
  "Govind Ethiraj": {
    role: "Founder, IndiaSpend & BOOM",
    bio: "Founder of IndiaSpend, the data-journalism non-profit, and BOOM, the fact-checking newsroom. A long-time business journalist before he turned to civic data work.",
  },
  "Amba Kak": {
    role: "Executive Director, AI Now Institute",
    bio: "Co-executive director of the AI Now Institute. Works on AI policy, technology accountability, and the regulatory architecture around large platforms. Indian background, US-based.",
  },
  "Santosh Desai": {
    role: "Columnist · brand strategist",
    bio: "Columnist and brand strategist. Writes the long-running City City Bang Bang column and is the author of Mother Pious Lady, a book of essays on the changing Indian middle class.",
  },
  "Sreenivasan Jain": {
    role: "Journalist · author",
    bio: "Journalist and former managing editor at NDTV, where he anchored Truth vs Hype. Has reported on communal violence, the politics of inquiry, and the slow corruption of the Indian newsroom.",
  },
  "Bashir Ali Abbas": {
    role: "Foreign-policy researcher",
    bio: "Researcher in international affairs, focusing on India's engagement with West Asia and the geopolitics of the Indian Ocean. Writes for Indian and international policy publications.",
  },
  "Fahad Zuberi": {
    role: "Architect · writer on the built environment",
    bio: "Architect and writer. Reports on architecture, urbanism, and how Indian public spaces are being remade — including the new Parliament building and the Central Vista redevelopment.",
  },
  "Kallol Bhattacherjee": {
    role: "Diplomatic correspondent, The Hindu",
    bio: "Diplomatic correspondent at The Hindu. Covers India's foreign policy, with a particular focus on the neighbourhood — Bangladesh, Nepal, Sri Lanka, the Maldives.",
  },
  "Sudipto Mondal": {
    role: "Editor, The News Minute · Hafta x South Central",
    bio: "Editor at The News Minute. Has reported on Dalit politics, the Hindu Right, and police impunity. Joins the Hafta x South Central episodes.",
  },
  "Nikhil Inamdar": {
    role: "Business journalist, BBC News",
    bio: "Business journalist at BBC News, based in Mumbai. Writes on Indian markets, the startup economy, and the political economy of Indian business.",
  },
  "Shaun Tandon": {
    role: "Diplomatic correspondent, AFP",
    bio: "Diplomatic correspondent for Agence France-Presse, based in Washington. Covers US foreign policy, including its long entanglement with South Asia.",
  },

  // --- Honest "guest contributor" placeholders ---
  "Anuradha": { role: "Guest contributor", bio: null },
  "Arghya": { role: "Guest contributor", bio: null },
  "Aishwaria": { role: "Guest contributor", bio: null },
  "Aditya": { role: "Guest contributor", bio: null },
  "Mridul Dudeja": { role: "Guest contributor", bio: null },
  "Amit Kumar": { role: "Guest contributor", bio: null },
  "Shobana K Nair": { role: "Guest contributor", bio: null },
  "Aniruddh Menon": { role: "Guest contributor", bio: null },
  "Chander Shekhar Luthara": { role: "Guest contributor", bio: null },
};
