import AbstractView from '../framework/view/abstract-view.js';

const createFilmsBoardView = () => (
  `<section class="films">
    <section class="films-list"></section>
  </section >`
);

export default class FilmBoardView extends AbstractView {
  get template() {
    return createFilmsBoardView();
  }
}
