import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://databankvanguard-b3d326c04ab4.herokuapp.com/finance/',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default instance;
