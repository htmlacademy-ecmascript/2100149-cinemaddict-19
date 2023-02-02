import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const createFilterView = (filters, currentFilterType) => {
  const getCount = (filterType) => filters.find((filter) => (filter.type === filterType)).count;

  return `<nav class="main-navigation">
    <a href="#all" class="main-navigation__item ${currentFilterType === FilterType.ALL ? 'main-navigation__item--active' : ''}" data-filter-type="${FilterType.ALL}">All movies</a>
    <a href="#watchlist" class="main-navigation__item ${currentFilterType === FilterType.WATCHLIST ? 'main-navigation__item--active' : ''}" data-filter-type="${FilterType.WATCHLIST}">Watchlist <span class="main-navigation__item-count">${getCount(FilterType.WATCHLIST)}</span></a>
    <a href="#history" class="main-navigation__item ${currentFilterType === FilterType.HISTORY ? 'main-navigation__item--active' : ''}" data-filter-type="${FilterType.HISTORY}">History <span class="main-navigation__item-count">${getCount(FilterType.HISTORY)}</span></a>
    <a href="#favorites" class="main-navigation__item ${currentFilterType === FilterType.FAVORITES ? 'main-navigation__item--active' : ''}" data-filter-type="${FilterType.FAVORITES}">Favorites <span class="main-navigation__item-count">${getCount(FilterType.FAVORITES)}</span></a>
  </nav>`;
};

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;

  constructor(filters, currentFilterType) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilterType;
  }

  get template() {
    return createFilterView(this.#filters, this.#currentFilter);
  }

  setFilterTypeChangeHandler = (callback) => {
    this._callback.filterTypeChange = callback;
    this.element.querySelectorAll('A').forEach((item) => item.addEventListener('click', this.#filterTypeChangeHandler));
    this.element.querySelectorAll('SPAN').forEach((item) => item.addEventListener('click', this.#filterTypeChangeHandler));
  };

  #filterTypeChangeHandler = (evt) => {
    if (evt.target.tagName === 'A') {
      evt.preventDefault();
      this._callback.filterTypeChange(evt.target.dataset.filterType);
    } else if (evt.target.tagName === 'SPAN') {
      evt.preventDefault();
      this._callback.filterTypeChange(evt.target.parentElement.dataset.filterType);
    }
  };
}
