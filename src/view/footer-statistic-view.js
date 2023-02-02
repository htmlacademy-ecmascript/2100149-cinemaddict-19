import AbstractView from '../framework/view/abstract-view.js';

const createFooterStatisticView = (filmsCount) => `<p>${filmsCount} movies inside</p>`;

export default class FooterStatisticView extends AbstractView {
  #filmsCount = null;

  constructor(filmsCount) {
    super();
    this.#filmsCount = filmsCount;
  }

  get template() {
    return createFooterStatisticView(this.#filmsCount);
  }
}
