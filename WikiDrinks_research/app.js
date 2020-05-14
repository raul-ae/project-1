$(document).ready(function () {
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

  /* ************************** Functions ************************ */
  /* --------------- Global --------------- */
  function runAjax(name, url, thenFunction) {
    console.log("runAjax() - " + name);
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      if (thenFunction) {
        thenFunction(name, response);
      }
    });
  }

  /* --------------- Search --------------- */
  $("#searchButton").on("click", function (event) {
    console.log("searchButton.on('click')");
    event.preventDefault();
    cocktailName = $("#drinkInput").val();
    runAjax(
      "drinkSearch",
      queryURLs.search.cocktailByNameF(cocktailName),
      uploadSearch
    );
  });

  /* --------------- Filter --------------- */
  // Query the Lists
  runAjax("categoryFilter", queryURLs.list.categories, uploadFilter);
  runAjax("ingredientFilter", queryURLs.list.ingredients, uploadFilter);
  runAjax("glassFilter", queryURLs.list.glasses, uploadFilter);

  function uploadFilter(name, res) {
    console.log("uploadFilter()");
    res = res.drinks;
    /* console.log(name, res); */
    res.forEach(function (filter) {
      var filterName = Object.values(filter).toString();
      /* console.log(filterName); */
      var filterItemA = $("<a>");
      filterItemA.attr("class", "dropdown-item");
      filterItemA.attr("href", "#");
      filterItemA.text(filterName);
      $(`.${name} .dropdown-menu`).append(filterItemA);
    });
  }

  /* --------------- Drink ---------------- */
  // upload search results
  function uploadSearch(name, resp) {
    console.log("uploadSearch()");
    resp = resp.drinks[0];
    $("#drinkNameH5").text(resp.strDrink);
    $("#mainImage").attr("src", resp.strDrinkThumb);
    instructionsSteps(resp.strInstructions);
    ingredients(resp);
  }

  /* --------------- Ingredients ---------------- */
  function ingredients(value) {
    console.log("ingredients()");
    console.log("value: ", value);
    var ingrArray = [];
    Object.entries(value).forEach(function (entry) {
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

  /* --------------- Recipe --------------- */
  function instructionsSteps(instructions) {
    console.log("instructionsSteps()");
    var instSteps = instructions;
    var steps = [];
    var step = "";

    for (let i = 0; i < instSteps.length; i++) {
      if (instSteps[i] == ".") {
        steps.push(step);
        step = "";
        i++;
      } else {
        step = step + instSteps[i];
      }
    }
    //console.log(steps);

    for (let j = 0; j < steps.length; j++) {
      var newLi = $("<li>");
      newLi.text(steps[j]);
      $("#intructionsList").append(newLi);
    }
  }

  /* -------------- Suggested ------------- */
  // Query Random Cocktail
  for (i = 0; i < numberOfRndSuggestions; i++) {
    runAjax("randomSuggest", queryURLs.lookup.randomCocktail, uploadSuggested);
  }

  function uploadSuggested(name, res) {
    res = res.drinks[0];
    var suggestedItemDiv = $("<div>");
    var suggestedImg = $("<img>");
    var suggOverlayDiv = $("<div>");
    var suggOverlayH5 = $("<h5>");

    suggestedItemDiv.attr("class", "card bg-dark text-white");
    suggestedImg.attr("src", res.strDrinkThumb);
    suggestedImg.attr("class", "card-img");
    suggestedImg.attr("alt", "Suggested image");
    suggOverlayDiv.attr("class", "card-img-overlay");
    suggOverlayH5.attr("class", "card-title");
    suggOverlayH5.text(res.strDrink);
    suggestedItemDiv.append(suggestedImg);
    suggOverlayDiv.append(suggOverlayH5);
    suggestedItemDiv.append(suggOverlayDiv);
    $(`.${name}`).append(suggestedItemDiv);
  }

  /* ********************** Event Listeners ********************** */
});

/* function printResponse(name, res) {
    console.log(name, res);
  } */

/*
  // Lists
  runAjax("List - Categories", queryURLs.list.categories, printResponse);
  runAjax("List - Ingredients", queryURLs.list.ingredients, printResponse);
  runAjax("List - Glasses", queryURLs.list.glasses, printResponse);
  runAjax("List - Cocktails", queryURLs.list.cocktails, printResponse);
  runAjax(
    "List - Alchohol Filter",
    queryURLs.list.alcoholFilter,
    printResponse
  );

  
  // Filters
  runAjax("Filter - Category", queryURLs.filter.category, printResponse);
  runAjax("Filter - Glass", queryURLs.filter.glass, printResponse);
  runAjax("Filter - Ingredient", queryURLs.filter.ingredient, printResponse);
  runAjax(
    "Filter - Alcoholic",
    queryURLs.filter.alcoholFilter.alcoholic,
    printResponse
  );
  runAjax(
    "Filter - NonAlcoholic",
    queryURLs.filter.alcoholFilter.nonAlcoholic,
    printResponse
  );

  // Lookup
  runAjax(
    "Lookup - IngredientsByID",
    queryURLs.lookup.ingredientsByID,
    printResponse
  );
  runAjax(
    "Lookup - CocktailDetailsByID",
    queryURLs.lookup.cocktailDetailsByID,
    printResponse
  );
  runAjax(
    "Lookup - RandomCocktail",
    queryURLs.lookup.randomCocktail,
    printResponse
  );

  // Search
  runAjax(
    "Search - ingredientByName",
    queryURLs.search.ingredientByName,
    printResponse
  );

  runAjax(
    "Search - cocktailByName",
    queryURLs.search.cocktailByName,
    printResponse
  );

  // Images
  runAjax("Image - Ingredient", queryURLs.image.ingredient, printResponse);
  */
