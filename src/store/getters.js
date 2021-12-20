const getters = {
  isAuth(state) {
    return !!state.token; // token 값이 있으면 true, 없으면 false 반환
  }
};

export default getters;
