import ApiService from '../framework/api-service';
import { Method } from '../const';

export default class FilmsApiService extends ApiService {
  get films() {
    return this._load({ url: 'movies' }).then(ApiService.parseResponse);
  }

  updateFilm = async (film) => {
    const response = await this._load({
      url: `movies/${film.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(film)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  };

  #adaptToServer = (film) => {
    const adaptedFilm = {
      ...film,
      'film_info': {
        ...film['filmInfo'],
        'alternative_title': film['filmInfo']['alternativeTitle'],
        'total_rating': film['filmInfo']['totalRating'],
        'age_rating': film['filmInfo']['ageRating'],
        'genre': film['filmInfo']['genres'],
        release: {
          ...film['filmInfo']['release'],
          'release_country': film['filmInfo']['release']['releaseСountry']
        }
      },

      'user_details': {
        ...film['userDetails'],
        'already_watched': film['userDetails']['alreadyWatched'],
        'watching_date': film['userDetails']['watchingDate']
      }
    };

    delete adaptedFilm['filmInfo'];
    delete adaptedFilm['film_info']['alternativeTitle'];
    delete adaptedFilm['film_info']['totalRating'];
    delete adaptedFilm['film_info']['ageRating'];
    delete adaptedFilm['film_info']['genres'];
    delete adaptedFilm['film_info']['release']['releaseСountry'];

    delete adaptedFilm['userDetails'];
    delete adaptedFilm['user_details']['alreadyWatched'];
    delete adaptedFilm['user_details']['watchingDate'];

    return adaptedFilm;
  };
}
