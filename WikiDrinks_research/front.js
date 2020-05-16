$(document).ready(function () {
  /* --------------- Materialize initializations --------------- */
  // Filters
  $("select").formSelect();

  // Home - Intro Slider
  $(".slider").slider();

  //    <<< Dónde? >>>
  $(".sidenav").sidenav();
  $(".dropdown-trigger").dropdown();
  $(".dropdown-content.select-dropdown > li span").css("color", "red");

  // Initialize Instructions Carousel
  /* var instance = M.Carousel.getInstance(elem);
  $(".carousel").carousel(); */

  /* ********************* Global Variables ********************** */

  var category;
  var glass;
  var cocktailID;
  var ingredientID;
  var cocktailName;
  var ingredientName;
  var queryURLs = {
    list: {
      categories: "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list",
      glasses: "https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list",
      ingredients:
        "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
      cocktails: "https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a",
      alcoholFilter:
        "https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list",
    },
    filter: {
      categoryF: (category) =>
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${category}`,
      glassF: (glass) =>
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=${glass}`,
      ingredientF: (ingredientName) =>
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredientName}`,
      alcoholFilter: {
        alcoholic:
          "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Alcoholic",
        nonAlcoholic:
          "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic",
      },
    },
    lookup: {
      ingredientsByIDF: (ingredientID) =>
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?iid=${ingredientID}`,
      cocktailDetailsByIDF: (cocktailID) =>
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailID}`,
      randomCocktail: "https://www.thecocktaildb.com/api/json/v1/1/random.php",
    },
    search: {
      ingredientByNameF: (ingredientName) =>
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${ingredientName}`,
      cocktailByNameF: (cocktailName) =>
        "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" +
        cocktailName,
    },

    image: {
      ingredient: `https://www.thecocktaildb.com/images/ingredients/${ingredientName}.png (700x700 pixels)`,
    },
  };
  var numberOfRndSuggestions = 3;
  var cont2 = 0;

  /* ************************** Functions ************************ */
  /* --------------- Global --------------- */
  function runAjax(name, url, thenFunction, instruc, stepsLength) {
    console.log("runAjax() - " + name);
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      if (thenFunction) {
        thenFunction(name, response, instruc, stepsLength);
      }
    });
  }

  function reStart() {
    /*
    $(".carousel-indicators").empty();
    $(".carousel").empty();
    cont = 0; // Reset from getGiphies
    cocktailName = localStorage.getItem("last");
    runAjax(
      "drinkSearch",
      queryURLs.search.cocktailByNameF(cocktailName),
      uploadSearch
    ); */
  }

  /* --------------- Search --------------- */
  $("#searchButton").on("click", function (event) {
    event.preventDefault();
    cont2 = 0;
    // Empty the carousel
    $(".carousel").empty();
    /* if (carouselInstance) {
      carouselInstance.destroy();
    } */

    cocktailName = $("#drinkInput").val();
    localStorage.setItem("last", cocktailName);
    //location.reload();
    $(".introSlider").hide();
    $(".drinkIngredSection").show();
    $(".preparationSection").show();
    $(".articlesSection").show();
    runAjax(
      "drinkSearch",
      queryURLs.search.cocktailByNameF(cocktailName),
      uploadSearch
    );
  });

  /* --------------- Filter --------------- */

  /* --------------- Drink ---------------- */
  // upload search results
  function uploadSearch(name, resp) {
    console.log("uploadSearch()");
    resp = resp.drinks[0];
    $("#drinkNameH4").text(resp.strDrink);
    $("#mainImage").attr("src", resp.strDrinkThumb);
    ingredients(resp);
    instructionsSteps(resp.strInstructions);
  }

  /* --------------- Ingredients ---------------- */
  function ingredients(resp) {
    console.log("ingredients()");
    $("#ingredientsList").empty();
    var ingrArray = [];
    Object.entries(resp).forEach(function (entry) {
      let subKey = entry[0].substring(0, 13);
      if (subKey === "strIngredient" && entry[1] != null) {
        ingrArray.push(entry[1]);
      }
    });
    for (let j = 0; j < ingrArray.length; j++) {
      var newLi = $("<li>");
      newLi.text(ingrArray[j]);
      $("#ingredientsList").append(newLi);
    }
  }

  /* --------------- Preparation --------------- */
  // Giphy API Key: Sp3oGCbMvYRfzhcYM1UYmYgytqt3FXW7
  // Another Giphy API Key: kYlC1mU6XZtCjjMbaFOQr4Y52hj0VQYx

  var giphyAPIKey = "kYlC1mU6XZtCjjMbaFOQr4Y52hj0VQYx";
  var carouselInstance;
  function makegiphyURL(value, Instruction, stepsLength) {
    var giphyURL =
      "https://cors-anywhere.herokuapp.com/https://api.giphy.com/v1/gifs/search?q=" +
      value +
      "&api_key=" +
      giphyAPIKey;
    // Carousel
    runAjax("carousel", giphyURL, getGiphies, Instruction, stepsLength);
  }

  function getGiphies(name, resp, instruc, stepsLength) {
    console.log("getGiphies()");
    /* console.log("name: ", name);
    console.log("resp: ", resp);
    console.log("url: ", resp.data[0].images.fixed_height.url);
    console.log("instruc: ", instruc); */
    // Carousel
    var carouselItemDiv = $("<div>");
    var instructionH6 = $("<h6>");
    var carouselItemImg = $("<img>");

    carouselItemDiv.attr("class", "carousel-item gray-text");
    carouselItemDiv.attr("href", "#");
    instructionH6.text(instruc);
    // carouselItemImg.attr("alt", "Carousel instructions image");
    carouselItemImg.attr("src", resp.data[0].images.fixed_height.url);
    carouselItemImg.attr("SameSite", "strict");

    carouselItemDiv.append(instructionH6);
    carouselItemDiv.append(carouselItemImg);
    $(".carousel").append(carouselItemDiv);

    console.log("instruc: ", instruc);
    console.log("cont2: ", cont2, " stepsLength: ", stepsLength);
    if (cont2 == stepsLength - 1) {
      // Initialize Instructions Carousel
      $(".carousel").carousel();
      // carouselInstance = M.Carousel.getInstance(elem);
    }
    cont2++;
  }

  function instructionsSteps(instructions, giphy) {
    console.log("instructionsSteps()");
    var instSteps = instructions;
    var steps = [];
    var step = "";

    for (let i = 0; i < instSteps.length; i++) {
      if (
        instSteps[i] == "." &&
        instSteps[i - 1] != "z" &&
        instSteps[i - 2] != "o"
      ) {
        steps.push(step);
        step = "";
        i++;
      } else {
        step = step + instSteps[i];
      }
    }

    // getting action verbs from the intructions
    var verbs = [
      "fill",
      "place",
      "saturate",
      "add",
      "dash",
      "pour",
      "mix",
      "shake",
      "rub",
      "sprinkle",
      "serve",
      "garnish",
      "blender",
      "muddle",
      "mash",
      "combine",
      "float",
      "look",
    ];
    var verbInstr = [];
    var cont1 = 0;
    for (let j = 0; j < steps.length; j++) {
      for (let i = 0; i < verbs.length; i++) {
        var temp = steps[j].toLowerCase();
        if (temp.search(verbs[i]) >= 0) {
          verbInstr.push(verbs[i]);

          if (cont1 < steps.length) {
            console.log("cont1: ", cont1, " steps.length: ", steps.length);
            cont1++;
            makegiphyURL(verbs[i], steps[j], steps.length);
          }
        }
      }
    }
    console.log("steps: ", steps);
  }

  /* -------------- Suggested ------------- */

  /* ********************** Event Listeners ********************** */
  // reStart();    <<<<<----------------******
  $(".drinkIngredSection").hide();
  $(".preparationSection").hide();
  $(".articlesSection").hide();
});
