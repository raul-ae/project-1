$(document).ready(function () {
  /* --------------- Materialize initializations --------------- */
  // Filters
  $("select").formSelect();

  // Home - Intro Slider
  $(".slider").slider();

  // Initialize Instructions Carousel
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

  /* ********************* Global Variables ********************** */

  var cocktailName;
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
    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      if (thenFunction) {
        thenFunction(name, response, instruc, stepsLength);
      }
    });
  }

  /* --------------- Search --------------- */

  function searchDrink(drink) {
    cont2 = 0;

    // Empty the ingredients carousel
    $("#ingredientsContent").empty();

    // Empty the instructions
    $("#preparationContent").empty();
    $("#preparationCollap").empty();
    $("#mainImage").empty();
    // Empty the articles
    $("#articlesContent").empty();
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
    event.preventDefault();
    cocktailName = $("#drinkInput").val();
    searchDrink(cocktailName);
  });

  /* --------------- Filter --------------- */
  $(document).ready(function () {
    $("select.categoryFilter").change(function () {
      runUploadSuggested();
      var selectCat = $(this).children("option:selected").val();

      runAjax(
        "drinkSearch",
        queryURLs.filter.categoryF(selectCat),
        getDrinkName
      );
      $(this).formSelect();
      $(this).children("option[value=main]").attr("selected", "");
    });
    $("select.ingredientFilter").change(function () {
      runUploadSuggested();
      var selectIng = $(this).children("option:selected").val();
      runAjax(
        "drinkSearch",
        queryURLs.filter.ingredientF(selectIng),
        getDrinkName
      );
    });
    $("select.glassFilter").change(function () {
      runUploadSuggested();
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
    searchDrink(cocktailName);
  }
  /* --------------- Drink ---------------- */
  // upload search results
  function uploadSearch(name, resp) {
    resp = resp.drinks[0];
    $("#drinkNameH4").text(resp.strDrink);

    var mainImageJumbo = $("#mainImage");
    var mainImg = $("<img>");
    mainImg.attr("src", resp.strDrinkThumb);
    mainImg.addClass("centerImg");
    mainImageJumbo.append(mainImg);
    mainImageJumbo.addClass("col s12 m6 offset-m3 l6 offset-l3");

    ingredients(resp);
    instructionsSteps(resp.strInstructions);
    getArticles(resp.strDrink);
  }

  /* --------------- Ingredients ---------------- */
  function ingredients(resp) {
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

      // Area for ingredients image and text
      var ingredDiv = $("<div>");

      // Display ingredients images
      var ingredient = ingrArray[j].replace(" ", "%20");
      var imageUrl =
        "https://www.thecocktaildb.com/images/ingredients/" +
        ingredient +
        "-Medium.png";
      var ingredImg = $("<img>");
      ingredImg.attr("class", "item");
      ingredImg.attr("src", imageUrl);
      ingredDiv.append(ingredImg);
      ingredDiv.append(ingredText);
      $("#ingredientsContent").append(ingredDiv);
    }
  }

  function getIngredientImage(name, resp) {}

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

    var elem = document.querySelector(".collapsible");
    var instance = M.Collapsible.init(elem, {
      accordion: false,
    });

    instance.open(0);

    var prepCollapsibleSection = $("#preparationCollap");

    var prepStep = $("<li>");
    var prepStepHead = $("<div>");
    var prepStepBody = $("<div>");
    var itemSpan = $("<div>");
    var carouselItemImg = $("<img>");

    prepStepHead.addClass("collapsible-header prepStep");
    prepStepBody.addClass("collapsible-body");
    prepStepBody.attr("style", "text-align:center");
    carouselItemImg.attr(
      "src",
      resp.data[Math.floor(Math.random() * 10)].images.fixed_height.url
    );
    itemSpan.text(instruc);
    prepStepHead.text("Step " + (cont2 + 1));
    carouselItemImg.addClass("item");
    prepStepBody.append(itemSpan);
    prepStepBody.append(carouselItemImg);
    prepStep.append(prepStepHead);
    prepStep.append(prepStepBody);
    prepCollapsibleSection.append(prepStep);

    if (cont2 == stepsLength - 1) {
      // Initialize Instructions Carousel
      $("#preparationContent").carousel();
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
    var cont1 = 0;
    for (let j = 0; j < steps.length; j++) {
      var temp = steps[j].toLowerCase();
      var instruction = steps[j];
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
    var nytApiKey = "udLO1ruXioDP6Gmk5Cx7jACQtzpCrdmy";
    var search = drink + "%20cocktail";
    search = search.replace(" ", "%20");
    var queryNYTUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${search}&api-key=${nytApiKey}`;
    runAjax("articlesContent", queryNYTUrl, displayArticles);
  }

  function displayArticles(name, resp) {
    //("*********** displayArticles() ***********")

    respArray = resp.response.docs;
    var contaArt = 0;

    respArray.forEach(function (article) {
      if (contaArt < 3) {
        // Create the articles' elements
        var colDiv = $("<div>");
        var cardDiv = $("<div>");
        var cardImageDiv = $("<div>");

        var span = $("<span>");
        var cardContentDiv = $("<div>");
        var p = $("<p>");
        var cardActionDiv = $("<div>");
        var a = $("<a>");

        colDiv.attr("class", "col s12 m4 l4");
        cardDiv.addClass("card cardhgt");
        cardImageDiv.attr("class", "card-image");
        if (article.multimedia.length > 0) {
          var image = $("<img>");
          image.attr(
            "src",
            "https://www.nytimes.com/" + article.multimedia[0].url
          );
          image.attr("class", "img-hgt");
          cardImageDiv.append(image);
        } else {
          var image = $("<img>");
          image.attr("src", "./nylogo.jpg");
          image.attr("class", "img-hgt");
          cardImageDiv.append(image);
        }

        span.attr("class", "card-title lime darken-4 truncate");
        span.text(article.headline.main);
        cardContentDiv.attr("class", "card-content");
        if (article.snippet == null || article.snippet == "") {
          p.text(" ");
          var br;
          br = $("<br>");
          p.append(br);
        } else {
          p.text(article.snippet);
        }
        p.attr("class", "truncate pmar");
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
      }

      contaArt++;
    });
  }

  /* -------------- Suggested ------------- */
  // Query Random Cocktail
  function runUploadSuggested() {
    // Empty suggested drinks
    $(".randomSuggest").empty();

    // Trigger new ones
    for (i = 0; i < numberOfRndSuggestions; i++) {
      runAjax(
        "randomSuggest",
        queryURLs.lookup.randomCocktail,
        uploadSuggested
      );
    }
  }

  function uploadSuggested(name, res) {
    console.log("uploadSuggested()");
    res = res.drinks[0];
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
    cocktailName = event.target.getAttribute("drink");
    if (cocktailName != undefined) {
      localStorage.setItem("last", cocktailName);
      searchDrink(cocktailName);
    }
  });

  /* ********************** Event Listeners ********************** */
  runUploadSuggested();
  $(".drinkIngredSection").hide();
  $("#carouselBody").hide();
  $(".preparationSection").hide();
  $(".articlesSection").hide();
  $("#ingredientsContent").hide();
});
