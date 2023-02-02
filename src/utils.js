import dayjs from 'dayjs';

const humanizeDate = (date, format) => dayjs(date).format(format);

const humanizeFilmRuntime = (minutes) => {
  const hourDuration = 60;
  let filmRuntime = `${minutes}m`;

  if (minutes >= hourDuration) {
    const hours = Math.trunc(minutes / hourDuration);
    minutes = minutes % hourDuration;
    filmRuntime = `${hours}h ${minutes}m`;
  }

  return filmRuntime;
};

const sortByDate = (filmA, filmB) => (dayjs(filmB.filmInfo.release.date).diff(dayjs(filmA.filmInfo.release.date)));

const sortByRating = (filmA, filmB) => (filmB.filmInfo.totalRating - filmA.filmInfo.totalRating);

export { humanizeDate, humanizeFilmRuntime, sortByDate, sortByRating };
