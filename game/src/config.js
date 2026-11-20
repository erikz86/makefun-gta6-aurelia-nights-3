export const CELL = 320, SIZE = 1920, ROAD = 92;
export const districts = ['Palmera Coast','Port Solano','Mercury Mile','Vista Royale'];
export const district = (x,y) => districts[(x>=960?1:0)+(y>=960?2:0)];
export const places = {
  motel:{x:320,y:395,name:'Mara / Pink Mirage'},
  crew:{x:640,y:390,name:'Inez / Dune Social'},
  vault:{x:960,y:425,name:'Solano Exchange'},
  safe:{x:640,y:735,name:'Dry Dock'},
  club:{x:640,y:1065,name:'Club Mariposa',price:2400,income:180},
  garage:{x:1280,y:1110,name:'Vista Customs',price:3900,income:310},
  tower:{x:1280,y:1375,name:'Meridian Tower'},
  pier:{x:960,y:1645,name:'South Pier'}
};
export const chapters = ['Pink Mirage','The Glass Job','Night Dividend','Eye of the Storm'];
export const objectives = [
  ['Meet Mara at the Pink Mirage','Pick up the keys at Dune Social'],
  ['Recruit Inez at Dune Social','Meet Inez at the Exchange','Take the vault case','Lose the patrol and reach Dry Dock'],
  ['Buy Club Mariposa','Collect your first dividend at the club'],
  ['Meet Mara at Meridian Tower','Deliver the ledger to South Pier']
];

