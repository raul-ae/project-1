$(document).ready(function () {
  /* --------------- Materialize initializations --------------- */
  // Filters
  $("select").formSelect();

  // Home - Intro Slider
  $(".slider").slider();

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
      ingredientF: (ingredientName) =>
        `https://www.thecocktaildb.com/images/ingredients/${ingredientName}-Medium.png`,
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

  function searchDrink(drink) {
    cont2 = 0;

    // Empty the carousel
    //$(".borderRecipe").empty();
    /* if (carouselInstance) {
          carouselInstance.destroy();
        } */

    // Empty the ingredients carousel
    $("#ingredientsContent").empty();

    // Empty the instructions
    $("#preparationContent").empty();

    // Empty the articles
    $("#articlesContent").empty();

    //localStorage.setItem("last", drink);
    //location.reload();
    $(".introSlider").hide();
    $(".drinkIngredSection").show();
    $("#carouselBody").show();
    $(".preparationSection").show();
    $(".articlesSection").show();
    $("#ingredientsContent").show();

    runAjax(
      "drinkSearch",
      queryURLs.search.cocktailByNameF(drink),
      uploadSearch
    );
  }

  $("#searchButton").on("click", function (event) {
    //$("#drinkInpput").on("submit", function (event) {
    event.preventDefault();

    cocktailName = $("#drinkInput").val();
    searchDrink(cocktailName);
  });

  /* --------------- Filter --------------- */
  $(document).ready(function () {
    $("select.categoryFilter").change(function () {
      var selectCat = $(this).children("option:selected").val();

      runAjax(
        "drinkSearch",
        queryURLs.filter.categoryF(selectCat),
        getDrinkName
      );
      $(this).formSelect();
      $(this).children("option[value=main]").attr("selected", "");
      // $(this).material_select();
    });
    $("select.ingredientFilter").change(function () {
      var selectIng = $(this).children("option:selected").val();
      runAjax(
        "drinkSearch",
        queryURLs.filter.ingredientF(selectIng),
        getDrinkName
      );
    });
    $("select.glassFilter").change(function () {
      var selectGlass = $(this).children("option:selected").val();
      runAjax(
        "drinkSearch",
        queryURLs.filter.glassF(selectGlass),
        getDrinkName
      );
    });
  });

  function getDrinkName(name, resp) {
    cocktailName = resp.drinks[Math.floor(Math.random() * 10)].strDrink;
    console.log("filter " + cocktailName);
    searchDrink(cocktailName);
  }
  /* --------------- Drink ---------------- */
  // upload search results
  function uploadSearch(name, resp) {
    console.log("uploadSearch()");
    resp = resp.drinks[0];
    $("#drinkNameH4").text(resp.strDrink);
    $("#mainImage").attr(
      "style",
      "background-image: url(" + resp.strDrinkThumb + ")"
    );
    ingredients(resp);
    instructionsSteps(resp.strInstructions);
    getArticles(resp.strDrink);
  }

  /* --------------- Ingredients ---------------- */
  function ingredients(resp) {
    console.log("ingredients()");
    $("#ingredientsList").empty();

    // Get the ingredients list
    var ingrArray = [];
    Object.entries(resp).forEach(function (entry) {
      let subKey = entry[0].substring(0, 13);
      if (subKey === "strIngredient" && entry[1] != null) {
        ingrArray.push(entry[1]);
      }
    });

    for (let j = 0; j < ingrArray.length; j++) {
      // Display ingredients list
      var ingredText = $("<p>");
      ingredText.attr("class", "ingredSpan");
      ingredText.text(ingrArray[j]);
      // $("#ingredientsList").append(ingredText);

      // Area for ingredients image and text
      var ingredDiv = $("<div>");
      ingredDiv.attr("class", "ingredItemWrapDiv");

      // Display ingredients images
      var ingredient = ingrArray[j].replace(" ", "%20");
      console.log("ingredient: ", ingredient);
      var imageUrl =
        "https://www.thecocktaildb.com/images/ingredients/" +
        ingredient +
        "-Medium.png";
      console.log("imageUrl: ", imageUrl);
      var ingredImg = $("<img>");
      //ingredImg.attr('class', 'item');
      ingredImg.attr("src", imageUrl);
      ingredDiv.append(ingredImg);
      ingredDiv.append(ingredText);
      $("#ingredientsContent").append(ingredDiv);
    }
  }

  /* --------------- Preparation --------------- */
  // Giphy API Key: Sp3oGCbMvYRfzhcYM1UYmYgytqt3FXW7
  // Another Giphy API Key: kYlC1mU6XZtCjjMbaFOQr4Y52hj0VQYx

  var giphyAPIKey = "Sp3oGCbMvYRfzhcYM1UYmYgytqt3FXW7";
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
    var gifItemDiv = $("<div>");
    var itemSpan = $("<div>");

    carouselItemDiv.attr("class", "col s12 m6 l6 pdnitem");
    gifItemDiv.attr("class", "col s12 m6 l6 pdnitem");

    var carouselItemImg = $("<img>");
    carouselItemImg.attr(
      "src",
      resp.data[Math.floor(Math.random() * 10)].images.fixed_height.url
    );
    carouselItemImg.attr("class", "item");

    itemSpan.text(instruc);

    carouselItemDiv.append(carouselItemImg);

    carouselItemDiv.append(itemSpan);

    $("#preparationContent").append(carouselItemDiv);
    //$("#preparationContent").append(gifItemDiv);

    console.log("instruc: ", instruc);
    console.log("cont2: ", cont2, " stepsLength: ", stepsLength);
    if (cont2 == stepsLength - 1) {
      // Initialize Instructions Carousel
      $("#preparationContent").carousel();
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
      "simmer",
      "age",
      "strain",
      "dissolve",
      "stir",
      "dry",
      "boil",
      "eat",
      "squeeze",
      "substituted",
      "use",
      "blend",
      "drink",
      "build",
      "cream",
      "served",
    ];
    // var verbInstr = [];
    var cont1 = 0;
    for (let j = 0; j < steps.length; j++) {
      var temp = steps[j].toLowerCase();
      var instruction = j + 1 + ". " + steps[j];
      for (let i = 0; i < verbs.length; i++) {
        if (temp.search(verbs[i]) >= 0) {
          makegiphyURL(verbs[i], instruction, steps.length);
          break;
        }
      }
    }
    console.log("steps: ", steps);
  }

  /* -------------- Articles ------------- */

  function getArticles(drink) {
    console.log("getArticles()");
    console.log("drink: ", drink);

    // NYT API Key: "udLO1ruXioDP6Gmk5Cx7jACQtzpCrdmy"
    var nytApiKey = "udLO1ruXioDP6Gmk5Cx7jACQtzpCrdmy";
    var search = drink + "%20cocktail";
    search = search.replace(" ", "%20");
    var queryNYTUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${search}&api-key=${nytApiKey}`;
    console.log("queryNYTUrl: ", queryNYTUrl);

    runAjax("articlesContent", queryNYTUrl, displayArticles);
  }

  function displayArticles(name, resp) {
    console.log("*********** displayArticles() ***********");
    console.log("name: ", name);
    console.log("resp: ", resp);
    respArray = resp.response.docs;
    console.log("respArray: ", respArray);

    respArray.forEach(function (article) {
      console.log("headline: ", article.headline.main);
      console.log("snippet: ", article.snippet);
      console.log("lead_paragraph: ", article.lead_paragraph);
      console.log("web_url: ", article.web_url);
      /* console.log(
        "image: ",
        "https://www.nytimes.com/" + article.multimedia[0].url
      ); */

      // Create the articles' elements
      var colDiv = $("<div>");
      var cardDiv = $("<div>");
      var cardImageDiv = $("<div>");

      var span = $("<span>");
      var cardContentDiv = $("<div>");
      var p = $("<p>");
      var cardActionDiv = $("<div>");
      var a = $("<a>");

      colDiv.attr("class", "col s12 m6 l6");
      cardDiv.attr("class", "card");
      cardImageDiv.attr("class", "card-image");
      if (article.multimedia.length > 0) {
        var image = $("<img>");
        image.attr(
          "src",
          "https://www.nytimes.com/" + article.multimedia[0].url
        );
        image.attr("class", "img-hgt");
        cardImageDiv.append(image);
      }

      span.attr("class", "card-title lime darken-4");
      span.text(article.headline.main);
      cardContentDiv.attr("class", "card-content");
      p.text(article.snippet);
      cardActionDiv.attr("class", "card-action");
      a.attr("href", article.web_url);
      a.attr("target", "_blank");
      a.text("Go to the article!");

      cardImageDiv.append(span);
      cardContentDiv.append(p);
      cardActionDiv.append(a);
      cardDiv.append(cardImageDiv);
      cardDiv.append(cardContentDiv);
      cardDiv.append(cardActionDiv);
      colDiv.append(cardDiv);
      $("#articlesContent").append(colDiv);
    });
  }

  /* -------------- Suggested ------------- */
  // Query Random Cocktail
  for (i = 0; i < numberOfRndSuggestions; i++) {
    runAjax("randomSuggest", queryURLs.lookup.randomCocktail, uploadSuggested);
  }

  function uploadSuggested(name, res) {
    res = res.drinks[0];

    console.log("res.strDrink: ", res.strDrink);
    console.log("res.strDrinkThumb :", res.strDrinkThumb);

    var colDiv = $("<div>");
    var cardDiv = $("<div>");
    var cardImgDiv = $("<div>");
    var imgTag = $("<img>");
    var spanTag = $("<span>");
    var actionDiv = $("<div>");
    var aTag = $("<a>");

    colDiv.attr("class", "col s12 m4 l4");
    cardDiv.attr("class", "card");
    cardImgDiv.attr("class", "card-image");
    imgTag.attr("src", res.strDrinkThumb);
    imgTag.attr("class", "img-hgt");
    spanTag.attr("class", "card-title lime darken-4");
    spanTag.text(res.strDrink);
    actionDiv.attr("class", "card-action");
    aTag.attr("href", "#");
    aTag.attr("drink", res.strDrink);
    aTag.text("Go to the drink!");

    cardImgDiv.append(imgTag);
    cardImgDiv.append(spanTag);
    cardDiv.append(cardImgDiv);
    actionDiv.append(aTag);
    cardDiv.append(actionDiv);
    colDiv.append(cardDiv);
    $(`.${name}`).append(colDiv);
  }

  // Suggested Drink selection
  $(".randomSuggest").on("click", function (event) {
    event.preventDefault();
    $(window).scrollTop(0);
    /* console.log("event: ", event);
    console.log("event.target: ", event.target);
    console.log("$(this): ", $(this)); */

    cocktailName = event.target.getAttribute("drink");
    if (cocktailName != undefined) {
      console.log("cocktailName: ", cocktailName);
      localStorage.setItem("last", cocktailName);
      searchDrink(cocktailName);
    }
  });

  /* ********************** Event Listeners ********************** */

  $(".drinkIngredSection").hide();
  $("#carouselBody").hide();
  $(".preparationSection").hide();
  $(".articlesSection").hide();
  $("#ingredientsContent").hide();

  /*Ingredients carousel*/
  const gap = 16;

  const carousel = document.getElementById("drinksCar"),
    content = document.getElementById("ingredientsContent"),
    next = document.getElementById("next"),
    prev = document.getElementById("prev");

  next.addEventListener("click", (e) => {
    carousel.scrollBy(width + gap, 0);
    if (carousel.scrollWidth !== 0) {
      prev.style.display = "flex";
    }
    if (content.scrollWidth - width - gap <= carousel.scrollLeft + width) {
      next.style.display = "none";
    }
  });
  prev.addEventListener("click", (e) => {
    carousel.scrollBy(-(width + gap), 0);
    if (carousel.scrollLeft - width - gap <= 0) {
      prev.style.display = "none";
    }
    if (!content.scrollWidth - width - gap <= carousel.scrollLeft + width) {
      next.style.display = "flex";
    }
  });

  let width = carousel.offsetWidth;
  window.addEventListener("resize", (e) => (width = carousel.offsetWidth));
});
