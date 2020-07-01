<template>
  <div class="row justify-center">
    <div class="row q-col-gutter-y-md col-8 justify-center">
      <h1 class="col-12 text-center">Login</h1>
      <nq-input v-model="email" class="col-8" label="email" hint="Correo para ingresar" />
      <nq-input
        v-model="password"
        class="col-8"
        type="password"
        label="password"
        hint="Contraseña"
      />
      <q-btn color="primary" label="login" @click="onSend" class="col-8 q-mt-lg" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
var localStorage = require("localStorage");

export default {
  data() {
    return {
      email: "roberto.langarica@gmail.com",
      password: "roberto.langarica"
    };
  },
  methods: {
    async onSend() {
      let result = await this.$api.post("/login", {
        email: this.email,
        password: this.password
      });

      if (result.success) {
        this.$api.setAuthorization(result.data.token);
        localStorage.setItem("token", result.data.token);
        this.$router.push({ name: "secrets" });
      }
    }
  }
};
</script>
