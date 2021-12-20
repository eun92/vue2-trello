<template>
  <Modal>
    <div slot="header">
      <h2>
        Craet New Board
        <a
          href=""
          class="modal-default-button"
          @click.prevent="SET_IS_ADD_BOARD(false)"
        >
          &times;
        </a>
      </h2>
    </div>
    <div slot="body">
      <form id="add-board-form" @submit.prevent="addBoard">
        <input type="text" class="form-control" v-model="input" ref="input" />
      </form>
    </div>
    <div slot="footer">
      <button
        class="btn"
        :class="{ 'btn-success': valid }"
        type="submit"
        form="add-board-form"
        :disabled="!valid"
      >
        Create Board
      </button>
    </div>
  </Modal>
</template>

<script>
import Modal from "./Modal.vue";
import { mapMutations, mapActions } from "vuex";

export default {
  components: {
    Modal
  },
  data() {
    return {
      input: "",
      valid: false
    };
  },
  watch: {
    input(v) {
      this.valid = v.trim().length > 0;
    }
  },
  mounted() {
    this.$refs.input.focus();
  },
  methods: {
    ...mapMutations(["SET_IS_ADD_BOARD"]),
    ...mapActions(["ADD_BOARD"]),
    addBoard() {
      this.ADD_BOARD({ title: this.input })
        .then(({ id }) => {
          this.$router.push(`/b/${id}`);
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.SET_IS_ADD_BOARD(false);
        });
    }
  }
};
</script>

<style></style>
