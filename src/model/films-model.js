import Observable from '../framework/observable.js';
import { adaptToClient } from '../adapter/adapt-to-client.js';
import { UpdateType } from '../const.js';

export default class FilmsModel extends Observable {
  #films = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  init = async () => {
    try {
      const films = await this.#apiService.films;
      this.#films = films.map(adaptToClient);
    } catch (error) {
      this.#films = [];
    }

    this._notify(UpdateType.INIT);
  };

  get films() {
    return this.#films;
  }

  updateFilm = async (updateType, update) => {
    const index = this.films.findIndex((film) => film.id === update.film.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting film');
    }

    try {
      const response = await this.#apiService.updateFilm(update.film);
      const updatedFilm = adaptToClient(response);

      this.#films = [
        ...this.films.slice(0, index),
        updatedFilm,
        ...this.films.slice(index + 1),
      ];

      this._notify(updateType, update.film);
    } catch (err) {
      throw new Error('Can\'t update film');
    }
  };
}
