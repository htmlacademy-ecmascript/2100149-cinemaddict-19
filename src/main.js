import FilmsApiService from './api-services/films-api-service';
import CommentsApiService from './api-services/comments-api-service';
import FilmsModel from './model/films-model.js';
import CommentsModel from './model/comments-model.js';
import FilterModel from './model/filter-model.js';
import MainPresenter from './presenter/main-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import { AUTHORIZATION, END_POINT } from './const.js';

const mainElement = document.querySelector('main');

const filmsModel = new FilmsModel(new FilmsApiService(END_POINT, AUTHORIZATION));
const commentsModel = new CommentsModel(filmsModel, new CommentsApiService(END_POINT, AUTHORIZATION));
const filtersModel = new FilterModel();

const filterPresenter = new FilterPresenter(mainElement, filtersModel, filmsModel);
const mainPresenter = new MainPresenter(mainElement, filtersModel, filmsModel, commentsModel);

filterPresenter.init();

filmsModel.init().finally(() => filterPresenter.init());

mainPresenter.init();

export { filterPresenter };
