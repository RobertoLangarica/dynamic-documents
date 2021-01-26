<template>
  <div class="row justify-center">
    <div class="row q-col-gutter-y-md col-12 justify-center">
      <h1 class="col-12 text-center">
        Login
      </h1>
      <form>
      <q-input v-model="email" class="col-8" label="Email" />
      <q-input v-model="password" class="col-8 q-mt-xl" label="Password" secure/>
      <q-btn label="login" class="col-4" color="primary" @click.prevent="onSend" />
      </form>
    </div>
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
      email: "roberto.langarica@gmail.com",
      password: "roberto.langarica"
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
