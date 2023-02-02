export const adaptToClient = (film) => {
  const adaptedFilm = {
    ...film,
    filmInfo: {
      ...film['film_info'],
      alternativeTitle: film['film_info']['alternative_title'],
      totalRating: film['film_info']['total_rating'],
      ageRating: film['film_info']['age_rating'],
      genres: film['film_info']['genre'],
      release: {
        ...film['film_info']['release'],
        releaseСountry: film['film_info']['release']['release_country']
      }
    },

    userDetails: {
      ...film['user_details'],
      alreadyWatched: film['user_details']['already_watched'],
      watchingDate: film['user_details']['watching_date']
    }
  };

  delete adaptedFilm['film_info'];
  delete adaptedFilm.filmInfo['alternative_title'];
  delete adaptedFilm.filmInfo['total_rating'];
  delete adaptedFilm.filmInfo['age_rating'];
  delete adaptedFilm.filmInfo['genre'];
  delete adaptedFilm.filmInfo.release['release_country'];

  delete adaptedFilm['user_details'];
  delete adaptedFilm.userDetails['already_watched'];
  delete adaptedFilm.userDetails['watching_date'];

  return adaptedFilm;
};
