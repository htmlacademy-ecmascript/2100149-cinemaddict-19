import { RenderPosition, render, remove} from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import FilmPresenter from './film-presenter.js';
import { filterPresenter } from '../main.js';
import SortView from '../view/sort-view.js';
import FilmBoardView from '../view/films-board-view.js';
import NoFilmsView from '../view/no-film-view.js';
import LoadingView from '../view/loading-view.js';

import FilmListView from '../view/films-list-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import FooterStatisticView from '../view/footer-statistic-view.js';
import { sortByDate, sortByRating } from '../utils.js';
import { filter } from '../filter-utils.js';
import { PopupUpdateType, SortType, UpdateType, UserAction } from '../const.js';

const FILMS_COUNT_PER_STEP = 5;

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const footerStatisticElement = document.querySelector('.footer__statistics');

export default class MainPresenter {
  #filmsModel = null;
  #filtersModel = null;
  #commentsModel = null;

  #container = null;
  #filmBoard = null;
  #filmsContainer = null;
  #sortComponent = null;
  #footerStatisticComponent = null;
  #showMoreButtonComponent = null;
  #loadingComponent = new LoadingView();

  #filmPresenter = new Map();

  #isLoading = true;
  #currentSortType = SortType.DEFAULT;
  #renderedFilmsCount = FILMS_COUNT_PER_STEP;

  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor(container, filtersModel, filmsModel, commentsModel) {
    this.#container = container;

    this.#filmsModel = filmsModel;
    this.#filtersModel = filtersModel;
    this.#commentsModel = commentsModel;

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#filtersModel.addObserver(this.#handleModelEvent);
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  get films() {
    const films = this.#filmsModel.films;
    const filterType = this.#filtersModel.filter;
    const filteredFilms = filter[filterType](films);

    switch (this.#currentSortType) {
      case SortType.DATE:
        return filteredFilms.sort(sortByDate);
      case SortType.RATING:
        return filteredFilms.sort(sortByRating);
    }

    return filteredFilms;
  }

  init = () => {
    this.#renderFilmBoard();
    this.#renderFilmsContainer();
  };

  #renderFilmBoard = () => {
    this.#filmBoard = new FilmBoardView();
    render(this.#filmBoard, this.#container);
    this.#filmBoard = this.#filmBoard.element.lastElementChild;
  };

  #renderSort = () => {
    this.#sortComponent = new SortView(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#sortComponent, document.querySelector('.main-navigation'), RenderPosition.AFTEREND);
  };

  #renderFooterStatistics = () => {
    this.#footerStatisticComponent = new FooterStatisticView(this.#filmsModel.films.length);
    render(this.#footerStatisticComponent, footerStatisticElement);
  };

  #renderFilmsContainer = () => {
    const films = this.films;
    const filmsCount = films.length;

    if (this.#isLoading) {
      render(this.#loadingComponent, this.#filmBoard);
      return;
    }

    if (filmsCount === 0) {
      this.#filmsContainer = new NoFilmsView(this.#filtersModel.filter);
      render(this.#filmsContainer, this.#filmBoard);
      return;
    }

    this.#filmsContainer = new FilmListView();
    render(this.#filmsContainer, this.#filmBoard);

    this.#renderFilms(films.slice(0, Math.min(filmsCount, this.#renderedFilmsCount)));

    this.#renderSort();

    if (filmsCount > this.#renderedFilmsCount) {
      this.#renderShowMoreButtonComponent();
    }

    this.#renderFooterStatistics();
  };

  #clearFilmsContainer = ({ resetRenderedFilmsCount = false, resetSortType = false } = {}) => {
    const filmsCount = this.films.length;

    this.#filmPresenter.forEach((presenter) => presenter.destroy());
    this.#filmPresenter.clear();

    remove(this.#filmsContainer);
    remove(this.#loadingComponent);
    remove(this.#sortComponent);
    remove(this.#showMoreButtonComponent);
    remove(this.#footerStatisticComponent);

    if (resetRenderedFilmsCount) {
      this.#renderedFilmsCount = FILMS_COUNT_PER_STEP;
    } else {
      this.#renderedFilmsCount = Math.min(filmsCount, this.#renderedFilmsCount);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }
  };

  #renderFilms = (films) => {
    const renderFilm = (film) => {
      const filmPresenter = new FilmPresenter(this.#filmsContainer, this.#commentsModel, this.#handleViewAction);
      filmPresenter.init(film);
      this.#filmPresenter.set(film.id, filmPresenter);
    };

    films.forEach((film) => renderFilm(film));
  };

  #renderShowMoreButtonComponent = () => {
    this.#showMoreButtonComponent = new ShowMoreButtonView();
    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);
    render(this.#showMoreButtonComponent, this.#filmBoard);
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearFilmsContainer({ resetRenderedFilmsCount: true });
    this.#renderFilmsContainer();
  };

  #handleShowMoreButtonClick = () => {
    const filmsCount = this.films.length;
    const newRenderedFilmsCount = Math.min(filmsCount, this.#renderedFilmsCount + FILMS_COUNT_PER_STEP);
    const films = this.films.slice(this.#renderedFilmsCount, newRenderedFilmsCount);

    this.#renderFilms(films);
    this.#renderedFilmsCount = newRenderedFilmsCount;

    if (this.#renderedFilmsCount >= filmsCount) {
      remove(this.#showMoreButtonComponent);
    }
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    try {
      switch (actionType) {
        case UserAction.UPDATE_FILM:
          await this.#filmsModel.updateFilm(updateType, update);
          break;
        case UserAction.DELETE_COMMENT:
          await this.#commentsModel.deleteComment(updateType, update);
          break;
        case UserAction.ADD_COMMENT:
          await this.#commentsModel.addComment(updateType, update);
          break;
      }
    } catch {
      this.#filmPresenter.get(update.film.id).setAborting(actionType, update.commentId);
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        filterPresenter.init();
        this.#filmPresenter.get(data.id).init(data);

        if (document.querySelector('.film-details')) {
          this.#filmPresenter.get(data.id).updatePopup(data, PopupUpdateType.FILM);
          break;
        }

        this.#clearFilmsContainer();
        this.#renderFilmsContainer();
        break;
      case UpdateType.MINOR:
        this.#filmPresenter.get(data.film.id).updatePopup(data.comments, PopupUpdateType.COMMENT);
        break;
      case UpdateType.MAJOR:
        this.#clearFilmsContainer({ resetRenderedFilmsCount: true, resetSortType: true });
        this.#renderFilmsContainer();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        this.#clearFilmsContainer();
        this.#renderFilmsContainer();
        break;
    }
  };
}
