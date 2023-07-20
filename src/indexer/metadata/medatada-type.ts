export interface Metadata {
    name:        string;
    description: Description;
    image:       string;
    dna:         string;
    edition:     number;
    date:        number;
    attributes:  [Background, Clothes, Type, Headwear, Eyes, Moustache];
}

export type Attribute = Background | Clothes | Eyes | Headwear | Moustache | Type;

export interface Background{
    trait_type: "Background";
    value:      BackgroundAtribute;
}

export interface Clothes{
    trait_type: "Clothes";
    value:      ClothesAtribute;
}

export interface Eyes{
    trait_type: "Eyes";
    value:      EyesAtribute;
}

export interface Headwear{
    trait_type: "Headwear";
    value:      HeadwearAtribute;
}

export interface Moustache{
    trait_type: "Moustache";
    value:      MoustacheAtribute;
}

export interface Type{
    trait_type: "Type";
    value:      TypeAtribute;
}

export enum TraitType {
    Background = "Background",
    Clothes = "Clothes",
    Eyes = "Eyes",
    Headwear = "Headwear",
    Moustache = "Moustache",
    Type = "Type",
}



export enum BackgroundAtribute {
    Brown = "Brown",
    Gray = "Gray",
    Blue = "Blue",
    Pink = "Pink",
    Yellow = "Yellow",
    Orange = "Orange",
    Mint = "Mint",
    Fuchsia = "Fuchsia",
    DarkBlue = "Dark Blue",
    Lime = "Lime",
    DarkGray = "Dark Gray",
    MoneyGreen = "Money Green",
    Purple = "Purple",
    VividYellow = "Vivid Yellow",
}

export enum ClothesAtribute {
    GreenBowTie = "Green Bow Tie",
    GreyBowTie = "Grey Bow Tie",
    Spruce = "Spruce",
    ClassicBowTie = "Classic Bow Tie",
    WhiteBowTie = "White Bow Tie",
    DeepBlueSimple = "Deep Blue Simple",
    SpacesuitBlack = "Spacesuit Black",
    GreenMoney = "Green Money",
    Pumpkin = "Pumpkin",
    PinkBowTie = "Pink Bow Tie",
    CianBowTie = "Cian Bow Tie",
    BTCBowTie = "BTC Bow Tie",
    GreyBTC = "Grey BTC",
    SpacesuitWhite = "Spacesuit White",
    BlackBTCBowTie = "Black BTC Bow Tie",
    ATM = "ATM",
    Army = "Army",
    BlueBowTie = "Blue Bow Tie",
    BlueHoodie = "Blue Hoodie",
    CreamCardigan = "Cream Cardigan",
    DeepBlueBowTie = "Deep Blue Bow Tie",
    MyProShirt = "MyPro Shirt",
    OffShoreHoodie = "Off-Shore Hoodie",
    OrangeBowTie = "Orange Bow Tie",
    PinkCardigan = "Pink Cardigan",
    PinkNYellowBowTie = "Pink n Yellow Bow Tie",
    RacksShirt = "Racks Shirt",
    RedBTC = "Red BTC",
    RukaShirt = "Ruka Shirt",
    SpainBTCBowTie = "Spain BTC Bow Tie",
    SteelBlue = "Steel Blue",
    VivaRacksMafia = "Viva Racks Mafia",
}

export enum EyesAtribute {
    Classic = "Classic",
    Anime = "Anime",
    Kawaii = "Kawaii",
    Dead = "Dead",
    Small = "Small",
    Hollow = "Hollow",
    WallStreet = "Wall Street",
    Bad = "Bad",
    BadYellow = "Bad Yellow",
    BTC = "BTC",
    Laser = "Laser",
    HollowLaser = "Hollow Laser",
    BadBlue = "Bad Blue",
    HollowBTC = "Hollow BTC",
    Party = "Party",
}

export enum HeadwearAtribute {
    GreenHat = "Green Hat",
    SpruceHat = "Spruce Hat",
    WhiteHat = "White Hat",
    OrangeHat = "Orange Hat",
    ClassicHat = "Classic Hat",
    BTCWhiteCap = "BTC White Cap",
    BTCBlackCap = "BTC Black Cap",
    CianHat = "Cian Hat",
    MintHat = "Mint Hat",
    PinkHat = "Pink Hat",
    VividGreenHat = "Vivid Green Hat",
    PurbleBeanie = "Purple Beanie",
    XmasBeanie = "Xmas Beanie",
    OrangeBeanie = "Orange Beanie",
    McHodlerRedCap = "McHodler Red Cap",
    BlondeHair = "Blonde Hair",
    WhiteHair = "White Hair",
    BTCHat = "BTC Hat",
    McHodlerBlackCap = "McHodler Black Cap",
    TrumpHair = "Trump Hair",
    Dreadlocks = "Dreadlocks",
    Hoodie = "Hoodie",
    GradientHaircut = "Gradient Haircut",
    BTCRedCap = "BTC Red Cap",
    Bald = "Bald",
    BitBaseHat = "BitBase Hat",
    BlondeStyledHair = "Blonde Styled Hair",
    BlueHat = "Blue Hat",
    DeepBlueHat = "Deep Blue Hat",
    DemonHorns = "Demon Horns",
    HelicopterHat = "Helicopter Hat",
    JesusCrypt = "Jesus Crypt",
    LineHaircut = "Line Haircut",
    LongBlondeHair = "Long Blonde Hair",
    LongDarkHair = "Long Dark Hair",
    MyProCap = "MyPro Cap",
    PinkNYellowHat = "Pink n Yellow Hat",
    RedBeanie = "Red Beanie",
    RedHat = "Red Hat",
    SpainHat = "Spain Hat",
    StyledBrownHair = "Styled Brown Hair",
    WillyBeret = "Willy Beret",
}

export enum MoustacheAtribute {
    Classic = "Classic",
    WhiteMoustache = "White Moustache",
    Cigar = "Cigar",   
    Tonge = "Tonge",
    Smile = "Smile",
    SmileCigar = "Smile Cigar",
    BlackMoustache = "Black Moustache",
    CigarSimple = "Cigar Simple",
    Depilated = "Depilated",
    SimpleCigar = "Simple Cigar",
    BeardTonge = "Beard Tonge",
    Black = "Black ",
    MintTonge = "Mint Tonge",
    SkullMouth = "Skull Mouth",
}

export enum TypeAtribute {
    Human = "Human",
    Alien = "Alien",
    Zombie = "Zombie",
    Monkey = "Monkey",
    Panda = "Panda",
    Cat = "Cat",
    Martian = "Martian",
    MrSkull = "Mr. Skull",
    Nsujpg = "NSUJPG",
}

export enum Description {
    TheOfficialRACKSNFTCollection = "The official RACKS® NFT collection",
}

