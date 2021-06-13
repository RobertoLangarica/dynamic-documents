<template>
  <div class="row justify-center">
    <h1 class="col-12 text-center">
      Login
    </h1>
    <form class="col-12 row justify-center">
      <q-input v-model="email" class="col-7" label="Email" autocomplete="username" />
      <q-input v-model="password" class="col-7 q-mt-xl" label="Password" type="password" autocomplete="current-password" />
      <q-btn label="login" class="col-7" color="primary" @click.prevent="onSend" />
    </form>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props:{
    redirect: {type: String,default: null,required: false}
  },
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    async onSend() {
      let result = await this.$store.dispatch('session/login', { email: this.email, password: this.password })
      if (result.success) {
        
        if (this.redirect) {
          this.$router.push({ path: this.redirect })
        } else {
          this.$router.push({ name: "index" });
        }
      }
    }
  }
};
</script>
