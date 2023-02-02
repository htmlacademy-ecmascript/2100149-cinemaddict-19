import Observable from '../framework/observable.js';
import { adaptToClient } from '../adapter/adapt-to-client.js';
import { UpdateType } from '../const.js';

export default class CommentsModel extends Observable {
  #filmsModel = null;
  #comments = [];
  #apiService = null;

  constructor(filmsModel, apiService) {
    super();
    this.#filmsModel = filmsModel;
    this.#apiService = apiService;
  }

  init = async(filmId) => {
    await this.#apiService.getComments(filmId).then((response) => {
      this.#comments = response;
    });
  };

  get comments() {
    return this.#comments;
  }

  deleteComment = async (updateType, update) => {
    const index = this.#comments.findIndex((comment) => comment.id === update.commentId);

    const updatedFilm = update.film;
    updatedFilm.comments = updatedFilm.comments.filter((comment) => comment !== update.commentId);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting comment');
    }
    try {
      await this.#apiService.deleteComment(update.commentId);

      this.#comments = [
        ...this.#comments.slice(0, index),
        ...this.#comments.slice(index + 1),
      ];

      this._notify(updateType, { film: update.film, comments: this.#comments });
      this.#filmsModel.updateFilm(UpdateType.PATCH, { film: updatedFilm });
    } catch (err) {
      throw new Error('Can\'t delete comment');
    }
  };

  addComment = async (updateType, update) => {
    try {
      const response = await this.#apiService.addComment(update.comment, update.film.id);
      const updatedFilm = adaptToClient(response.movie);
      this.#comments = response.comments;

      this._notify(updateType, { film: updatedFilm, comments: this.#comments });
      this.#filmsModel.updateFilm(UpdateType.PATCH, { film: updatedFilm });
    } catch (err) {
      throw new Error('Can\'t add comment');
    }
  };
}
