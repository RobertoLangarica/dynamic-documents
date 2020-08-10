<template>
  <div class="row justify-center">
    <div class="row q-col-gutter-y-md col-12 justify-center">
      <h1 class="col-12 text-center">
        Login
      </h1>
      <q-input v-model="token" class="col-8" label="Token" />
      <div class="col-8 row">
        <q-btn label="Use Token" class="col-4" color="primary" @click="useToken" />
      </div>

      <q-input v-model="secret" class="col-8 q-mt-xl" label="API Secret" />
      <div class="col-8 row">
        <q-btn label="Use API Secret" class="col-4" color="green" @click="useSecret" />
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  data() {
    return {
      email: "roberto.langarica@gmail.com",
      password: "roberto.langarica"
    };
  },
  mounted() {
    this.$store.commit("init");
  },
  computed: {
    token: {
      get: function() {
        return this.$store.state.login.token;
      },
      set: function(value) {
        this.$store.commit("token", value);
      }
    },
    secret: {
      get: function() {
        return this.$store.state.login.secret;
      },
      set: function(value) {
        this.$store.commit("secret", value);
      }
    }
  },
  methods: {
    useToken() {
      this.$api.setAuthorization(this.token);
      this.$router.push({ name: "index" });
    },
    useSecret() {
      this.$api.setAuthorization(this.secret, "APIKey");
      this.$router.push({ name: "index" });
    },
    async onSend() {
      let result = await this.$api.post("/login", {
        email: this.email,
        password: this.password
      });

      if (result.success) {
        this.$api.setAuthorization(result.data.token);
        LocalStorage.set("token", result.data.token);
        this.$router.push({ name: "secrets" });
      }
    }
  }
};
</script>
