import { faTired, faSurprise, faSadTear, faSmileBeam, faAngry, faDizzy, faGrimace, faMeh,  } from "@fortawesome/free-solid-svg-icons";

const map = {
    angry: {
        pt: 'bravo',
        accurance: .2,
        icon: faAngry,
        color: '#bd2600'
    },
    disgusted: {
        pt: 'nojo',
        accurance: .05,
        icon: faDizzy,
        color: '#168a01'
    },
    fearful: {
        pt: 'assustado',
        accurance: .1,
        icon: faGrimace,
        color: '#91a38e'
    },
    happy: {
        pt: 'feliz',
        accurance: .7,
        icon: faSmileBeam,
        color: '#dbc500'
    },
    neutral: {
        pt: 'neutro',
        accurance: 1,
        icon: faMeh,
        color: '#a69e55'
    },
    sad: {
        pt: 'triste',
        accurance: .3,
        icon: faSadTear,
        color: '#00afc9'
    },
    suprised: {
        pt: 'surpreso',
        accurance: .2,
        icon: faSurprise,
        color: '#a16dbf'
    }
}

export default map;