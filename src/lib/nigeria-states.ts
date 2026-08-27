export interface StateData {
  name: string;
  code: string;
  lgas: string[];
  postalCode: string;
}

export const nigeriaStates: StateData[] = [
  { name: "Lagos", code: "LA", lgas: ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"], postalCode: "100001" },
  { name: "Abuja", code: "FC", lgas: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"], postalCode: "900001" },
  { name: "Ogun", code: "OG", lgas: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu Ode", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Sagamu", "Yewa North", "Yewa South"], postalCode: "110001" },
  { name: "Oyo", code: "OY", lgas: ["Afijio", "Akinyele", "Atiba", "Atigbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"], postalCode: "200001" },
  { name: "Rivers", code: "RI", lgas: ["Port Harcourt", "Obio-Akpor", "Ikwerre", "Emohua", "Ogba-Egbema-Ndoni", "Oyigbo", "Tai", "Gokana", "Khana", "Andoni", "Opobo-Nkoro", "Bonny", "Degema", "Asari-Toru", "Akuku-Toru", "Brass", "Nembe", "Ogbia", "Sagbama", "Yenagoa"], postalCode: "500001" },
  { name: "Kano", code: "KN", lgas: ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Jibuts", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"], postalCode: "700001" },
  { name: "Kaduna", code: "KD", lgas: ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"], postalCode: "800001" },
  { name: "Anambra", code: "AN", lgas: ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"], postalCode: "400001" },
  { name: "Enugu", code: "EN", lgas: ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"], postalCode: "400001" },
  { name: "Abia", code: "AB", lgas: ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"], postalCode: "440001" },
  { name: "Imo", code: "IM", lgas: ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Nwarru", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"], postalCode: "460001" },
  { name: "Delta", code: "DT", lgas: ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"], postalCode: "320001" },
  { name: "Edo", code: "ED", lgas: ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba-Okha", "Oredo", "Orhionmwon", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"], postalCode: "300001" },
  { name: "Bayelsa", code: "BY", lgas: ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"], postalCode: "560001" },
  { name: "Cross River", code: "CR", lgas: ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"], postalCode: "540001" },
  { name: "Akwa Ibom", code: "AI", lgas: ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Ituk Mbang", "Mbo", "Mkpat Enin", "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung Uko", "Ukanafun", "Uquo", "Uruan", "Uyo"], postalCode: "520001" },
  { name: "Benue", code: "BE", lgas: ["Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Oturkpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"], postalCode: "970001" },
  { name: "Kogi", code: "KG", lgas: ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba Bunu", "Koton Karfe", "Lokoja", "Mopa Muro", "Ofu", "Ogori Magongo", "Okehi", "Okene", "Omalata", "Omi-Egbe", "Oyam", "Yagba East", "Yagba West"], postalCode: "260001" },
  { name: "Kebbi", code: "KB", lgas: ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Birnin Yauri", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"], postalCode: "860001" },
  { name: "Sokoto", code: "SO", lgas: ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"], postalCode: "840001" },
  { name: "Bauchi", code: "BA", lgas: ["Alkaleri", "Bauchi", "Bogoro", "Dass", "Darazo", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", " Toro", "Warji", "Zaki"], postalCode: "740001" },
  { name: "Borno", code: "BO", lgas: ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"], postalCode: "600001" },
  { name: "Yobe", code: "YO", lgas: ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru Potiskum", "Tarmuwa", "Yunusari", "Yusufari"], postalCode: "620001" },
  { name: "Gombe", code: "GO", lgas: ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Talba", "Yamaltu/Deba"], postalCode: "760001" },
  { name: "Taraba", code: "TA", lgas: ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"], postalCode: "670001" },
  { name: "Adamawa", code: "AD", lgas: ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"], postalCode: "640001" },
  { name: "Plateau", code: "PL", lgas: ["Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"], postalCode: "930001" },
  { name: "Niger", code: "NI", lgas: ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Muya", "Pailoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"], postalCode: "920001" },
  { name: "Zamfara", code: "ZM", lgas: ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkum", "Dansadau", "Gummi", "Gusau", "Isah", "Kaura Namoda", "Kiyawa", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Tsafe", "Zurmi"], postalCode: "890001" },
  { name: "Jigawa", code: "JI", lgas: ["Auyo", "Babura", "Birniwa", "Birnin Kudu", "Buji", "Dutse", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari", "Malam Madori", "Miga", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"], postalCode: "730001" },
  { name: "Osun", code: "OS", lgas: ["Aiyedire", "Atakumosa East", "Atakumosa West", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"], postalCode: "230001" },
  { name: "Ekiti", code: "EK", lgas: ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"], postalCode: "370001" },
  { name: "Ondo", code: "ON", lgas: ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"], postalCode: "340001" },
  { name: "Ekiti", code: "EK", lgas: ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"], postalCode: "370001" },
  { name: "Kwara", code: "KW", lgas: ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"], postalCode: "240001" },
];

export function getDeliveryEstimate(stateCode: string): string {
  if (stateCode === "LA") {
    return "1-2 business days";
  }
  return "2-3 business days";
}

export function getLgas(stateName: string): string[] {
  const state = nigeriaStates.find((s) => s.name === stateName);
  return state?.lgas ?? [];
}

export function getPostalCode(stateName: string): string {
  const state = nigeriaStates.find((s) => s.name === stateName);
  return state?.postalCode ?? "";
}
