import Vue from "vue";
import axios from "axios";
import { MessageBox } from "element-ui";
const TOKEN_KEY = "KKB_USER_TOKEN";
const server = axios.create({
  baseURL: "/api"
});

export default ({ store, redirect }) => {
  server.interceptors.request.use(
    config => {
      const token = window.localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.common["authorization"] = "Bearer " + token;
      }
      return config;
    },
    err => {
      return Promise.reject(err);
    }
  );

  server.interceptors.response.use(
    response => {
      const { data, config } = response;
      if (data.code === 0) {
        if (config.url === "/user/login") {
          localStorage.setItem(TOKEN_KEY, data.data.token);
        }
      } else if (data.code === -666) {
        MessageBox.confirm("登录过期了", "登录", {
          confirmButtonText: '登录',
          showCancelButton: false,
          type: "warning"
        }).then(() => {
          localStorage.removeItem(TOKEN_KEY);
          redirect({ path: "/login" });
        });
      }
      return data;
    },
    err => {
      return Promise.reject(err);
    }
  );
};

Vue.prototype.$http = server;
export const http = server;
