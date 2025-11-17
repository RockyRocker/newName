export default class Combination {
  constructor(number, trueName) {
    this.number = number; // ex. 1
    this.trueName = trueName; // ex. ME/MA 144 - Bänkskåp med lådor och innerlådor
    this.width = ""
    this.displayName = "none";
    this.warrenty = "none";
    this.cabType = "none";
    this.nrOfDrawerFronts = 0;
    this.nrOfDrawers = 0;
    this.nrOfInner = 0;
    this.nrOfDoors = 0;
    this.nrOfGlassDoors = 0;
    this.nrOfShelfs = 0;
    this.builtInCab = false;
    this.prefix = [
      { sink: false },
      { hob: false },
      { oven: false },
      { micro: false },
      { combi: false },
      { fride: false },
      { freezer: false }
    ]
    this.articles = [];
    
  }

  addArticle(article) {
    this.articles.push(article);
  }
  addWarrentyArt(artNr){
    this.warrenty.push(artNr)
  }
  returnWarrentyArt(){ return this.warrenty}
}
