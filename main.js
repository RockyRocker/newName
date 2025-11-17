import ProductPortfolio from './models/productPortfolio.js'; 
import Combination from './models/combination.js';
import Article from './models/article.js';
import builtInCabinets from './triggerArt.js';
import wInfo from './data/warrantyInfo.js';
import codeLines from './data/staticDescription.js';

const comboSkip = ["täcksida", "Fristående täcksida", "passbit för", "fristående passbit"];
let state = ["LOOKING_FOR_ARTICLE_NAME", 'LOOKING_FOR_DESCRIPTION', 'LOOKING_FOR_ARTICLE_NUMBER', 'LOOKING_FOR_QUANTITY', 'EXISTING_INFO'];
let cabTypes = ["Bänkskåp", "Väggskåp", "Högskåp", "Överskåp", "Bänkhörnskåp", "Vägghörnskåp"];
let artTypes = ["låda", "innerLF", "dörr", "hyllplan", "lådfront", "vitrin"];
let artType = "";
let thisState = "";
let currentProductPortfolio = undefined, currentCombination = undefined, currentArticle = undefined;
let twoForOne = false; 
let seperators = 0; 
let sepCount = -1;
let displayArray = [];
let descriptions = ["Upphängningsskena","Ben och socklar","Täcksidor", "Knoppa, handtag och dörrdämpare","Bänkskiva","Väggplatta","Belysningstillbehör"]



function isCombination(line) { return /^\d{1,2}\. */.test(line); }
function isArticleNumber(line) { return /^\d{3}\.\d{3}\.\d{2}/.test(line); }
function isOnlyUpperCase(line) { return /^[A-ZÅÄÖ]{3,}$/.test(line); }
function isQuantity(line) { return /^\d{1,2}x$/.test(line); }

function handleExisting(line) {
  for (let i = 0; i < codeLines.length; i++) {
    if(line.includes("Anpassat")) return false;
    const code = codeLines[i].split("_");
    const regex = new RegExp(`\\b${code[1]}\\b`);
    if (regex.test(line)) {
      currentCombination.displayName = `${currentCombination.number}. ${code[2]}`.trim();
      currentCombination.displayName = currentCombination.displayName.trim();
      if(parseInt(code[code.length-1])) {
        
        let idToFind = parseInt(code[code.length-1]); 
        let wI = wInfo.find(obj => obj.id === idToFind)
        let w0 = wInfo.find(obj => obj.id === 0);
        if(wI) { currentCombination.warrenty = `${w0.text} ${wI.text}`};
      }      
      return true;
    }
  }
  return false;
}

function handleCombination(line) {
  if (!currentProductPortfolio) currentProductPortfolio = new ProductPortfolio();
  let [number, originalName] = line.split(".");
  thisState = state[4];
  currentCombination = new Combination(number, originalName.trim());
  currentProductPortfolio.addCombination(currentCombination);
  if(!handleExisting(line)) thisState = state[0];
  if(true) thisState = state[0];
}

function handleArticleName(line) {
  currentArticle = new Article(line, "", "", 0);
  currentCombination.addArticle(currentArticle);
  thisState = state[1];
}

function handleDescription(line) {
  currentArticle.description = line;
  thisState = state[2];
  parseCabinet(line);
  thisArtType(line);
  if(currentCombination.builtInCab || line.includes("mikro")) parseApplianceOrSink(line);
}

function parseApplianceOrSink(line){
  if(line.includes("kombi mikrovågsugn")) currentCombination.prefix[4].combi = true;
  else if(line.includes("mikrovågsugn")) currentCombination.prefix[3].micro = true;  
  else if(line.includes("ugn")) currentCombination.prefix[2].oven = true;
  else if(line.includes("häll")) currentCombination.prefix[1].hob = true;
  else if(line.includes("diskho")|| line.includes("diskbänk")) currentCombination.prefix[0].sink = true;
}

function handleArticleNumber(line) {
  currentArticle.articleNumber = line;
  if(line === "202.699.31") {
    currentCombination.nrOfDoors -= 1;
    currentCombination.nrOfDrawerFronts +=1;
  }
  thisState = state[3];
  aBuiltInCab(line);
}

function handleQuantity(line) {
 let times = 1;
  if(twoForOne) { times = 2 }
  currentArticle.quantity = parseInt(line.substring(0, line.length - 1))*times;
  currentCombination.addArticle(currentArticle);  thisState = state[0];
  countArt();
  twoForOne = false;
  currentArticle = null;
  artType = "";
}

function parseCabinet(line) {
    if(currentArticle.name === "METOD" && line.includes("skåp"))
    {       
      for(let i = 0; i < cabTypes.length; i++){
        if(line.includes(cabTypes[i].toLowerCase())){
          if(cabTypes[i] === cabTypes[3] && currentCombination.cabType !== "none") return; 
          currentCombination.cabType = cabTypes[i];
          let descriptionSplit = line.split(' ');
          currentCombination.width = descriptionSplit[descriptionSplit.length - 2].split('x')[0] //Cabinet width
        }
    }
  }
  return;
}

function aBuiltInCab(line){
  let aBuiltInCab = builtInCabinets.some(cab => cab.articleNr.includes(line));
  if (currentArticle.name === "METOD" && aBuiltInCab) {
    currentCombination.builtInCab = true;
  }
}

function thisArtType(line){
 if (line.includes("lådfront")) {
    if (currentArticle.name === "UTRUSTA" || currentArticle.name === "KNIVSHULT") 
      {
        artType = artTypes[1];
      }
    else 
      { 
        artType = artTypes[4]; if(line.includes("x10 cm")) { twoForOne = true;} 
      }
  }
  else if (currentArticle.name === "MAXIMERA" || (currentArticle.name === "KNIVSHULT" && !line.includes("tryck-och-öppna"))) {
    if (line.includes(artTypes[0]) && !line.includes("påbyggnadssida")) {
      artType = artTypes[0];
    }
  }
  else if (line.toLowerCase().includes(artTypes[2])) {
    if(line.toLowerCase().includes("vitrin") || (line.toLowerCase().includes("glas"))){ artType = artTypes[5]; }
    else (artType = artTypes[2]);
  }
  else if (currentArticle.name === "UTRUSTA" && line.toLowerCase().includes(artTypes[3])) {artType = artTypes[3]}
}

function countArt(){
  if(!artType) return;
   if(artType === "") return;
   switch (artType) {
    case artTypes[0]:
      currentCombination.nrOfDrawers += currentArticle.quantity;
      break;
    case artTypes[1]:
      currentCombination.nrOfInner += currentArticle.quantity;
      break;
    case artTypes[2]:
      currentCombination.nrOfDoors += currentArticle.quantity;
      break;
    case artTypes[3]:
      currentCombination.nrOfShelfs += currentArticle.quantity;
      break;
    case artTypes[4]:
      currentCombination.nrOfDrawerFronts += currentArticle.quantity;
      break;
    case artTypes[5]:
      currentCombination.nrOfGlassDoors += currentArticle.quantity;
      break;
  }
}

function returnSeperator(){
  sepCount +=1;
  if(sepCount === 0) return " med";
  else if(sepCount === seperators - 1) return " och";
  else return ",";
}

export function processLines(lines) {
  displayArray = [];
  currentProductPortfolio = undefined;
  currentCombination = undefined;
  currentArticle = null;
  thisState = state[99];
  twoForOne = false;
  artType = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line === "") continue;
    if (line === "Upphängningsskena") break;

    if (isCombination(line) && !comboSkip.some(skip => line.toLowerCase().includes(skip))) {
      handleCombination(line);
      continue;
    }
    if (thisState === state[0] && isOnlyUpperCase(line)) {
      handleArticleName(line);
      continue;
    }
    if (thisState === state[1]) {
      handleDescription(line);
      continue;
    }

    if (thisState === state[2] && isArticleNumber(line)) {
      handleArticleNumber(line);
      continue;
    }

    if (thisState === state[3] && isQuantity(line)) {
      handleQuantity(line);
      continue;
    }
  }

  currentProductPortfolio.returnCombination().forEach(element => {
      sepCount = -1;
      seperators = 0;
      let blind = false;

       if(element.cabType !== "none" && element.displayName === "none")
        {

          element.displayName = `${element.number}. ${element.cabType} ${element.width} cm`
          if(element.prefix[0].sink) 
            {
              element.displayName += " för diskho"
              let wI = wInfo.find(obj => obj.id === 1)
              let w0 = wInfo.find(obj => obj.id === 0);
              if(wI)
              {
                element.warrenty = `${w0.text} ${wI.text}`;
              }
            }//Ho
          else if(element.prefix[1].hob && element.prefix[2].oven)
            {
              element.displayName += " för häll och ugn";
              let wI = wInfo.find(obj => obj.id === 4)
              let w0 = wInfo.find(obj => obj.id === 0);
              if(wI)
                {
                  element.warrenty = `${w0.text} ${wI.text}`;
                }
            } //Häll och ugn
          else if(element.prefix[1].hob && element.prefix[4].combi)
            {
              element.displayName += " för häll och kombimikrovågsugn"; 
              let wI = wInfo.find(obj => obj.id === 4)
              let w0 = wInfo.find(obj => obj.id === 0);
              if(wI)
                {
                  element.warrenty = `${w0.text} ${wI.text}`;
                }
            } //Häll och kombi
          else if(element.prefix[1].hob)
            {
              element.displayName += " för häll";       
              let wI = wInfo.find(obj => obj.id === 3)
              let w0 = wInfo.find(obj => obj.id === 0);
              if(wI)
              {
                element.warrenty = `${w0.text} ${wI.text}`;
              }
            } //Häll
          else if(element.prefix[2].oven && element.prefix[3].micro){element.displayName += " för ugn och mikro"} //Ugn & Mikro
          else if(element.prefix[2].oven && element.prefix[4].combi){element.displayName += " för ugn och kombimikrovågsugn"} //Ugn & Kombi
          else if(element.prefix[2].oven) {element.displayName += " för ugn";} //Ugn
          else if(element.prefix[3].micro) {element.displayName += " för mikro"} //Mikro
          else if(element.prefix[4].combi) {element.displayName += " för mikro"} //Kombi

          if(element.nrOfDoors > 0) {seperators += 1}
          if(element.nrOfGlassDoors > 0) {seperators += 1}
          if(element.nrOfDrawerFronts > 0){seperators += 1;} 
          if(element.nrOfInner > 0) {seperators += 1}
          if(element.nrOfShelfs > 0){seperators += 1}
          if(element.nrOfDrawers > (element.nrOfDrawerFronts + element.nrOfInner)) {blind = true; seperators += 1} //

          if(seperators <= 2)
            {
              if(element.nrOfGlassDoors > 0)
                {
                  if(element.nrOfGlassDoors === 1) 
                    { 
                      element.displayName += `${returnSeperator()} vitrindörr`;
                    } 
                  else 
                    {
                      element.displayName += `${returnSeperator()} vitrindörrar`
                    }
                }
              if(element.nrOfDoors > 0)
                {
                  if(element.nrOfDoors === 1) 
                    { 
                      element.displayName += `${returnSeperator()} dörr`; 
                    } 
                  else 
                    {
                      element.displayName += `${returnSeperator()} dörrar`
                    }
                }
              else
                {
                  seperators -= 1
                }
            }
          if(element.nrOfDrawers > 0) 
            {
              if(element.nrOfDrawerFronts === 1) {element.displayName += `${returnSeperator()} låda`; }
              else if(element.nrOfDrawerFronts > 1) {element.displayName += `${returnSeperator()} lådor`; }
              if(element.nrOfInner === 1) {element.displayName += `${returnSeperator()} dold innerlåda`; }
              else if(element.nrOfInner > 1) {element.displayName += `${returnSeperator()} dolda innerlådor`; }
            }

          if(element.nrOfShelfs > 0) {element.displayName += `${returnSeperator()} hyllplan`;}
          if(blind) {element.displayName += `${returnSeperator()} blindfront`;}    

        }//end of if cab
        if(element.displayName === "none"){element.displayName = `${element.number}. ${element.trueName}`;}
        displayArray.push(element.displayName)
        if(element.warrenty !== "none")
        {
          displayArray.push(element.warrenty)
        }
        //if(element.number === "3") alert(JSON.stringify(element, null, 2))

  });

  return displayArray;
  
}
