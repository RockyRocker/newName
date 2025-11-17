
export default class ProductPortfolio {
    constructor() {
    this.combinations = [];
  }

    addCombination(combination) {
    this.combinations.push(combination);
  }
    returnCombination(){
      return this.combinations
    }
}
