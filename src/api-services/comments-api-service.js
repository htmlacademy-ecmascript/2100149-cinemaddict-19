import ApiService from '../framework/api-service';
import { Method } from '../const';

export default class CommentsApiService extends ApiService {
  getComments = async (filmId) => await this._load({ url: `comments/${filmId}` }).then(ApiService.parseResponse);

  deleteComment = async (commentId) => await this._load({ url: `comments/${commentId}`, method: Method.DELETE });

  addComment = async (comment, filmId) =>
    await this._load({
      url: `comments/${filmId}`,
      method: Method.POST,
      body: JSON.stringify(comment),
      headers: new Headers({
        'Content-Type': 'application/json'})
    })
      .then(ApiService.parseResponse);
}
