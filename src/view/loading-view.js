import AbstractView from '../framework/view/abstract-view.js';

const createLoadingView = () => (
  `<section class="films-list">
      Loading...
  </section>`
);

export default class LoadingView extends AbstractView {
  get template() {
    return createLoadingView();
  }
}
