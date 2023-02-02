import { render, replace, remove, RenderPosition } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import UserRankView from '../view/user-rank-view.js';
import { filter } from '../filter-utils.js';
import { FilterType, UpdateType } from '../const.js';

const headerElement = document.querySelector('header');

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #filmsModel = null;

  #filterComponent = null;
  #headerComponent = null;

  constructor(filterContainer, filterModel, filmsModel) {
    this.#filterContainer = filterContainer;

    this.#filterModel = filterModel;
    this.#filmsModel = filmsModel;

    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    const films = this.#filmsModel.films;

    return [
      {
        type: FilterType.ALL,
        name: 'All',
        count: filter[FilterType.ALL](films).length,
      },
      {
        type: FilterType.WATCHLIST,
        name: 'Watchlist',
        count: filter[FilterType.WATCHLIST](films).length,
      },
      {
        type: FilterType.HISTORY,
        name: 'History',
        count: filter[FilterType.HISTORY](films).length,
      },
      {
        type: FilterType.FAVORITES,
        name: 'Favorites',
        count: filter[FilterType.FAVORITES](films).length,
      },
    ];
  }

  init = () => {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView(filters, this.#filterModel.filter);
    this.#filterComponent.setFilterTypeChangeHandler(this.#handleFilterTypeChange);

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    this.#renderHeader();
    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  };

  #renderHeader = () => {
    const getRank = (filmsCount) => {
      const UserRank = {
        Empty: '',
        Novice: 'Novice',
        Fan: 'Fan',
        MovieBuff: 'Movie buff'
      };

      if (filmsCount === 0) {
        return UserRank.Empty;
      } else if (filmsCount > 0 && filmsCount < 11) {
        return UserRank.Novice;
      } else if (filmsCount > 10 && filmsCount < 21) {
        return UserRank.Fan;
      } else {
        return UserRank.MovieBuff;
      }
    };

    const watchedFilmsCount = this.filters.find((item) => (item.type === FilterType.HISTORY)).count;

    const prevHeaderComponent = this.#headerComponent;
    this.#headerComponent = new UserRankView(getRank(watchedFilmsCount));

    if (prevHeaderComponent === null) {
      render(this.#headerComponent, headerElement);
    } else {
      replace(this.#headerComponent, prevHeaderComponent);
      remove(prevHeaderComponent);
    }
  };

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
