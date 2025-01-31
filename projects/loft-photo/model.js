const PERM_FRIENDS = 2;
const PERM_PHOTOS = 4;
const APP_IP = 5350105;


import { rejects } from "assert";
import loginPage from "./loginPage";
import { resolve } from "path";

export default {
  getRandomElement(array) {
    if (!array.length) {
      return null;
    }

    const index = Math.round(Math.random() * (array.length - 1));

    return array[index];
  },

  async getNextPhoto() {
    const friend = this.getRandomElement(this.friends.items);
    const photos = await this.getFriendsPhotos(friend.id);
    const photo = this.getRandomElement(photos.items);
    const size = this.findSize(photo);

    return { friend, id: photo.id, url: size.url };
  },

  findSize(photo) {
    const size = photo.size.find((size) => size.width >= 360);

    if (!size) {
      return photo.size.reduce((biggest, current) => {
        if (current.width > biggest.width) {
          return current;
        }

        return biggest;
      }, photo.size[0]);
    }

    return size;
  },

  async init() {
    this.photoCache = {};
    this.friends = await this.getFriends();
    [this.me] = await this.getUsers();
  },

  login() {
    return new Promise((resolve,reject) => {
      VK.init({
        apiId: APP_IP,
      });

      VK.Auth.login((response) => {
        if (response.session) {
          resolve(response);
        } else {
          console.error(response);
          reject(response);
        }
        
      }, PERM_FRIENDS | PERM_PHOTOS);
    });
  },

  logout() {
    return new Promise((resolve) => VK.Auth.revokeGrants(resolve));
  },

  callApi(method, params) {
    params.v = params.v || '5.120';

    return new Promise( (resolve, reject) => {
      VK.api(method, params, (response) => {
        if (response.error) {
          reject(new Error(response.error.error_msg));
        } else {
          resolve(response.response);
        }
      });
    });
  },

  getFriends() {
    const params = {
      friends: ['photo_50', 'photo_100'],
    };

    return this.callApi('friends.get', params);
  },

  getPhotos(owner) {
    const params = {
      owner_id: owner,
    };

    return this.callApi('photos.getAll', params);
  },

  getUsers(ids) {
    const params = {
      fields: ['photo_50', 'photo_100'], 
    };

    if (ids) {
      params.user_ids = ids;
    }

    return this.callApi('users.get', params);
  },

  async getFriendsPhotos(id) {

  let photos = this.photoCache[id];

  if (photos) {
    return photos;
  }

  photos = await this.getPhotos(id);

  this.photoCache[id] = photos;

  return photos;
},
};



