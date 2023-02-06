import { render, replace, remove } from '../framework/render.js';
import FilmCardView from '../view/film-card-view.js';
import PopupView from '../view/popup-view.js';
import { UserAction, UpdateType, PopupUpdateType } from '../const.js';

export default class FilmPresenter {
  #film = null;
  #filmsContainer = null;
  #filmComponent = null;
  #popupComponent = null;

  #commentsModel = null;

  #changeData = null;

  constructor(filmsContainer, commentsModel, changeData) {
    this.#filmsContainer = filmsContainer;
    this.#commentsModel = commentsModel;
    this.#changeData = changeData;
  }

  init = async (film) => {
    this.#film = film;
    const prevFilmComponent = this.#filmComponent;

    const setFilmHandlers = () => {
      const onFilmCardClickHandler = async () => {
        const removePopup = () => {
          remove(this.#popupComponent);
          document.body.classList.remove('hide-overflow');
        };

        const escKeyDownHandler = (evt) => {
          if (evt.key === 'Escape' || evt.key === 'Esc') {
            evt.preventDefault();
            removePopup();
            document.removeEventListener('keydown', escKeyDownHandler);
          }
        };

        const popupCloseButtonClickHandler = () => {
          removePopup();
          document.removeEventListener('keydown', escKeyDownHandler);
        };

        const setPopupHandlers = () => {
          document.addEventListener('keydown', escKeyDownHandler);
          this.#popupComponent.setCloseButtonClickHandler(popupCloseButtonClickHandler);
          this.#popupComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
          this.#popupComponent.setHistoryClickHandler(this.#handleHistoryClick);
          this.#popupComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
          this.#popupComponent.setDeleteButtonClickHandler(this.#handleDeleteButtonClick);
          this.#popupComponent.setSendCommentHandler(this.#handleCommentSend);
        };

        if (this.#popupComponent) {
          removePopup();
        }

        await this.#commentsModel.init(this.#film.id);

        this.#popupComponent = new PopupView(this.#film, this.#commentsModel.comments);
        setPopupHandlers();
        document.body.classList.add('hide-overflow');
        document.body.appendChild(this.#popupComponent.element);
      };

      this.#filmComponent.setClickHandler(onFilmCardClickHandler);
      this.#filmComponent.setWatchlistClickHandler(this.#handleWatchlistClick);
      this.#filmComponent.setHistoryClickHandler(this.#handleHistoryClick);
      this.#filmComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    };

    this.#filmComponent = new FilmCardView(this.#film);
    setFilmHandlers();

    if (prevFilmComponent) {
      replace(this.#filmComponent, prevFilmComponent);
    } else {
      render(this.#filmComponent, this.#filmsContainer.element);
    }
  };

  destroy = () => {
    remove(this.#filmComponent);
    remove(this.#popupComponent);
  };

  updatePopup = (update, updateType) => {
    const currentScrollPosition = this.#popupComponent.element.scrollTop;

    switch (updateType) {
      case PopupUpdateType.FILM:
        this.#popupComponent.updateElement({ film: update });
        break;
      case PopupUpdateType.COMMENT:
        this.#popupComponent.updateElement({
          comments: update,
          checkedEmoji: null,
          userComment: null,
          isFormDisabled: false
        });
        break;
    }

    this.#popupComponent.element.scroll(0, currentScrollPosition);
  };

  setAborting = (actionType, commentId) => {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        if (this.#popupComponent) {
          this.#popupComponent.shakeControls();
        } else {
          this.#filmComponent.shakeControls();
        }
        break;
      case UserAction.DELETE_COMMENT:
        this.#popupComponent.shakeComment(commentId);
        break;
      case UserAction.ADD_COMMENT:
        this.#popupComponent.shakeForm();
        break;
    }
  };

  #handleDeleteButtonClick = (commentId) => {
    this.#changeData(UserAction.DELETE_COMMENT, UpdateType.MINOR, { film: this.#film , commentId });
  };

  #handleCommentSend = (comment) => {
    this.#changeData(UserAction.ADD_COMMENT, UpdateType.MINOR, { film: this.#film, comment });
  };

  #handleWatchlistClick = () => {
    this.#film.userDetails.watchlist = !this.#film.userDetails.watchlist;
    this.#changeData(UserAction.UPDATE_FILM, UpdateType.PATCH, { film: this.#film });
  };

  #handleHistoryClick = () => {
    this.#film.userDetails.alreadyWatched = !this.#film.userDetails.alreadyWatched;
    this.#changeData(UserAction.UPDATE_FILM, UpdateType.PATCH, { film: this.#film });
  };

  #handleFavoriteClick = () => {
    this.#film.userDetails.favorite = !this.#film.userDetails.favorite;
    this.#changeData(UserAction.UPDATE_FILM, UpdateType.PATCH, { film: this.#film });
  };
}
