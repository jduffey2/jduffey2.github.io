function init() {
    //recipes.sort(sortByID);
    populateAuthorCheckboxes();
    populateCategoryCheckboxes();
    populateRecipeList();

    //Check if param
    let params = new URLSearchParams(document.location.search);
    let id = params.get("recipe");
    if (id !== null) {
        id = parseInt(id);
        showRecipe(id);
    }
}

function showRecipe(id) {
    document.getElementById('recipeContentsDiv').setAttribute('data-id', id) ;
    let entry = recipes.find(obj => {return obj.id === id});

    let dec = atob(entry['recipe']);
    let lines = dec.split('\n')

    recipeText = ""
    let isInList = false;
    for(var i = 0; i < lines.length; i++) {
        switch(lines[i][0]) {
            case "-":
                //Make it a li
                if(isInList) {
                    recipeText += `<li>${lines[i].slice(1)}</li>`;
                }
                else {
                    recipeText += `<ul><li>${lines[i].slice(1)}</li>`;
                }
                isInList = true;
                break;
            case "#":
                //make it bold
                if(isInList) {
                    recipeText += "</ul>";
                    isInList = false;
                }
                recipeText += `<h4>${lines[i].slice(1)}</h4>`;
                break;
            default:
                //handle it normally
                if(isInList) {
                    recipeText += "</ul>";
                    isInList = false;
                }
                recipeText += `<p>${lines[i]}</p>`;
                break;
        }
    }

    //Check if its been favorited
    var favs = JSON.parse(localStorage.getItem("DuffeyFavorites")) || [];
    if(favs.includes(id)) {
        document.getElementById("starPath").style.fill = "#D5D713";
    }
    else {
        document.getElementById("starPath").style.fill = "white";
    }

    document.getElementById('nameHeader').innerHTML = entry['name'];
    document.getElementById('authorHeader').innerHTML = `${getAuthor(entry['author'])} - ${getCategory(entry['category'])} (p. ${entry['page']})`;
    document.getElementById('recipeDiv').innerHTML = recipeText;
    document.getElementById('dummyDiv').classList.remove('hide');

    //If we are in our mobile format
    const mediaQuery = window.matchMedia('screen and (max-width:  900px)');
    if(mediaQuery.matches) {
        document.getElementById('searchDiv').style.display = "none";
        document.getElementById('recipeContentsDiv').style.display = "block";
        document.getElementById('recipeListDiv').style.display = "none";
    }

    //Change the URL
    const url = new URL(location);
    url.searchParams.set("recipe", id);
    history.pushState({},"",url);
}

function backToList() {
    document.getElementById('recipeContentsDiv').style.display = "none";
    document.getElementById('searchDiv').style.display = "none";
    document.getElementById('recipeListDiv').style.display = "block";
}

function showFilters() {
    document.getElementById('recipeListDiv').style.display = "none";
    document.getElementById('searchDiv').style.display = "block";
    document.getElementById('recipeContentsDiv').style.display = "none";
}

function showShareDialog() {
    document.getElementById('shareUrlBox').value = location;
    document.getElementById('shareDialog').showModal();
}

function copyUrl() {
    navigator.clipboard.writeText(location);
    document.getElementById('shareDialog').close();
}

function toggleFavorite() {
    var favs = JSON.parse(localStorage.getItem("DuffeyFavorites")) || [];
    var recipeID = parseInt(document.getElementById('recipeContentsDiv').getAttribute('data-id'));

    //If our favs already includes the recipe remove it, otherwise add it
    if(favs.includes(recipeID)) {
        let index = favs.indexOf(recipeID);
        favs.splice(index,1);
        document.getElementById("starPath").style.fill = "white";

    }
    else {
        favs.push(recipeID);
        document.getElementById("starPath").style.fill = "#D5D713";
    }

    //Push results back to storage
    localStorage.setItem('DuffeyFavorites', JSON.stringify(favs))

    
}

let filterProperties = {
    showFavorites: false,
    authors: [],
    filterAuthors: false,
    categories: [],
    filterCategories: false
}
function processFilters() {
    //Get favorites
    filterProperties.showFavorites = document.getElementById('favoritesFilter').checked;

    //Get Authors
    authorBoxes = document.getElementsByClassName('authorCheckbox');
    authorsFilters = []
    for(var i = 0; i < authorBoxes.length; i++) {
        if(authorBoxes[i].checked) {
            authorsFilters.push(authorBoxes[i].value);
        }
    }
    if(authorsFilters.length > 0) {
        filterProperties.filterAuthors = true;
    }
    else {
        filterProperties.filterAuthors = false;
    }
    filterProperties.authors = authorsFilters;

    //Get Categories
    categoryBoxes = document.getElementsByClassName('categoryCheckbox');
    categoriesFilters = [];
    for(var i = 0; i < categoryBoxes.length; i++) {
        if(categoryBoxes[i].checked) {
            categoriesFilters.push(parseInt(categoryBoxes[i].value));
        }
    }
    if(categoriesFilters.length > 0) {
        filterProperties.filterCategories = true;
    }
    else {
        filterProperties.filterCategories = false;
    }
    filterProperties.categories = categoriesFilters;

    recipeFilter();

}

function recipeFilter() {
    var input, filter, ul, li, a, i, txtValue, rec;
    input = document.getElementById('recipeInput');
    filter = input.value.toUpperCase().trim();
    ul = document.getElementById('recipeList');
    li = ul.getElementsByTagName("li");
    var favs = JSON.parse(localStorage.getItem("DuffeyFavorites")) || [];
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("div")[0];
        recipeID = a.getAttribute('data-id');

        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1 && matchesFilters(parseInt(recipeID), favs)) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function matchesFilters(recipeID, favs) {
    matches = true;
    let entry = recipes.find(obj => {return obj.id === recipeID});

    //Are we filtering by favorites
    if(filterProperties.showFavorites) {
        //If the recipeID is not in the list of favorites, don't match
        if(!favs.includes(recipeID)) {
            matches = false;
        }
    }

    //Are we filtering by authors
    if(filterProperties.filterAuthors) {
        if(!filterProperties.authors.includes(entry.author)) {
            matches = false;
        }
    }

    //Are we filtering by categories
    if(filterProperties.filterCategories) {
        if(!filterProperties.categories.includes(entry.category)) {
            matches = false;
        }
    }

    return matches;
}

function populateAuthorCheckboxes() {
    let checkBoxes = document.getElementById('authorCheckboxDiv');
    for([key, value] of authors.entries()) {
        let box = document.createElement('input');
        box.type = "checkbox";
        box.value = key;
        box.id = key;
        box.classList.add("authorCheckbox");
        box.addEventListener('click', processFilters);

        let label = document.createElement('label');
        label.for = key;
        label.innerHTML = !!value ? value : "None";

        let container = document.createElement('div');
        container.classList.add('checkboxContainer');

        container.appendChild(box);
        container.appendChild(label);

        checkBoxes.appendChild(container);

    }
}

function populateCategoryCheckboxes() {
    let checkBoxes = document.getElementById('categoryCheckboxDiv');
    for([key, value] of categories.entries()) {
        let box = document.createElement('input');
        box.type = "checkbox";
        box.value = key;
        box.id= key;
        box.classList.add("categoryCheckbox");
        box.addEventListener('click', processFilters);

        let label = document.createElement('label');
        label.for = key;
        label.innerHTML = value;

        let container = document.createElement('div');
        container.classList.add('checkboxContainer');

        container.appendChild(box);
        container.appendChild(label);

        checkBoxes.appendChild(container);

    }
}

function populateRecipeList() {
    let list = document.getElementById('recipeList');
    list.innerHTML = "";
    for(var i = 0; i < recipes.length; i++) {
        list.innerHTML+= `<li><div class='recipeItem' data-id='${recipes[i]['id']}' onclick="showRecipe(${recipes[i]['id']})">${recipes[i]['name']}<span class='categorySpan'>${getCategory(recipes[i]['category'])}</span><div class="authorSpan"> - ${getAuthor(recipes[i]['author'])}</div><span class='hide'>${recipes[i]['tags']} ${getAuthor(recipes[i]['author'])} ${getCategory(recipes[i]['category'])}</span></div></li>`;
    }
}

function getAuthor(str) {
    return authors.get(str);
}

function getCategory(ind) {
    return categories.get(ind);
}