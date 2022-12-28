import * as model from './model.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import { async } from 'regenerator-runtime';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if(module.hot){
//   module.hot.accept();
// }

const controlRecipes = async function(){
  try{
    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    //Loading recipe
    await model.loadRecipe(id);
    
    //Rendering recipe
    recipeView.render(model.state.recipe);
    // debugger;
    bookmarksView.update(model.state.bookmarks)
  }catch(err){
    recipeView.renderError();
    console.error(err);
  }

  // controlServings();
};

const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();
    // console.log(resultsView);

    const query = searchView.getQuery();
    if(!query) return;

    await model.loadSearchResults(query);
    // console.log(model.state.search.results);

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  }catch(err){
    console.log(err);
  }
}
// controlSearchResults();

const controlPagination = function(goToPage){
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
  // console.log(model);
  // console.log(goToPage);
};

const controlServings = function(newServings){
  model.updateServings(newServings);
  // console.log(model.state.recipe);

  recipeView.update(model.state.recipe)
};

const controlAddBookmark = function(){
  if(!model.state.recipe.bookmarked){
    model.addBookmark(model.state.recipe)
  }else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // console.log(model.state.recipe);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks)
};

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe){
  try{
    addRecipeView.renderSpinner();
  
    //upload the new recipe data
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    setTimeout(function(){
      addRecipeView.toggleWindow();
    },MODAL_CLOSE_SEC * 1000);
  }catch(err){
    console.error(err);
    addRecipeView.renderError(err.message);
  }
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();