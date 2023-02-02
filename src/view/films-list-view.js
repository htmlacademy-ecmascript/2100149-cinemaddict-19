import AbstractView from '../framework/view/abstract-view.js';

const createFilmsListView = () => '<div class="films-list__container"></div>';

export default class FilmListView extends AbstractView {
  get template() {
    return createFilmsListView();
  }
}
