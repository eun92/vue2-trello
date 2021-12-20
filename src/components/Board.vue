<template>
  <div>
    <div v-if="loading">loading...</div>
    <div v-else class="board-wrapper">
      <!-- <pre>{{ board }}</pre> -->
      <div class="board">
        <div class="board-header">
          <input
            type="text"
            class="form-control"
            v-if="isEditTitle"
            v-model="inputTitle"
            ref="inputTitle"
            @keyup.enter="onSubmitTitle"
            @blur="onSubmitTitle"
          />
          <span class="board-title" @click="onClickTitle" v-else>
            {{ board.title }}
          </span>
          <a
            href=""
            class="board-header-btn show-menu"
            @click.prevent="onShowSettings"
            >...Show Menu</a
          >
        </div>
        <div class="list-section-wrapper">
          <div class="list-section">
            <div class="is-draggable-container">
              <div
                class="list-wrapper"
                v-for="list in board.lists"
                :key="list.pos"
                :data-list-id="list.id"
              >
                <List :data="list" />
              </div>
            </div>
            <div class="list-wrapper">
              <AddList />
            </div>
          </div>
        </div>
      </div>
    </div>
    <BoardSettings v-if="isShowBoardSettings" />
    <!-- card 상세 : Card.vue 컴포넌트 -->
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import List from "./List.vue";
import AddList from "./AddList.vue";
import dragger from "../utils/dragger.js";
import BoardSettings from "../components/BoardSettings.vue";

export default {
  components: {
    List,
    BoardSettings,
    AddList
  },
  data() {
    return {
      loading: false,
      lDragger: null,
      cDragger: null,
      isEditTitle: false,
      inputTitle: ""
    };
  },
  computed: {
    ...mapState({
      board: "board",
      isShowBoardSettings: "isShowBoardSettings"
    })
  },
  created() {
    this.fetchData().then(() => {
      this.inputTitle = this.board.title;
      this.SET_THEME(this.board.bgColor);
    });
    this.SET_IS_SHOW_BOARD_SETTINGS(false);
  },
  mounted() {},
  updated() {
    this.setCardDraggable();
    this.setListDraggable();
  },
  methods: {
    ...mapMutations(["SET_THEME", "SET_IS_SHOW_BOARD_SETTINGS"]),
    ...mapActions([
      "FETCH_BOARD",
      "UPDATE_CARD",
      "UPDATE_BOARD",
      "UPDATE_LIST"
    ]),
    fetchData() {
      this.loading = true;
      return this.FETCH_BOARD({ id: this.$route.params.bid }).then(() => {
        this.loading = false;
      });
    },
    onClickTitle() {
      this.isEditTitle = true;
      this.$nextTick(_ => this.$refs.inputTitle.focus());
    },
    onSubmitTitle() {
      this.isEditTitle = false;

      this.inputTitle = this.inputTitle.trim();
      if (!this.inputTitle) return;

      const id = this.board.id;
      const title = this.inputTitle;
      if (this.board.title === title) return;

      this.UPDATE_BOARD({ id, title });
    },
    onShowSettings() {
      this.SET_IS_SHOW_BOARD_SETTINGS(true);
    },
    setCardDraggable() {
      if (this.cDragger) this.cDragger.destroy();

      this.cDragger = dragger.init(
        Array.from(document.querySelectorAll(".card-list"))
      );

      this.cDragger.on("drop", (el, wrapper, target, sibling) => {
        // debugger;
        const targetCard = {
          id: el.dataset.cardId * 1, // 문자열이니까 숫자로 바꾸기 위해 곱하기 1
          pos: 65535 // 기본값
        };

        const { prev, next } = dragger.sibling({
          el,
          wrapper,
          candidates: Array.from(wrapper.querySelectorAll(".card-item")),
          type: "card"
        });

        // 움직이는 카드(targetCard)가 맨 앞으로 오면 다음 카드의 절반 값을 가짐
        if (!prev && next) targetCard.pos = next.pos / 2;
        // 움직이는 카드(targetCard)가 맨 뒤로 오면 이전 카드의 두 배값을 가짐
        else if (prev && !next) targetCard.pos = prev.pos * 2;
        // 움직이는 카드(targetCard)가 중간으로 오면 이전, 다음 카드를 더한 값의 절반 값을 가짐
        else if (prev && next) targetCard.pos = (prev.pos + next.pos) / 2;

        this.UPDATE_CARD(targetCard);
        console.log(targetCard);
      });
    },
    setListDraggable() {
      if (this.lDragger) this.lDragger.destroy();

      // const options = {
      //   invalid: (el, handle) => !/^list/.contains(handle.className)
      // };

      this.lDragger = dragger.init(
        Array.from(this.$el.querySelectorAll(".is-draggable-container"))
      );

      this.lDragger.on("drop", (el, wrapper, target, sibling) => {
        // debugger;
        const targetList = {
          id: el.dataset.listId * 1, // 문자열이니까 숫자로 바꾸기 위해 곱하기 1
          pos: 65535 // 기본값
        };

        const { prev, next } = dragger.sibling({
          el,
          wrapper,
          candidates: Array.from(wrapper.querySelectorAll(".list")),
          type: "list"
        });

        // 움직이는 카드(targetList)가 맨 앞으로 오면 다음 카드의 절반 값을 가짐
        if (!prev && next) targetList.pos = next.pos / 2;
        // 움직이는 카드(targetList)가 맨 뒤로 오면 이전 카드의 두 배값을 가짐
        else if (prev && !next) targetList.pos = prev.pos * 2;
        // 움직이는 카드(targetList)가 중간으로 오면 이전, 다음 카드를 더한 값의 절반 값을 가짐
        else if (prev && next) targetList.pos = (prev.pos + next.pos) / 2;

        this.UPDATE_LIST(targetList);
        console.log(targetList);
      });
    }
  }
};
</script>

<style>
.board-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
.board {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.board-header {
  flex: none;
  padding: 8px 4px 8px 8px;
  margin: 0;
  height: 32px;
  line-height: 32px;
}
.board-header input[type="text"] {
  width: 200px;
}
.board-header-btn {
  border-radius: 4px;
  padding: 2px 10px;
  height: 30px;
  margin-bottom: 15px;
  display: inline-block;
  color: #fff;
}
.board-header-btn:hover,
.board-header-btn:focus {
  background-color: rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
.board-title {
  font-weight: 700;
  font-size: 18px;
}
.show-menu {
  font-size: 14px;
  position: absolute;
  right: 15px;
}
.list-section-wrapper {
  flex-grow: 1;
  position: relative;
}
.list-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding: 0 10px;
  display: flex;
}
.list-wrapper {
  flex-shrink: 0;
  display: inline-block;
  height: 100%;
  width: 272px;
  vertical-align: top;
  margin-right: 5px;
}
.card-item.gu-transit {
  background-color: #555 !important;
}
.card-item.gu-mirror {
  opacity: 1 !important;
  background-color: #fff !important;
  transform: rotate(3deg) !important;
}
</style>
