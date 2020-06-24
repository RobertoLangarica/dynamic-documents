<template>
  <div class="row col-12 window-width justify-center" style="width:100%">
    <div class="row col-8 q-col-gutter-sm q-mt-lg">
      <nq-input class="col-12" label="API Secret" disable v-model="secret">
        <template v-slot:append>
          <q-btn
            :label="active_secret?'Active':'Disabled'"
            :color="active_secret?'green':'red'"
            size="xs"
          />
        </template>
      </nq-input>

      <div class="col-3 row">
        <q-btn class="col-12" color="primary" label="Create" @click="onCreate" />
      </div>
      <div class="col-3 row">
        <q-btn class="col-12" color="orange-3" label="Disable" @click="onDisable" />
      </div>
      <div class="col-3 row">
        <q-btn class="col-12" color="red" label="Forgot" @click="onForgot" />
      </div>

      <div class="col-12 row q-mt-lg">
        <div class="col-4 row q-py-xs">
          <q-btn class="col-12" color="secondary" label="Set IP" @click="setIP" />
        </div>
        <nq-input class="col-8 q-pl-md" label="Allowed IP:" v-model="ip"></nq-input>
      </div>
      <nq-input class="col-12" :label="label" disable borderless v-model="usedContent" />

      <div class="col-12 row justify-end q-mt-xl">
        <q-btn
          class="col-auto"
          color="secondary"
          label="Go to login"
          to="/login"
          icon="arrow_back"
        />
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
var localStorage = require("localStorage");

export default {
  data() {
    return {
      active_secret: false,
      secret: "00000000-0000-0000-0000-000000000000",
      ip: "",
      label: "",
      usedContent: ""
    };
  },
  mounted() {
    this.checkForToken();
    this.setSecret(localStorage.getItem("secret"));
  },
  methods: {
    async onCreate() {
      let result = await this.$api.post("/secret/create", { ip: this.ip });
      if (result.success) {
        this.setSecret(result.data);
      }
      this.notify(!result.success);
    },
    async onDisable() {
      let result = await this.$api.patch("/secret/disable");
      if (result.success) {
        let secret = this.secret;
        this.setSecret();
        this.secret = secret;
      }
      this.notify(!result.success);
    },
    async setIP() {
      let result = await this.$api.patch("/secret/add-ip", { ip: this.ip });
      this.notify(!result.success);
    },
    checkForToken() {
      let token = localStorage.getItem("token");
      if (!token) {
        this.$router.push({ name: "login" });
      } else {
        this.label = "Using Token:";
        this.usedContent = token;
        this.$api.setAuthorization(token);
      }
    },
    setSecret(secret) {
      if (secret && secret !== "") {
        this.secret = secret;
        this.active_secret = true;
        localStorage.setItem("secret", secret);
        this.$api.setAuthorization(secret);

        this.label = "Using Secret:";
        this.usedContent = secret;
      } else {
        this.active_secret = false;
        this.secret = "00000000-0000-0000-0000-000000000000";
        localStorage.setItem("secret", "");
        this.$api.setAuthorization("");

        this.label = "Using N/A:";
        this.usedContent = "";
      }
    },
    onForgot() {
      this.setSecret();
      this.checkForToken();
    },
    notify(error) {
      this.$q.notify({
        message: error ? "An error ocurred." : "Done",
        color: error ? "red" : "primary"
      });
    }
  }
};
</script>