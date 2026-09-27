const stadiumImages = [
  "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/9ed01db78013461c8fe9c18647c23c6f_9366/FC_Bayern_26-27_Home_Jersey_Red_KQ6513_21_model.jpg",
  "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/ec510485e4b940b2877851bef52808bf_9366/FC_Bayern_26-27_Home_Jersey_Red_KQ6513_23_hover_model.jpg",
  "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/cc7690f014f6468fb36ed92bb674878e_9366/FC_Bayern_26-27_Home_Jersey_Red_KQ6513_25_model.jpg",
];

const authenticImages = [
  "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/b7d338cceae945aa983a8f391b72bd0c_9366/FC_Bayern_26-27_Home_Authentic_Jersey_Red_JZ3070_HM51.jpg",
  "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/ad8fb42b7318496d8cd501bbdae0eb16_faec/FC_Bayern_26-27_Home_Authentic_Jersey_Red_JZ3070_HM3.tiff.jpg",
  "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/37b3f7123a4d4ea9877d4051bb1a58cb_9366/FC_Bayern_26-27_Home_Authentic_Jersey_Red_JZ3070_HM4.jpg",
];

const common = {
  groupId: "FCB-2627-HOME",
  brand: "Adidas",
  category: "Bundesliga",
  kitType: "home",
  activity: "football",
  originalPrice: 0,
  quantity: 20,
  isActive: true,
  tag: ["2026/27 OFFICIAL FC BAYERN HOME KIT", "New Arrival"],
};

export const BAYERN_HOME_PRODUCTS = [
  {
    ...common,
    sku: "KQ6513",
    edition: "Stadium Edition",
    fit: "regular",
    name: "FC Bayern 26/27 Home Jersey",
    description: "FC Bayern 26/27 home stadium jersey in the club's signature red.",
    price: 2990,
    images: stadiumImages,
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    ...common,
    sku: "JZ3070",
    edition: "Player Edition",
    fit: "slim",
    name: "FC Bayern 26/27 Home Authentic Jersey",
    description: "FC Bayern 26/27 authentic home jersey, matching the player version.",
    price: 4500,
    images: authenticImages,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  },
];
