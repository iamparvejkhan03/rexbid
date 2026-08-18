import darkLogo from './darkLogo.webp';
import logo from './logo.webp';
import heroImg from './heroImg.webp';
import contactUs from './contactUs.webp';
import menuIcon from './menuIcon.svg';
import closeMenu from './closeMenu.svg';
import dummyUserImg from './dummyUserImg.webp';
import liveAuctions from './liveAuctions.webp';
import soldAuctions from './soldAuctions.webp';
import endingSoonAuctions from './endingSoonAuctions.webp';
import upcomingAuctions from './upcomingAuctions.webp';
import spinner from './spinner.png';
import whoWeAre from './whoWeAre.webp';
import about from './about.webp';

// ✅ Machinery Brand Logos (PascalCase)
import CaseIH from './CaseIH.webp';
import Claas from './claas.webp';
import Cummins from './Cummins.webp';
import Fendt from './Fendt.webp';
import Freightliner from './Freightliner.webp';
import Hitachi from './Hitachi.webp';
import JCB from './JCB.webp';
import JohnDeere from './JohnDeere.webp';
import Komatsu from './Komatsu.webp';
import Kubota from './Kubota.webp';
import Liebherr from './Liebherr.webp';
import MasseyFerguson from './MasseyFerguson.webp';
import Mercedes from './mercedes.webp';
import NewHolland from './NewHolland.webp';
import NokianTyres from './NokianTyres.webp';
import Peterbilt from './Peterbilt.webp';
import Scag from './Scag.webp';
import Skania from './Skania.webp';
import Stiga from './Stiga.webp';
import Timberjack from './Timberjack.webp';
import Toro from './Toro.webp';
import Toyota from './Toyota.webp';
import Volvo from './volvo.webp';
import aboutCar from './aboutCar.webp';
import aboutDigger from './aboutDigger.webp';
import aboutExcavator from './aboutExcavator.webp';
import aboutHandle from './aboutHandle.webp';
import aboutTractor from './aboutTractor.webp';

function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

const otherData = {
    phone: '872039257',
    email: 'admin@rexbid.ie',
    address: 'Ireland',
    phoneCode: '+353',
    brandName: 'RexBid',
    formatPhone
}

export {
    otherData,
    about,
    darkLogo,
    logo,
    heroImg,
    menuIcon,
    closeMenu,
    contactUs,
    dummyUserImg,
    liveAuctions,
    soldAuctions,
    endingSoonAuctions,
    upcomingAuctions,
    spinner,
    whoWeAre,

    // ✅ Export machinery brands
    CaseIH,
    Claas,
    Cummins,
    Fendt,
    Freightliner,
    Hitachi,
    JCB,
    JohnDeere,
    Komatsu,
    Kubota,
    Liebherr,
    MasseyFerguson,
    Mercedes,
    NewHolland,
    NokianTyres,
    Peterbilt,
    Scag,
    Skania,
    Stiga,
    Timberjack,
    Toro,
    Toyota,
    Volvo,
    aboutCar,
    aboutDigger,
    aboutExcavator,
    aboutHandle,
    aboutTractor
};